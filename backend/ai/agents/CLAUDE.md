# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AI Agents Directory - Multi-Agent React Component Generation System

## Overview

The `backend/ai/agents/` directory contains a sophisticated multi-agent AI system for generating production-ready React components. The system uses 9 specialized AI agents orchestrated in a sequential pipeline to transform user prompts into complete React components with modern UI/UX patterns, industry-specific content, and comprehensive validation.

## Architecture

### Agent Execution Pipeline
```
User Prompt → SpecAgent → DesignAgent + ContentAgent (parallel) → 
LayoutAgent → CodeAgent → DesignImplementationAgent + ImageIntegrationAgent → 
TailwindStylistAgent ↔ ValidatorAgent (validation loop) → Final Component
```

### Universal Agent Runner (`runAgent.js`)
Core execution system that provides:
- **Groq API Integration** - Uses LLaMA 3.3 70B Versatile model
- **Context Management** - Intelligent compression (60-90% size reduction)
- **JSON Response Parsing** - Robust multi-pass cleaning and parsing
- **Performance Monitoring** - Token usage, execution time, memory tracking
- **Error Handling** - Retry logic and fallback mechanisms

Key functions:
```javascript
runAgent(agentName, promptTemplate, context, options) // Main execution
parseJSONResponse(response) // Safe JSON parsing with cleanup
buildContextSummary(context, agentName) // Context compression
```

## Core Agents

### 1. SpecAgent (`specAgent.js`)
**Purpose**: Requirements analysis and technical specifications
- **Input**: User prompt string
- **Output**: Structured page specification with sections, form fields, and functional requirements
- **Key Features**: Multi-pass requirement extraction, input validation, completeness checking
- **Data Structure**: PageSpecification with type, industry, complexity, sections, formFields, requirements

### 2. DesignAgent (`designAgent.js`) 
**Purpose**: Modern design system creation
- **Input**: Page specification + industry context
- **Output**: Comprehensive design system with 2024-2025 patterns
- **Key Features**: Glassmorphism, gradient systems, micro-interactions, responsive strategies
- **Data Structure**: DesignSystem with modernVisualSystem, advancedColorSystem, typography

### 3. ContentAgent (`contentAgent.js`)
**Purpose**: Industry-specific content generation
- **Input**: Page specification + design context
- **Output**: Realistic, contextual content for all page sections
- **Key Features**: Industry-specific variations, authentic content strategies, 6 industry profiles
- **Data Structure**: ContentStrategy with hero, features, testimonials, stats, companyInfo

### 4. LayoutAgent (`layoutAgent.js`)
**Purpose**: Responsive layout structure planning
- **Input**: Specification + design + content
- **Output**: Layout strategy and component arrangement
- **Key Features**: Responsive breakpoints, grid systems, component hierarchy
- **Data Structure**: LayoutStructure with strategy, sections, gridSystem

### 5. CodeAgent (`codeAgent.js`) - **CRITICAL COMPONENT**
**Purpose**: React component generation with content integration
- **Input**: All previous agent outputs
- **Output**: Production-ready React/JSX component with Tailwind CSS
- **Key Features**: 
  - ContentCodeBridge integration for 90%+ content utilization
  - Dynamic design system class extraction
  - Functional React components with state management
  - Modern UI patterns (glassmorphism, gradients, micro-interactions)
- **Token Allocation**: 32,000 tokens (maximum for comprehensive components)
- **Data Structure**: ReactComponent with reactCode, componentName, contentUtilization

### 6. DesignImplementationAgent (`designImplementationAgent.js`)
**Purpose**: Design-to-Tailwind translation
- **Input**: Design system specifications
- **Output**: Concrete Tailwind class implementations
- **Key Features**: Abstract design concept translation to specific CSS classes

### 7. ImageIntegrationAgent (`imageIntegrationAgent.js`)
**Purpose**: Industry-appropriate image integration
- **Input**: Generated component + specifications
- **Output**: Enhanced component with real Pexels API images
- **Key Features**: Real Pexels API integration, industry-specific keywords, fallback strategies

### 8. TailwindStylistAgent (`tailwindStylistAgent.js`)
**Purpose**: Advanced UI/UX styling optimization
- **Input**: Component + validation issues
- **Output**: Enhanced component with modern Tailwind patterns
- **Key Features**: Accessibility compliance, micro-interactions, responsive optimization

### 9. ValidatorAgent (`validatorAgent.js`)
**Purpose**: Quality assurance and compliance validation
- **Input**: Complete generation context
- **Output**: Validation results with UI/UX compliance scoring
- **Key Features**: 600+ UI/UX rules validation, 75% compliance threshold, template pattern detection

## Development Commands

### Testing Individual Agents
```bash
# Test specific agents (all operational as of 2025-09-08)
node tests/test-spec-agent-fixed.js           # Test SpecAgent
node tests/test-design-agent-fixed.js         # Test DesignAgent  
node tests/test-content-agent-fixed.js        # Test ContentAgent
node tests/test-layout-agent.js               # Test LayoutAgent
node tests/test-code-agent.js                 # Test CodeAgent

# Comprehensive testing
node tests/test-all-agents-comprehensive.js   # Test all 9 agents
```

### Running the Agent System
The agents are typically invoked through the orchestrator (`../orchestrator.js`), but can be tested individually:

```javascript
const { SpecAgent } = require('./specAgent');
const agent = new SpecAgent();
const result = await agent.generateSpec(userPrompt);
```

## Key Implementation Details

### Context Management
- **Context Compression**: Large contexts are compressed by 60-90% for efficiency
- **Agent-Specific Context**: Each agent receives tailored context based on its needs
- **State Persistence**: ImprovedGenerationContext maintains state across the pipeline

### Content Utilization System
The CodeAgent implements a sophisticated content utilization system:
- **ContentCodeBridge**: Validates 90%+ content utilization requirement
- **Content Mapping**: Tracks all content elements through the generation process
- **Validation Thresholds**: Enforces content integration quality standards

### JSON Parsing Pipeline
Recent infrastructure overhaul (2025-09-08) includes:
- **Dual-Type Handling**: Supports both string and object responses
- **Multi-Pass Cleaning**: Aggressive JSON cleaning for complex AI responses
- **Error Recovery**: Fallback mechanisms for parsing failures

### Design System Integration
- **Dynamic Class Extraction**: Converts design specifications to Tailwind classes
- **Industry-Specific Patterns**: Different visual approaches based on industry context
- **Responsive Implementation**: All components include mobile-first responsive design

## Performance Characteristics

**Current Performance (All 9 Agents Operational):**
- **Total Pipeline**: 20-45 seconds
- **Individual Agent Range**: 1-15 seconds
- **Success Rate**: 100% with fallback mechanisms
- **Memory Usage**: <100MB peak growth per generation
- **Token Efficiency**: Optimized context compression and prompt design

## Critical Files

**Core Agent Files:**
- `runAgent.js` - Universal agent execution system
- `codeAgent.js` - Main React component generation (most complex)
- `specAgent.js` - Requirements analysis and validation
- `validatorAgent.js` - UI/UX compliance validation

**Shared Utilities:**
- `../shared/DebugLogger.js` - Comprehensive logging system
- `../shared/contentCodeBridge.js` - Content utilization validation
- `../validation/` - Input/output validation systems

## Important Constraints

- **Pure React + Tailwind**: No external UI libraries (NO Ant Design)
- **Sandpack Compatible**: All components work in CodeSandbox environments
- **UI/UX Compliance**: Must achieve 75%+ compliance score
- **Content Integration**: Must utilize 90%+ of provided content
- **Production Ready**: Components include error boundaries, accessibility, responsiveness

## Usage Notes

- Always use the TodoWrite tool when making changes to track progress
- Update this CLAUDE.md file when agent functionality or architecture changes
- Test individual agents before running full orchestrator pipeline
- Monitor debug logs in `../../debug/` directory for detailed execution traces
- Maintain 75% UI/UX compliance threshold for all generated components