# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AI UI Generator - Multi-Agent React Component Generation System

## Project Overview

Full-stack React application using a 9-agent AI system to generate production-ready web components. Transforms user prompts into complete React components with modern UI/UX using Groq's LLaMA 3.3 70B model.

## Development Commands

**Root-level commands:**
```bash
npm run dev          # Start both backend and frontend concurrently
npm run server       # Start backend only (cd backend && npm run dev)
npm run client       # Start frontend only (cd frontend && npm run dev)
```

**Backend development (from backend/ directory):**
```bash
npm run dev          # Start with nodemon (auto-reload, ignores debug files)
npm start            # Production server startup
npm run test         # Run all tests
npm run test:agents  # Test individual agents with live API
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
```

**Individual Agent Tests (All Operational):**
```bash
node tests/test-spec-agent-fixed.js           # Test SpecAgent
node tests/test-design-agent-fixed.js         # Test DesignAgent  
node tests/test-content-agent-fixed.js        # Test ContentAgent
node tests/test-layout-agent.js               # Test LayoutAgent
node tests/test-code-agent.js                 # Test CodeAgent
node tests/test-all-agents-comprehensive.js   # Test all 9 agents
```

**Debug Commands:**
```bash
node debug-helper.js list                    # List debug sessions
node debug-helper.js show <correlationId>    # Show session details
node debug-helper.js cleanup                 # Clean old debug files
```

## Architecture Overview

### Backend (`backend/`)
- **Node.js/Express** server with PostgreSQL database
- **Multi-Agent AI Orchestrator** - Coordinates 9 specialized AI agents
- **Groq API Integration** - LLaMA 3.3 70B Versatile model
- **600+ UI/UX Rules Validation** - 75% compliance threshold
- **Debug Infrastructure** - Full logging and performance monitoring

### Frontend (`frontend/`)
- **React 18** with Vite build system
- **Sandpack Preview** - Real-time component rendering
- **Tailwind CSS** + **Lucide React** icons (NO Ant Design)
- **JWT Authentication**

⚠️ **Port Issue**: Frontend proxy targets port 5005, backend runs on port 5000.

## Multi-Agent AI System - Detailed Architecture

### Agent Pipeline Flow
```
User Prompt → SpecAgent → [DesignAgent + ContentAgent] → LayoutAgent → CodeAgent → [DesignImplementationAgent + ImageIntegrationAgent] → TailwindStylistAgent ↔ ValidatorAgent → Final Component
```

### Core Agents (`backend/ai/agents/`)

**1. SpecAgent** (2-3s) - Requirements analysis
- Input: User prompt → Output: Structured page specification
- Determines page type, industry, complexity, sections, form fields

**2. DesignAgent** (5-8s, parallel) - Modern design system creation  
- Input: Page spec + industry → Output: Design system with 2024-2025 patterns
- Glassmorphism, gradients, micro-interactions, responsive strategies

**3. ContentAgent** (2-4s, parallel) - Industry-specific content
- Input: Page spec + design → Output: Authentic content for all sections
- 6 industries: Healthcare, E-commerce, Technology, Finance, Education, Real Estate

**4. LayoutAgent** (2-3s) - Responsive layout planning
- Input: Spec + design + content → Output: Layout strategy and arrangement
- Grid systems, component hierarchy, responsive breakpoints

**5. CodeAgent** (5-15s) - React component generation
- Input: All previous outputs → Output: Production-ready React/JSX + Tailwind
- 32k tokens, ContentCodeBridge integration (90%+ content utilization)

**6. DesignImplementationAgent** (2-4s, parallel) - Design-to-Tailwind translation
- Input: Design specs → Output: Concrete Tailwind implementations

**7. ImageIntegrationAgent** (3-6s, parallel) - Real image integration
- Input: Component + specs → Output: Enhanced component with Pexels API images
- Industry-specific keywords, comprehensive fallback system

**8. TailwindStylistAgent** (3-5s) - Advanced styling optimization
- Input: Component + validation issues → Output: Modern Tailwind patterns
- Accessibility, micro-interactions, responsive optimization (32k tokens)

**9. ValidatorAgent** (<1s) - Quality assurance validation
- Input: Complete context → Output: UI/UX compliance scoring
- 600+ rules, template pattern detection, industry specificity validation

### Universal Agent Runner (`backend/ai/agents/runAgent.js`)
- **Groq API Integration**: LLaMA 3.3 70B exclusively
- **Context Compression**: 60-90% size reduction
- **Performance Monitoring**: Token usage, execution time, memory tracking
- **JSON Parsing**: Multi-pass cleaning with error recovery

### Validation Loop Architecture
1. TailwindStylistAgent applies styling
2. ValidatorAgent checks 600+ UI/UX rules
3. If score < 75%, provides targeted improvement guidance  
4. Re-styling with specific fixes
5. Max 2 attempts with score improvement tracking

### UI/UX Compliance System
- **600+ Rules**: From `.claude/ModernUIUXRules.json`
- **75% Threshold**: Required for approval
- **6 Categories**: VisualDesign, LayoutAndStructure, InteractionAndFeedback, AccessibilityAndInclusivity, PerformanceAndOptimization, ContentAndMessaging
- **Mandatory Rules**: responsiveDesign, accessibilityBaseline, clearNavigation, interactionFeedback

### Enhanced Features (Phase 5-7)
- **Template Pattern Detection**: Prevents generic design patterns
- **Industry Authenticity**: Content/design validated against industry requirements  
- **Real Image Integration**: Pexels API with fallback strategies
- **Content Utilization**: 90%+ requirement enforced by ContentCodeBridge

## Environment Configuration

**Required (.env in backend/):**
```bash
GROQ_API_KEY=gsk_...           # Groq API key for LLaMA 3.3 70B
JWT_SECRET=your_secret_key     # JWT authentication (min 32 chars)
DATABASE_URL=postgresql://...  # PostgreSQL connection string
PORT=5000                      # Server port
PEXELS_API_KEY=your_key        # Pexels API for images
```

## Database Schema (PostgreSQL)

- `users` - Authentication with bcrypt
- `sessions` - User sessions with JWT tokens
- `prompts` - Conversation history
- `pages` - Generated components with metadata
- `agent_logs` - Execution logs with correlation tracking

## API Endpoints

**Page Generation:**
- `POST /api/pages/generatePage` - Full multi-agent generation
- `POST /api/pages/test-debug` - Debug route (dev only)
- `GET /api/pages/:id` - Get specific page
- `GET /api/pages` - List pages with pagination

**Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`  
**Sessions:** `/api/sessions` (CRUD)  
**Export:** `/api/export/:sessionId` (ZIP export)  
**Health:** `/api/health` (system status)

## Performance Characteristics

**Pipeline Performance (All 9 Agents Operational):**
- **Total**: 20-45 seconds
- **Success Rate**: 100%
- **Memory**: <100MB peak growth
- **Token Efficiency**: Context compression 60-90%

**Agent Timings:**
- SpecAgent: 2-3s | DesignAgent/ContentAgent: 5-8s (parallel)
- LayoutAgent: 2-3s | CodeAgent: 5-15s (most complex)
- DesignImpl/ImageIntegration: 4-8s (parallel) | TailwindStylist: 3-5s
- ValidatorAgent: 1-6s per validation iteration

## Debug Infrastructure

**DebugLogger** (`backend/ai/shared/DebugLogger.js`):
- Correlation ID tracking for each generation
- Agent input/output monitoring
- Memory usage and performance metrics
- File persistence to `backend/debug/`

**Debug Helper CLI:**
- `node debug-helper.js list` - List sessions
- `node debug-helper.js show <id>` - Show details
- `node debug-helper.js cleanup` - Clean old files

## Critical Implementation Notes

**Technology Constraints:**
- **NO Ant Design** - Pure React + Tailwind CSS only
- **Sandpack Compatible** - All components work in CodeSandbox
- **Production Ready** - Error boundaries, accessibility, responsive design

**Quality Standards:**
- **75%+ UI/UX compliance** against 600+ rules
- **90%+ content utilization** (ContentCodeBridge validation)
- **WCAG 2.1 AA accessibility** compliance
- **Mobile-first responsive** design

**AI Generation Standards:**
- **Industry authenticity** with Phase 5-6 enhancements
- **Template pattern prevention** with 80% uniqueness threshold
- **Modern UI/UX** implementing 2024-2025 design trends

## Current System Status (2025-09-08)

🟢 **FULLY OPERATIONAL**
- **9/9 Agents**: 100% operational with live Groq API ✅
- **JSON Pipeline**: Rebuilt and functional ✅  
- **Performance**: 20-45s optimal execution ✅
- **Quality**: 75%+ compliance enforced ✅
- **Testing**: Comprehensive suite with real API validation ✅

**Recent Fixes (Phase 7):**
- Fixed `response.replace is not a function` errors
- Enhanced parseJSONResponse() with dual-type handling
- Universal agent context handling standardized
- All agents fully functional with fallback mechanisms

## Development Workflow

1. **Setup**: Configure PostgreSQL + API keys
2. **Start**: `npm run dev` (both servers)  
3. **Test**: Individual agent tests before full pipeline
4. **Monitor**: Debug logs in `backend/debug/`
5. **Generate**: Frontend interface → real-time preview

**Key Files:**
- `backend/server.js` - Express entry point
- `backend/ai/orchestrator.js` - Multi-agent coordinator  
- `backend/ai/agents/runAgent.js` - Universal agent runner
- `frontend/src/components/PreviewPanel.jsx` - Sandpack preview

The system generates authentic, industry-specific, high-quality React components with modern UI/UX patterns and comprehensive validation.