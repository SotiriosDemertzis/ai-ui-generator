# AI UI Generator Frontend

A modern React 18 + Vite frontend for real-time interaction with the AI UI Generator backend. This app provides a seamless UI for prompt-driven, multi-agent React page/component generation, live preview, session management, and iterative refinement.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
  - [Component Structure](#component-structure)
  - [State Management](#state-management)
  - [API Integration](#api-integration)
  - [Live Preview](#live-preview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Build & Deploy](#build--deploy)
- [Testing](#testing)
- [Customization](#customization)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

---

## Overview

The frontend enables users to:
- Authenticate and manage sessions
- Submit prompts for AI-driven UI generation
- Preview generated React components/pages live (with Sandpack)
- Refine, export, and manage generated UI assets
- Monitor agent progress and validation scores

---

## Features

- **Live Preview:** Sandpack-powered, real-time rendering of generated React+Tailwind code
- **Modern UI:** Built with Tailwind CSS, Lucide React icons, and responsive layouts
- **Authentication:** JWT-based login/register, session persistence
- **Session Management:** Create, view, and manage prompt/generation sessions
- **Iterative Refinement:** Trigger multi-agent improvement cycles, view validation and quality scores
- **Export:** Download generated projects as ready-to-run Vite+React code
- **Performance Monitoring:** Frontend performance metrics and agent timings
- **Accessibility:** Keyboard navigation, ARIA roles, and color contrast checks

---

## Architecture

### Component Structure

- **App Shell:** [`src/App.jsx`](src/App.jsx) — Main layout, routing, and context providers
- **Authentication:** [`Login.jsx`](src/components/Login.jsx), [`Register.jsx`](src/components/Register.jsx)
- **Dashboard:** [`EnhancedDashboard.jsx`](src/components/EnhancedDashboard.jsx) — Main workspace
- **Prompting:** [`ChatInterface.jsx`](src/components/ChatInterface.jsx), [`AdvancedPromptBuilder.jsx`](src/components/AdvancedPromptBuilder.jsx)
- **Preview:** [`PreviewPanel.jsx`](src/components/PreviewPanel.jsx) — Sandpack live code preview
- **Session Management:** [`SessionSidebar.jsx`](src/components/SessionSidebar.jsx), [`SessionCreationModal.jsx`](src/components/SessionCreationModal.jsx), [`DeleteSessionModal.jsx`](src/components/DeleteSessionModal.jsx)
- **Refinement:** [`IterativeRefinement.jsx`](src/components/IterativeRefinement.jsx), [`PromptCustomizer.jsx`](src/components/PromptCustomizer.jsx)
- **UI Feedback:** [`Toast.jsx`](src/components/Toast.jsx), [`useToast.js`](src/hooks/useToast.js)
- **Utilities:** [`componentProcessor.js`](src/utils/componentProcessor.js), [`api.js`](src/utils/api.js), [`performance.js`](src/utils/performance.js)

### State Management

- **Session State:** Managed via React context and localStorage for persistence
- **Authentication State:** JWT token stored in localStorage, validated on app load
- **API State:** All backend interactions via [`api.js`](src/utils/api.js), with error handling and loading states

### API Integration

- All API calls are made to the backend (see `VITE_API_URL`).
- Endpoints used:
  - `/auth` — Login, register, token refresh
  - `/pages` — Create, fetch, delete generated pages
  - `/sessions` — Manage user sessions and agent runs
  - `/export` — Download generated projects

### Live Preview

- Uses [Sandpack](https://sandpack.dev/) to render generated React+Tailwind code in-browser
- Supports hot reloading, error boundaries, and isolated preview environments
- Code is sanitized and transformed via [`componentProcessor.js`](src/utils/componentProcessor.js)

---

## Project Structure

```
frontend/
├── public/                  # Static assets (favicon, manifest, sw.js)
├── src/
│   ├── components/          # All React components (UI, dashboard, preview, auth, etc.)
│   ├── hooks/               # Custom React hooks (e.g., useToast)
│   ├── utils/               # API, code processing, constants, performance
│   ├── App.jsx              # Main app shell
│   ├── index.css            # Tailwind CSS setup
│   ├── main.jsx             # Entry point
│   └── main.optimized.jsx   # (Optional) Optimized entry for production
├── .claude/                 # Local settings for prompt engineering
├── components.json          # (Optional) Component registry
├── index.html               # HTML entry
├── package.json             # Project metadata and scripts
├── tailwind.config.js       # Tailwind CSS config
├── vite.config.js           # Vite config
└── README.md                # This file
```

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env` and set:
     ```
     VITE_API_URL=http://localhost:5000
     ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the app**
   Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

- `VITE_API_URL` — URL of the backend API (default: `http://localhost:5000`)
- (Optional) Add other environment variables as needed for feature toggles or analytics

---

## Build & Deploy

- **Build for production:**  
  ```bash
  npm run build
  ```
- **Preview production build:**  
  ```bash
  npm run preview
  ```
- **Deploy:**  
  The output in `dist/` can be deployed to any static hosting (Netlify, Vercel, etc.)

---

## Testing

- (Add your preferred testing setup, e.g. Vitest, Jest, Cypress)
- Example:  
  ```bash
  npm run test
  ```

---

## Customization

- **Theming:**  
  Edit `tailwind.config.js` and `src/index.css` for custom colors, fonts, and breakpoints.
- **Component Extensions:**  
  Add new components to `src/components/` and register them in the dashboard or preview.
- **API Integration:**  
  Update `src/utils/api.js` for custom endpoints or authentication flows.

---

## Advanced Usage

- **Iterative Refinement:**  
  Use the dashboard to trigger multi-agent improvement cycles and review quality scores.
- **Export:**  
  Download generated components as a ready-to-run Vite+React project from the export menu.
- **Performance Monitoring:**  
  Frontend performance metrics are available in the dashboard.
- **Accessibility:**  
  All components are designed for keyboard navigation and screen readers.

---

## Troubleshooting

- **API Errors:**  
  Ensure `VITE_API_URL` matches your backend server and CORS is enabled.
- **Preview Issues:**  
  Check for syntax errors in generated code; see browser console for Sandpack errors.
- **Authentication:**  
  If login fails, verify backend JWT secret and user registration.

---

## Documentation

- [../README.md](../README.md) — Project overview
- [../backend/CLAUDE.md](../backend/CLAUDE.md) — Backend API and agent documentation