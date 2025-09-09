# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Backend AI System - Multi-Agent React Component Generation

## Overview

The `backend/ai/` directory contains a sophisticated multi-agent AI system that generates production-ready React components. The system orchestrates 9 specialized AI agents through a sequential pipeline to transform user prompts into complete React components with modern UI/UX patterns, industry-specific content, and comprehensive validation.

## Architecture

### Core Components Structure
```
ai/
├── orchestrator.js              # Multi-agent coordinator with validation loop
├── agents/                      # 9 specialized AI agents
│   ├── runAgent.js             # Universal agent execution system
│   ├── specAgent.js            # Requirements analysis
│   ├── designAgent.js          # Modern design system creation
│   ├── contentAgent.js         # Industry-specific content generation
│   ├── layoutAgent.js          # Responsive layout planning
│   ├── codeAgent.js            # React component generation
│   ├── designImplementationAgent.js # Design-to-Tailwind translation
│   ├── imageIntegrationAgent.js # Pexels API image integration
│   ├── tailwindStylistAgent.js # Advanced styling optimization
│   └── validatorAgent.js       # Quality assurance validation
├── shared/                     # Utilities and engines
│   ├── DebugLogger.js          # Comprehensive logging system
│   ├── contentCodeBridge.js    # Content utilization validation
│   ├── modernDesignEngine.js   # Design pattern generation
│   └── PerformanceMonitor.js   # Execution tracking
├── validation/                 # Validation systems
│   ├── UIUXRulesValidator.js   # 600+ UI/UX rules validation
│   ├── InputValidator.js       # Input sanitization
│   └── OutputValidator.js      # Output quality checks
└── designSystem/              # Design configuration
    ├── brandTokens.json        # Brand token definitions
    └── pageTypeRequirements.json # Page type specifications
```

### Agent Execution Pipeline
```
User Prompt → SpecAgent → DesignAgent + ContentAgent (parallel) → 
LayoutAgent → CodeAgent → DesignImplementationAgent + ImageIntegrationAgent → 
TailwindStylistAgent ↔ ValidatorAgent (validation loop) → Final Component
```

## Key Development Commands

### Testing the AI System
```bash
# Individual agent testing (all operational as of 2025-09-08)
node tests/test-spec-agent-fixed.js           # Test requirements analysis
node tests/test-design-agent-fixed.js         # Test design system creation
node tests/test-content-agent-fixed.js        # Test content generation
node tests/test-layout-agent.js               # Test layout planning
node tests/test-code-agent.js                 # Test React generation

# Comprehensive system testing  
node tests/test-all-agents-comprehensive.js   # Test all 9 agents with live API

# Debug system monitoring
node debug-helper.js list                     # List debug sessions
node debug-helper.js show <correlationId>     # Show session details
node debug-helper.js cleanup                  # Clean old debug files
```

### Running the Orchestrator System
The primary entry point is through the orchestrator, typically called from the main backend server:

```javascript
const { ImprovedOrchestrator } = require('./orchestrator');
const orchestrator = new ImprovedOrchestrator();
const result = await orchestrator.generatePage(userPrompt, options);
```

## Critical Implementation Details

### Universal Agent Runner (`agents/runAgent.js`)
Core execution system providing:
- **Groq API Integration**: Uses LLaMA 3.3 70B Versatile model exclusively
- **Context Compression**: Reduces payload size by 60-90% through intelligent summarization
- **JSON Response Parsing**: Robust multi-pass cleaning and parsing with error recovery
- **Performance Monitoring**: Tracks token usage, execution time, and memory consumption

Key functions:
```javascript
runAgent(agentName, promptTemplate, context, options) // Main agent execution
parseJSONResponse(response) // Safe JSON parsing with cleanup
buildContextSummary(context, agentName) // Context compression for efficiency
```

### Context Management System
The `ImprovedGenerationContext` class manages state flow:
- **Phase Tracking**: Maintains data from all 9 agent phases
- **Memory Optimization**: Intelligent context compression prevents memory bloat
- **Debug Integration**: Automatic correlation ID tracking and logging
- **State Persistence**: Preserves generation state across the entire pipeline

### Validation Loop Architecture
Advanced validation system between TailwindStylistAgent and ValidatorAgent:
1. **Initial Styling**: Apply modern UI/UX patterns
2. **Validation**: Check against 600+ UI/UX rules from `.claude/ModernUIUXRules.json`
3. **Iteration**: If score < 75%, provide targeted improvement guidance
4. **Re-styling**: Apply specific fixes based on validation feedback
5. **Loop Control**: Maximum 2 attempts with score improvement tracking

### Content Utilization System (`shared/contentCodeBridge.js`)
Ensures generated components utilize provided content effectively:
- **90% Content Utilization**: Validates that generated code uses 90%+ of provided content
- **Content Mapping**: Tracks all content elements through the generation process
- **Quality Enforcement**: Prevents generic placeholder usage in favor of contextual content

## Debug Infrastructure

### DebugLogger System (`shared/DebugLogger.js`)
Comprehensive logging with unique correlation IDs for tracking complete generation flow:
- **Agent Execution Tracking**: Input/output monitoring with context size and execution time
- **Memory Monitoring**: Heap usage tracking during generation
- **Validation Details**: Rule-by-rule compliance analysis
- **Context Evolution**: Data flow tracking through all pipeline phases
- **File Persistence**: Debug logs saved to `../../debug/` directory

### Performance Monitoring (`shared/PerformanceMonitor.js`)
Real-time metrics tracking:
- **Execution Time**: Per-agent and total pipeline timing
- **Token Usage**: API efficiency and cost optimization
- **Memory Usage**: Peak consumption and cleanup validation
- **Success Rates**: Generation quality and failure analysis

## Validation System

### UI/UX Rules Validator (`validation/UIUXRulesValidator.js`)
Comprehensive design compliance validation:
- **600+ UI/UX Rules**: Loaded from `.claude/ModernUIUXRules.json`
- **6 Validation Categories**: VisualDesign, LayoutAndStructure, InteractionAndFeedback, AccessibilityAndInclusivity, PerformanceAndOptimization, ContentAndMessaging
- **75% Compliance Threshold**: Required for generation approval
- **Template Pattern Detection**: Prevents generic design patterns
- **Industry Specificity**: Validates industry-appropriate design choices

### Mandatory Validation Rules
Critical rules that must pass:
- `responsiveDesign`: Mobile-first responsive implementation
- `accessibilityBaseline`: WCAG 2.1 AA compliance
- `clearNavigation`: Intuitive navigation patterns
- `interactionFeedback`: Proper user interaction feedback

## Performance Characteristics

**Current System Performance (All 9 Agents Operational):**
- **Total Pipeline Execution**: 20-45 seconds
- **Individual Agent Range**: 1-15 seconds per agent
- **Success Rate**: 100% with fallback mechanisms
- **Memory Target**: <100MB peak growth per generation
- **Token Efficiency**: Optimized context compression and prompt design

**Typical Agent Execution Times:**
- SpecAgent: 2-3 seconds
- DesignAgent/ContentAgent: 5-8 seconds (parallel)
- LayoutAgent: 2-3 seconds
- CodeAgent: 5-15 seconds (most complex)
- DesignImplementation/ImageIntegration: 4-8 seconds
- TailwindStylistAgent: 3-5 seconds
- ValidatorAgent: 1-6 seconds per validation iteration

## Environment Requirements

**Required Environment Variables:**
```bash
GROQ_API_KEY=gsk_...           # Groq API key for LLaMA 3.3 70B model
PEXELS_API_KEY=your_key        # Pexels API key for real image integration
NODE_ENV=development|production # Environment mode
```

**Optional Debug Variables:**
```bash
DEBUG_CONTENT_BRIDGE=true     # Enable detailed ContentCodeBridge output
```

## Critical Constraints

- **Pure React + Tailwind CSS**: No external UI libraries (NO Ant Design)
- **Sandpack Compatible**: All components work in CodeSandbox environments  
- **Production Ready**: Components include error boundaries, accessibility, and responsiveness
- **UI/UX Compliance**: Must achieve 75%+ compliance score
- **Content Integration**: Must utilize 90%+ of provided content
- **Industry Authenticity**: Content and design must be industry-appropriate

## Recent System Status (2025-09-08)

**Phase 7: Complete Infrastructure Overhaul - COMPLETED**
- ✅ JSON Parsing Pipeline completely rebuilt
- ✅ Enhanced parseJSONResponse() with dual-type handling 
- ✅ Fixed critical `response.replace is not a function` errors
- ✅ Universal Agent Context Handling standardized
- ✅ Export/Import formats corrected across all agents
- ✅ Method signature alignment completed
- ✅ 100% Agent Operational Status achieved

**System Status: FULLY OPERATIONAL**
All 9 agents are functional with live Groq API integration, comprehensive testing coverage, and optimal performance metrics.

## Usage Guidelines

- **Always use TodoWrite**: Track progress when making changes to the AI system
- **Update CLAUDE.md**: Keep this file current when agent functionality changes
- **Test Before Deploy**: Run individual agent tests before full orchestrator pipeline
- **Monitor Debug Logs**: Check `../debug/` directory for detailed execution traces  
- **Maintain Compliance**: Ensure 75% UI/UX compliance threshold for all components
- **Content Quality**: Validate 90%+ content utilization in generated components

## Integration Points

The AI system integrates with:
- **Main Backend Server**: Via orchestrator API calls
- **Database**: Agent execution logs and performance metrics
- **External APIs**: Groq LLaMA 3.3 70B and Pexels image API
- **Frontend Preview**: Sandpack-compatible component generation
- **Debug Infrastructure**: Real-time monitoring and session tracking