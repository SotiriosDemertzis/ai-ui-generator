# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AI UI Generator Backend - Multi-Agent Page Generation System

## Project Overview

The AI UI Generator backend is a Node.js/Express server that provides a sophisticated multi-agent AI system for generating production-ready React components. The system uses 10 specialized AI agents orchestrated through a validation loop architecture to transform user prompts into complete React components with modern UI/UX patterns. The system has been enhanced with Phase 5 (Content Variability) and Phase 6 (Validation System Overhaul) improvements, featuring industry-specific content generation, template pattern detection, and real Pexels API image integration.

## Development Commands

**Start Development:**
```bash
npm run dev          # Start with nodemon (auto-reload on changes, ignores debug files)
npm start            # Production server startup
```

**Testing Commands:**
```bash
# Individual Agent Tests (2025-09-08 - All Operational)
node tests/test-spec-agent-fixed.js           # Test SpecAgent with live API
node tests/test-design-agent-fixed.js         # Test DesignAgent with live API  
node tests/test-content-agent-fixed.js        # Test ContentAgent with live API
node tests/test-layout-agent.js               # Test LayoutAgent with live API
node tests/test-code-agent.js                 # Test CodeAgent with live API
node tests/test-all-agents-comprehensive.js   # Test all 9 agents (100% operational)
```

**Database Commands:**
```bash
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
```

## Architecture Overview

### Multi-Agent Orchestration System

The system uses a sequential pipeline of 9 specialized AI agents managed by the `ImprovedOrchestrator` (`backend/ai/orchestrator.js`) - **ALL AGENTS FULLY OPERATIONAL as of 2025-09-08**:

```
User Prompt → SpecAgent → DesignAgent + ContentAgent (parallel) → LayoutAgent → CodeAgent → DesignImplementationAgent + ImageIntegrationAgent → TailwindStylistAgent ↔ ValidatorAgent (validation loop) → Final Component
```

### Core AI Agents (`backend/ai/agents/`)

**1. SpecAgent** - Requirements analysis and technical specifications
- Input: User prompt string
- Output: Structured page specification with sections, form fields, and functional requirements
- Determines page type, industry context, and complexity level

**2. DesignAgent** - Modern design system creation 
- Input: Page specification + industry context
- Output: Comprehensive design system with 2024-2025 modern patterns including glassmorphism, gradient systems, and micro-interactions

**3. ContentAgent** - Enhanced industry-specific content generation (Phase 5)
- Input: Page specification + design context  
- Output: Realistic, contextual content for all page sections including hero, features, testimonials, and company information
- **New Features**: Industry-specific section variations, dynamic content generation for 6 industries, authentic content strategies to prevent generic patterns

**4. LayoutAgent** - Responsive layout structure planning
- Input: Specification + design + content
- Output: Layout strategy and component arrangement with responsive breakpoints

**5. CodeAgent** - React component generation
- Input: All previous agent outputs
- Output: Production-ready React/JSX component with Tailwind CSS
- Generates clean, functional components with proper imports and state management

**6. DesignImplementationAgent** - Design-to-Tailwind translation
- Input: Design system specifications
- Output: Concrete Tailwind class implementations for design patterns
- Translates abstract design concepts into specific CSS classes

**7. ImageIntegrationAgent** - Industry-appropriate image integration with Pexels API
- Input: Generated component + page specification + content
- Output: Enhanced component with real, contextual images from Pexels API and fallback strategies
- **New Features**: Real Pexels API integration, industry-specific image keywords, enhanced fallback system with photographer attribution

**8. TailwindStylistAgent** - Advanced UI/UX styling optimization
- Input: Component + validation issues + design implementation
- Output: Enhanced component with modern Tailwind patterns, micro-interactions, and accessibility features

**9. ValidatorAgent** - Enhanced quality assurance and compliance validation (Phase 6)
- Input: Complete generation context
- Output: Comprehensive validation results with UI/UX compliance scoring, template pattern detection, and industry specificity validation
- **Enhanced Features**: Template pattern detection, industry-specific validation requirements, creative uniqueness enforcement
- Validates against 600+ UI/UX rules across 6 categories with additional Phase 6 validations


### Universal Agent Runner (`backend/ai/agents/runAgent.js`)

Unified execution system providing:
- **Groq API Integration**: Uses LLaMA 3.3 70B Versatile model exclusively
- **Context Management**: Intelligent context compression (60-90% size reduction) and injection
- **Performance Monitoring**: Token usage, execution time, and memory tracking
- **Error Handling**: Robust retry logic and fallback mechanisms
- **JSON Response Parsing**: Advanced multi-pass JSON cleaning and parsing

**Key Functions:**
```javascript
runAgent(agentName, prompt, context, options) → { success, response, metadata }
parseJSONResponse(response) → { success, data, error }
buildContextSummary(context, agentName) → compressed_context
```

### Validation Loop Architecture

The system implements a sophisticated validation loop between TailwindStylistAgent and ValidatorAgent:

1. **Initial Styling**: TailwindStylistAgent applies modern styling patterns
2. **Validation**: ValidatorAgent checks against 600+ UI/UX rules
3. **Iteration**: If validation score < 75%, provides targeted guidance for improvements
4. **Re-styling**: TailwindStylistAgent applies specific fixes based on validation feedback
5. **Loop Control**: Maximum 2 attempts with score improvement tracking to prevent infinite loops

### Enhanced UI/UX Compliance System (Phase 6)

Comprehensive validation against `.claude/ModernUIUXRules.json` with Phase 6 enhancements:
- **600+ validation rules** across 6 categories
- **75% compliance threshold** required for generation approval
- **Categories**: VisualDesign, LayoutAndStructure, InteractionAndFeedback, AccessibilityAndInclusivity, PerformanceAndOptimization, ContentAndMessaging
- **Mandatory rules**: responsiveDesign, accessibilityBaseline, clearNavigation, interactionFeedback

**Phase 6 Enhanced Validation Features:**
- **Template Pattern Detection**: Identifies and prevents generic template patterns in gradients, glassmorphism, hover effects, typography, and spacing
- **Industry Specificity Validation**: Enforces industry-appropriate color schemes, content terminology, and visual alignment
- **Creative Uniqueness Scoring**: Template avoidance threshold (80%) and industry specificity threshold (70%)
- **Dynamic Score Adjustment**: Penalties applied for template patterns (30% weight) and lack of industry specificity (20% weight)

### Debug Infrastructure

**DebugLogger System** (`backend/ai/shared/DebugLogger.js`):
- Comprehensive logging with unique correlation IDs for each generation session
- Agent input/output monitoring with context size and execution time tracking
- Validation loop tracking with rule-by-rule compliance analysis
- Memory usage monitoring and performance metrics
- Debug logs persist to `backend/debug/` directory

**Debug Helper CLI** (`backend/debug-helper.js`):
```bash
node debug-helper.js list                    # List all debug sessions
node debug-helper.js show <correlationId>    # Show session summary
node debug-helper.js export <correlationId>  # Export session data
node debug-helper.js cleanup                 # Clean old debug files
```

## Environment Configuration

**Required Environment Variables (.env):**
```bash
GROQ_API_KEY=gsk_...           # Groq API key for LLaMA 3.3 70B model
JWT_SECRET=your_secret_key     # JWT authentication secret
DATABASE_URL=postgresql://...  # PostgreSQL connection string  
PORT=5000                      # Server port (default)
NODE_ENV=development|production # Environment mode
PEXELS_API_KEY=your_pexels_key # Pexels API key for real image integration
```

**Optional Environment Variables:**
```bash
DEBUG_CONTENT_BRIDGE=true     # Enable detailed ContentCodeBridge debug output
```

## Database Schema (PostgreSQL)

**Core Tables:**
- `users` - User authentication and profiles
- `sessions` - User sessions and project management
- `prompts` - Conversation history and prompt tracking
- `pages` - Generated components with complete metadata
- `agent_logs` - Detailed agent execution logs and performance metrics

## API Endpoints

**Page Generation:**
- `POST /api/pages/generatePage` - Generate new component using multi-agent system
- `POST /api/pages/test-debug` - Debug route for testing without authentication
- `GET /api/pages/:id` - Get specific generated page
- `GET /api/pages` - List pages with filtering and pagination

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user profile

**Session Management:**
- `GET /api/sessions` - List user sessions
- `POST /api/sessions` - Create new session

**Export & Health:**
- `GET /api/export/:sessionId` - Export components as ZIP
- `GET /api/health` - Comprehensive system health check with service status

## Performance Characteristics

**Current Generation Pipeline Performance (2025-09-08):**
- **Total execution time**: 20-45 seconds (all 9 agents operational)
- **Phase 1** (SpecAgent): 2-3 seconds ✅
- **Phase 2-3** (DesignAgent/ContentAgent parallel): 5-8 seconds ✅  
- **Phase 4** (LayoutAgent): 2-3 seconds ✅
- **Phase 5** (CodeAgent): 5-15 seconds ✅
- **Phase 6** (DesignImplementationAgent/ImageIntegrationAgent): 4-8 seconds ✅
- **Phase 7** (TailwindStylistAgent): 3-5 seconds ✅
- **Phase 8** (ValidatorAgent validation loop): 1-6 seconds per iteration ✅
- **Success rate**: 100% (all agents operational) ✅
- **Memory target**: <100MB peak growth per generation ✅

## Recent System Enhancements (2025-09-08)

### Phase 7: Complete Agent Infrastructure Overhaul (2025-09-08)
**Major Infrastructure Fixes Completed:**
- **✅ JSON Parsing Pipeline Completely Rebuilt**: Fixed critical `response.replace is not a function` errors across all agents
- **✅ Enhanced parseJSONResponse()**: Implemented dual-type handling for both string and object responses
- **✅ Fixed Double-Parsing Issues**: Prevented agents from attempting to parse already-parsed JSON objects
- **✅ Universal Agent Context Handling**: All agents now support both single context object and multiple parameter calling patterns
- **✅ Export/Import Standardization**: Corrected module export formats across all agents
- **✅ Method Signature Alignment**: Updated all agent method names and parameters to match actual implementations

**Current Agent Status - 100% OPERATIONAL:**
All 9 core agents are now fully functional with live Groq API integration:
- **SpecAgent**: ✅ Generating comprehensive page specifications (2-3s execution)
- **DesignAgent**: ✅ Creating state-of-the-art design systems (5-8s execution)
- **ContentAgent**: ✅ Producing authentic industry content (2-4s execution)
- **LayoutAgent**: ✅ Building responsive layout structures (2-3s execution)  
- **CodeAgent**: ✅ Generating production-ready React components (5-15s execution)
- **TailwindStylistAgent**: ✅ Applying modern styling enhancements (3-5s execution)
- **ValidatorAgent**: ✅ Comprehensive UI/UX validation (<1s execution)
- **DesignImplementationAgent**: ✅ Translating designs to Tailwind (2-4s execution)
- **ImageIntegrationAgent**: ✅ Integrating contextual images (3-6s execution)

**Testing Infrastructure Completed:**
- **✅ Comprehensive Test Suite**: Created individual tests for all 9 agents
- **✅ Real API Integration**: All tests use live Groq API calls with proper validation
- **✅ Performance Monitoring**: Full execution time and token usage tracking
- **✅ System Validation Report**: Complete documentation of system status and capabilities

## Recent System Enhancements (2025-09-07)

### Phase 5: Enhanced Content Variability
**ContentAgent Enhanced (v3.0 → v3.1):**
- **Industry-Specific Section Variations**: Dynamic section generation based on industry requirements
- **6 Industry Profiles**: Healthcare, E-commerce, Technology, Finance, Education, Real Estate
- **Authentic Content Generation**: Industry-appropriate terminology, realistic company information, and contextual features
- **Content Authenticity Engines**: Prevents generic placeholder content in favor of industry-realistic data
- **Dynamic Section Mapping**: Industries get tailored sections (e.g., healthcare gets "services" instead of generic "features")

### Phase 6: Validation System Overhaul
**UIUXRulesValidator Enhanced (v1.0 → v1.1):**
- **Template Pattern Detection**: Comprehensive detection of repetitive design patterns in gradients, glassmorphism, hover effects, typography, and spacing
- **Industry Specificity Validation**: Enforces industry-appropriate colors, content alignment, and visual authenticity
- **Creative Uniqueness Enforcement**: Prevents generic template usage with 80% template avoidance threshold
- **Industry Color Psychology**: Validates color choices against industry standards (medical green, tech blue, finance blue, etc.)

**ValidatorAgent Enhanced (v3.1 → v3.2):**
- **Integrated Phase 6 Validation**: Template pattern detection and industry specificity validation in main pipeline
- **Dynamic Score Adjustment**: Penalties for template patterns (-30% weight) and industry violations (-20% weight)
- **Enhanced Critical Issues**: Template pattern and industry violation tracking
- **Comprehensive Validation Reporting**: Detailed template detection and industry compliance metrics

### Pexels API Integration
**ImageIntegrationAgent Enhanced (v1.0 → v1.1):**
- **Real Pexels API Integration**: Replaced simulated API calls with actual Pexels API requests
- **Industry-Specific Image Keywords**: Enhanced keyword generation for better image relevance
- **Enhanced Fallback System**: Pexels large → medium → small → industry placeholder → generic placeholder
- **Photographer Attribution**: Proper credit attribution in alt text for Pexels images
- **Robust Error Handling**: Comprehensive API error handling with graceful degradation

## Advanced Features

### Context Compression and State Management

**ImprovedGenerationContext** class manages pipeline state:
- Agent-specific context optimization reduces payload size by 60-90%
- Memory usage tracking and optimization during validation loops
- State persistence across the entire generation pipeline
- Correlation ID tracking for debugging and monitoring

### Content Utilization Validation

**ContentCodeBridge** system ensures generated components utilize provided content:
- Tracks 90%+ content utilization requirement
- Provides detailed content-to-code mapping
- Prevents generic placeholder usage in favor of contextual content

### Performance Monitoring

**PerformanceMonitor** tracks:
- Real-time agent execution metrics
- Token usage optimization across all API calls  
- Memory consumption patterns
- Generation success/failure rates

## Error Handling & Recovery

**Multi-layered Error Recovery:**
- Agent-level fallback mechanisms for API failures
- Context compression during memory pressure
- Validation loop termination to prevent infinite loops
- Graceful degradation with partial results
- Comprehensive error logging with correlation tracking

## Development Workflow

1. **Environment Setup**: Configure PostgreSQL database and Groq API key
2. **Start Development**: `npm run dev` enables hot-reload with debug file ignoring  
3. **Test Generation**: Use `/api/pages/test-debug` endpoint for development testing
4. **Monitor Debug Logs**: Check `backend/debug/` directory for detailed execution traces
5. **Validate Output**: Components automatically validated against 600+ UI/UX rules

## Critical Implementation Notes

- **NO Ant Design**: System generates pure React + Tailwind CSS components only
- **Sandpack Compatibility**: All generated components work in CodeSandbox environments
- **Production Ready**: Components include proper error boundaries, accessibility features, and responsive design
- **Memory Management**: Context compression and cleanup prevent memory leaks during long sessions
- **API Rate Limiting**: Groq API calls are optimized with intelligent retry logic
- **Real Image Integration**: Components use actual Pexels API images with comprehensive fallback strategies
- **Template Pattern Prevention**: Phase 6 validation prevents generic template patterns and enforces creative uniqueness
- **Industry Authenticity**: Content and design choices are validated against industry-specific requirements
- **Enhanced Content Quality**: Phase 5 improvements ensure industry-realistic content generation across 6 major industries

## Key Files Architecture

**Core Backend Files:**
- `server.js` - Express server entry point with environment validation
- `ai/orchestrator.js` - Multi-agent coordinator with validation loop
- `ai/agents/runAgent.js` - Universal agent execution system
- `routes/pages.js` - Page generation API endpoints
- `database/database.js` - PostgreSQL connection and query management

**AI Agent Files:**
- Each agent in `ai/agents/` implements a specific generation phase
- `ai/shared/` contains utilities for debugging, performance monitoring, and content validation
- `ai/validation/` contains UI/UX compliance validation logic

This backend system represents a state-of-the-art AI-powered component generation platform, designed for reliability, performance, and production-quality output.

## Current System Status (2025-09-08)

🟢 **SYSTEM STATUS: FULLY OPERATIONAL** 
- **Agent Success Rate**: 100% (9/9 agents operational)
- **Infrastructure Health**: ✅ Fully restored and enhanced
- **API Integration**: ✅ Live Groq API calls working perfectly  
- **JSON Parsing Pipeline**: ✅ Completely rebuilt and functional
- **Testing Coverage**: ✅ Comprehensive test suite with real API validation
- **Performance**: ✅ Optimal execution times (20-45s total pipeline)
- **Quality Assurance**: ✅ Production-ready component generation

The multi-agent system has undergone complete infrastructure overhaul and all critical issues have been resolved. The system is ready for production use and generates authentic, industry-specific, high-quality React components with modern UI/UX patterns.
- Remember to update the m Multi-Agent System Architecture in @CLAUDE.md after changes in the multi-agent system so that the claude md file always has the current multiagent system information