# AI UI Generator Backend

Node.js/Express backend for multi-agent AI-powered React component and page generation.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
  - [Agent Pipeline](#agent-pipeline)
  - [Data Flow](#data-flow)
  - [Key Data Structures](#key-data-structures)
- [Features](#features)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Development & Testing](#development--testing)
- [Debugging & Analysis](#debugging--analysis)
- [Advanced Features](#advanced-features)
- [Documentation](#documentation)

---

## Overview

The backend orchestrates a pipeline of specialized AI agents to generate, validate, and export production-ready React components and pages. It supports modern UI/UX standards, industry-specific requirements, and robust debugging and validation infrastructure.

---

## Architecture

### Agent Pipeline

The backend uses a modular, multi-agent pipeline. Each agent is responsible for a specific phase:

1. **SpecAgent**  
   Extracts requirements, page type, sections, and style guide from user prompt.

2. **DesignAgent**  
   Generates a modern design system (color, typography, effects) using [`ModernDesignEngine`](ai/shared/modernDesignEngine.js).

3. **ContentAgent**  
   Produces structured, industry-specific content for each section.

4. **LayoutAgent**  
   Maps content and design into a responsive layout and component graph.

5. **CodeAgent**  
   Generates React+Tailwind code, mapping all content and design.

6. **TailwindStylistAgent**  
   Refines Tailwind classes, ensures modern patterns and accessibility.

7. **ValidatorAgent**  
   Validates UI/UX compliance (600+ rules), content utilization, and modernity.

8. **DesignImplementationAgent / ImageIntegrationAgent**  
   Finalizes design and image assets for export.

Each agent receives and updates a shared context object, with debug logs and validation at each step.

#### Orchestration

- The pipeline is coordinated by [`ai/orchestrator.js`](ai/orchestrator.js).
- Each agent is implemented in [`ai/agents/`](ai/agents/).
- Shared utilities and validation logic are in [`ai/shared/`](ai/shared/).

---

### Data Flow

- **Input:** User prompt (business/page requirements)
- **Output:** Production-ready React components, design tokens, and exportable project files
- **Debug:** Every agent logs input/output, execution time, and memory usage (see [`debug/`](debug/))

---

### Key Data Structures

- **PageSpec**
  ```js
  {
    name, type, industry, complexity, description,
    styleGuide, sections: [{ name, type, priority, ... }],
    formFields, requirements, designExpectations, ...
  }
  ```
- **DesignSystem**
  - See [`ModernDesignEngine`](ai/shared/modernDesignEngine.js) for structure (color, typography, effects, accessibility, etc.)
- **ComponentGraph**
  - Maps sections/components to layout and code

---

## Features

- **Multi-Agent Orchestration:** 9+ specialized AI agents for page specification, design, content, layout, code, styling, validation, and more.
- **Modern UI/UX Validation:** 600+ rules, 75%+ compliance threshold.
- **Industry-Specific Generation:** Dynamic content and design for 6+ industries.
- **Debug Infrastructure:** Correlation IDs, detailed logs, CLI tools.
- **Export:** Download generated components as a ready-to-run Vite+React project.
- **Performance Monitoring:** Agent execution time and memory usage tracked per session.
- **Security:** JWT authentication, rate limiting, and security middleware.

---

## Directory Structure

```
backend/
├── ai/
│   ├── agents/                # All agent implementations
│   ├── designSystem/          # Brand tokens, requirements
│   ├── shared/                # DebugLogger, validation, utilities
│   └── orchestrator.js        # Pipeline coordinator
├── database/                  # PostgreSQL schema and queries
├── debug/                     # Debug logs and session traces
├── middleware/                # Auth, rate limiting, security, telemetry
├── routes/                    # Express API endpoints
├── services/                  # Cache and other services
├── tests/                     # Agent and system tests
├── server.js                  # Express entry point
├── debug-helper.js            # CLI for debug and export
└── .claude/                   # Prompt engineering, rules, settings
```

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env` and fill in the required keys.

3. **Run database migrations**
   ```bash
   npm run migrate
   npm run seed
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

---

## Environment Variables

- `GROQ_API_KEY` — API key for LLM agent orchestration
- `JWT_SECRET` — Secret for JWT authentication
- `DATABASE_URL` — PostgreSQL connection string
- `PORT` — Server port (default: 5000)
- `PEXELS_API_KEY` — For image integration agent

---

## Database

- **Schema:** See [`database/schema.sql`](database/schema.sql)
- **Tables:** Sessions, prompts, logs, users, generated pages
- **Access:** All queries in [`database/database.js`](database/database.js)

---

## API Endpoints

- **/auth** — Login, register, JWT management
- **/pages** — Create, list, retrieve, and delete generated pages
- **/sessions** — Manage user sessions and agent runs
- **/export** — Download generated projects
- **/health** — Health check endpoint

All endpoints are documented in [CLAUDE.md](CLAUDE.md).

---

## Development & Testing

- **Run all tests:**  
  `npm run test`
- **Test individual agents:**  
  `node tests/test-spec-agent-fixed.js`  
  `node tests/test-design-agent-fixed.js`  
  `node tests/test-content-agent-fixed.js`  
  `node tests/test-layout-agent.js`  
  `node tests/test-code-agent.js`
- **Comprehensive agent cycle:**  
  `node tests/test-all-agents-comprehensive.js`

---

## Debugging & Analysis

- **Debug logs:** [`debug/`](debug/)
- **CLI helper:**  
  - List sessions: `node debug-helper.js list`
  - Show session: `node debug-helper.js show <correlationId>`
  - Export session: `node debug-helper.js export <correlationId>`
- **Performance reports:**  
  Generated via [`DebugUtils`](ai/shared/debugUtils.js) for agent timings, memory, and validation scores.

---

## Advanced Features

- **UI/UX Validation:** 600+ rules, 75%+ compliance required for export
- **Industry Adaptation:** Dynamic layouts and content for 6+ industries
- **Modern Design Patterns:** Glassmorphism, gradients, micro-interactions, dark mode
- **Export:** Download as ready-to-run Vite+React project
- **Security:** JWT authentication, rate limiting, and security middleware

---

## Documentation

- [CLAUDE.md](CLAUDE.md) — Architecture, API, and agent details
- [ai/shared/DebugLogger.js](ai/shared/DebugLogger.js) — Debugging and logging
- [ai/shared/validation/](ai/shared/validation/) — Validation rules and schemas
