-- Unified Multi-Agent System Database Schema
-- Combines tables for authentication, sessions, prompts, and page generation

-- ==========================================
-- AUTHENTICATION & SESSIONS TABLES
-- ==========================================

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create prompts table for storing prompts
CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  user_prompt TEXT,
  ai_response TEXT,
  jsx_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add computed column for jsx_code length
ALTER TABLE prompts
  ADD COLUMN IF NOT EXISTS jsx_length INT GENERATED ALWAYS AS (char_length(jsx_code)) STORED;

-- ==========================================
-- PAGE GENERATION TABLES
-- ==========================================

-- Create pages table for storing generated pages

CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  user_prompt TEXT NOT NULL,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  page_spec JSONB NOT NULL,
  component_graph JSONB NOT NULL,
  final_code TEXT NOT NULL,
  files_manifest JSONB, -- NEW: manifest of all files for Sandpack
  main_file TEXT,       -- NEW: entry file for Sandpack
  qa_report JSONB,
  review_result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create agent_logs table for tracking agent execution
CREATE TABLE IF NOT EXISTS agent_logs (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
  agent_name VARCHAR(100) NOT NULL,
  phase VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- success, failed, skipped
  input_data JSONB,
  output_data JSONB,
  execution_time INTEGER, -- milliseconds
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create qa_reports table for detailed QA tracking
CREATE TABLE IF NOT EXISTS qa_reports (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  passed_checks INTEGER NOT NULL,
  total_checks INTEGER NOT NULL,
  critical_issues JSONB DEFAULT '[]',
  check_results JSONB NOT NULL,
  recommendations JSONB DEFAULT '[]',
  analysis_type VARCHAR(50), -- comprehensive, automated-only
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create review_decisions table for tracking review outcomes
CREATE TABLE IF NOT EXISTS review_decisions (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
  decision VARCHAR(20) NOT NULL, -- approve, approve_with_notes, revise, reject
  approved BOOLEAN NOT NULL,
  quality_score INTEGER,
  reviewer_notes TEXT,
  revision_requests JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  review_type VARCHAR(50), -- ai_detailed_review, automated_approval, fallback_review
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create component_specs table for storing component blueprints
CREATE TABLE IF NOT EXISTS component_specs (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
  component_name VARCHAR(100) NOT NULL,
  component_type VARCHAR(50) NOT NULL,
  blueprint JSONB NOT NULL,
  styling JSONB,
  content JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES
-- ==========================================

-- Indexes for authentication and sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_updated ON sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_session_created ON prompts(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_search ON prompts USING gin(to_tsvector('english', user_prompt));
-- jsx_length generated column + index
-- ALTER TABLE prompts
--   ADD COLUMN IF NOT EXISTS jsx_length INT GENERATED ALWAYS AS (char_length(jsx_code)) STORED;
CREATE INDEX IF NOT EXISTS idx_prompts_jsx_length ON prompts(jsx_length);
-- ❌ removed idx_sessions_activity (was using CURRENT_DATE)
CREATE INDEX IF NOT EXISTS idx_prompts_created_user ON prompts(created_at DESC, session_id);

-- Indexes for page generation
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at);
CREATE INDEX IF NOT EXISTS idx_pages_user_prompt ON pages USING gin(to_tsvector('english', user_prompt));
CREATE INDEX IF NOT EXISTS idx_agent_logs_page_id ON agent_logs(page_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_name ON agent_logs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_logs_status ON agent_logs(status);
CREATE INDEX IF NOT EXISTS idx_qa_reports_page_id ON qa_reports(page_id);
CREATE INDEX IF NOT EXISTS idx_qa_reports_overall_score ON qa_reports(overall_score);
CREATE INDEX IF NOT EXISTS idx_review_decisions_page_id ON review_decisions(page_id);
CREATE INDEX IF NOT EXISTS idx_review_decisions_approved ON review_decisions(approved);
CREATE INDEX IF NOT EXISTS idx_component_specs_page_id ON component_specs(page_id);
CREATE INDEX IF NOT EXISTS idx_pages_session_id ON pages(session_id);

-- ==========================================
-- FUNCTIONS & VIEWS
-- ==========================================

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW page_summary AS
SELECT
  p.id,
  p.user_prompt,
  p.session_id,  -- Add session_id column
  p.page_spec,
  p.component_graph,
  p.final_code,
  p.qa_report,
  p.review_result,
  p.created_at,
  p.updated_at,
  p.page_spec->>'pageName' as page_name,
  p.page_spec->>'pageType' as page_type,
  qa.overall_score,
  rd.approved,
  rd.decision as review_decision,
  ARRAY_LENGTH(ARRAY(SELECT jsonb_array_elements(p.component_graph->'components')), 1) as component_count
FROM pages p
LEFT JOIN qa_reports qa ON p.id = qa.page_id
LEFT JOIN review_decisions rd ON p.id = rd.page_id;

-- Create view for agent performance analytics
CREATE OR REPLACE VIEW agent_performance AS
SELECT
  agent_name,
  phase,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE status = 'success') as successful_executions,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_executions,
  AVG(execution_time) as avg_execution_time,
  MAX(execution_time) as max_execution_time,
  MIN(execution_time) as min_execution_time
FROM agent_logs
GROUP BY agent_name, phase;

COMMENT ON SCHEMA public IS 'Unified Multi-Agent AI UI Generator Database Schema';
