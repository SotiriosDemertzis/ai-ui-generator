# 🤖 AI UI Generator - Full Stack Application

A sophisticated full-stack React application that uses a **9-agent AI system** to generate production-ready React components from natural language prompts. Transform your ideas into modern, responsive, and accessible UI components with industry-specific content and design patterns.

![AI UI Generator](https://img.shields.io/badge/React-18+-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![AI-Powered](https://img.shields.io/badge/AI-Multi--Agent-purple) ![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)

---

## 🌟 **Features**

### 🎯 **AI-Powered Generation**
- **9 Specialized AI Agents** working in sequence for comprehensive component generation
- **Multi-Pass Validation** with 600+ UI/UX rules and 75% compliance threshold
- **Industry-Specific Content** for Healthcare, E-commerce, Technology, Finance, Education, Real Estate
- **Modern Design Patterns** including Glassmorphism, gradient systems, micro-interactions

### 🚀 **Full-Stack Architecture**
- **Frontend**: React 18 + Vite + Tailwind CSS + Sandpack Live Preview
- **Backend**: Node.js + Express + PostgreSQL + Multi-Agent Orchestrator
- **Real-time Preview**: Live component rendering with hot reload
- **Authentication**: JWT-based security with session management

### 💼 **Production Ready**
- **Export Functionality**: Download complete Vite+React projects
- **Accessibility Compliance**: WCAG 2.1 AA standards
- **Responsive Design**: Mobile-first approach with modern breakpoints  
- **Performance Optimized**: Context compression and intelligent caching

---

## 🏗️ **Architecture Overview**

### **Multi-Agent Pipeline**

```
User Prompt → SpecAgent → DesignAgent + ContentAgent → LayoutAgent → 
CodeAgent → DesignImplementationAgent + ImageIntegrationAgent → 
TailwindStylistAgent ↔ ValidatorAgent → Final Component
```

#### **AI Agents (9 Total)**
1. **SpecAgent** - Requirements analysis and technical specifications
2. **DesignAgent** - Modern design system creation with 2024-2025 patterns
3. **ContentAgent** - Industry-specific, authentic content generation
4. **LayoutAgent** - Responsive layout structure planning
5. **CodeAgent** - React component generation with Tailwind CSS
6. **DesignImplementationAgent** - Design-to-Tailwind translation
7. **ImageIntegrationAgent** - Real image integration via Pexels API
8. **TailwindStylistAgent** - Advanced styling optimization
9. **ValidatorAgent** - Quality assurance and compliance validation

### **Tech Stack**

#### **Frontend** (`/frontend`)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + Lucide React Icons
- **Preview**: Sandpack for live component rendering
- **State**: Context API with localStorage persistence
- **Build**: Optimized production builds with code splitting

#### **Backend** (`/backend`)  
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL with connection pooling
- **AI Integration**: Groq API (LLaMA 3.3 70B Versatile)
- **Authentication**: JWT with bcrypt password hashing
- **Debug System**: Comprehensive logging with correlation IDs

---

## 📁 **Project Structure**

```
ai-ui-generator/
├── 🎨 frontend/                    # React application
│   ├── src/
│   │   ├── components/            # UI components & dashboard
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── utils/                 # API & utilities
│   │   └── App.jsx               # Main application
│   ├── public/                    # Static assets
│   └── package.json              # Frontend dependencies
│
├── ⚙️ backend/                     # Node.js server
│   ├── ai/
│   │   ├── agents/               # 9 AI agents
│   │   ├── shared/               # Utilities & validation
│   │   └── orchestrator.js       # Pipeline coordinator
│   ├── database/                 # PostgreSQL schema
│   ├── routes/                   # Express API endpoints
│   ├── middleware/               # Auth, security, logging
│   ├── tests/                    # Agent & system tests
│   └── server.js                # Server entry point
│
├── 📚 docs/                       # Documentation
├── 🔧 .env.example               # Environment template
└── 📖 README.md                  # This file
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- PostgreSQL 12+
- npm or yarn
- Groq API Key ([Get one free](https://console.groq.com/))

### **1. Clone Repository**
```bash
git clone https://github.com/SotiriosDemertzis/ai-ui-generator.git
cd ai-ui-generator
```

### **2. Backend Setup**
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your API keys and database URL

# Setup database
npm run migrate
npm run seed

# Start backend server
npm run dev
```

### **3. Frontend Setup**
```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000/api

# Start frontend development server  
npm run dev
```

### **4. Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 🔐 **Environment Configuration**

### **Backend (.env)**
```bash
# AI & APIs
GROQ_API_KEY=gsk_your_groq_api_key_here
PEXELS_API_KEY=your_pexels_api_key_here

# Authentication  
JWT_SECRET=your_jwt_secret_minimum_32_chars

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_ui_generator

# Server
PORT=5000
NODE_ENV=development
```

### **Frontend (.env)**
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

---

## 🧪 **Development & Testing**

### **Backend Testing**
```bash
cd backend

# Test all agents
npm run test

# Test individual agents
node tests/test-spec-agent-fixed.js
node tests/test-design-agent-fixed.js  
node tests/test-content-agent-fixed.js
node tests/test-layout-agent.js
node tests/test-code-agent.js

# Comprehensive system test
node tests/test-all-agents-comprehensive.js
```

### **Frontend Testing**
```bash
cd frontend

# Run tests (when configured)
npm run test

# Production build test
npm run build
npm run preview
```

### **Development Commands**

#### **Root Level (Full Stack)**
```bash
npm run dev          # Start both backend and frontend
npm run server       # Backend only
npm run client       # Frontend only
```

#### **Backend Specific**
```bash
npm run dev          # Development with auto-reload
npm start            # Production server
npm run migrate      # Database migrations
npm run seed         # Seed database
```

#### **Frontend Specific**  
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 🔍 **Debug & Analysis**

### **Debug Infrastructure**
- **Correlation IDs**: Track complete generation sessions
- **Agent Logging**: Detailed input/output and execution time
- **Memory Monitoring**: Heap usage and performance metrics
- **Validation Tracking**: UI/UX compliance and content utilization

### **Debug CLI Tools**
```bash
cd backend

# List debug sessions
node debug-helper.js list

# Show session details
node debug-helper.js show <correlationId>

# Export session data
node debug-helper.js export <correlationId>

# Clean old debug files
node debug-helper.js cleanup
```

---

## 📊 **Performance Metrics**

### **Current System Performance**
- **Total Pipeline Execution**: 20-45 seconds
- **Success Rate**: 100% (all 9 agents operational)
- **Memory Usage**: <100MB peak growth per generation
- **UI/UX Compliance**: 75%+ validation threshold
- **Content Utilization**: 90%+ requirement enforced

### **Agent Execution Times**
- SpecAgent: 2-3s
- DesignAgent/ContentAgent: 5-8s (parallel)
- LayoutAgent: 2-3s
- CodeAgent: 5-15s (most complex)
- TailwindStylist: 3-5s
- ValidatorAgent: 1-6s per iteration

---

## 🎯 **Use Cases**

### **For Developers**
- **Rapid Prototyping**: Generate landing pages in minutes
- **Design System Creation**: Modern UI patterns and components
- **Learning Tool**: Study AI-generated modern React patterns

### **For Designers**  
- **Design-to-Code**: Convert design concepts to React components
- **Industry Templates**: Generate industry-specific layouts
- **Accessibility Testing**: WCAG-compliant component generation

### **For Businesses**
- **MVP Development**: Quickly generate customer-facing pages
- **A/B Testing**: Generate multiple design variations
- **Content Strategy**: Industry-appropriate content generation

---

## 🛡️ **Security Features**

- **JWT Authentication** with secure token management
- **Input Validation** and sanitization across all endpoints
- **Rate Limiting** to prevent API abuse
- **CORS Configuration** for cross-origin security
- **Environment Variable Protection** (.env files gitignored)
- **SQL Injection Protection** with parameterized queries

---

## 🚀 **Deployment**

### **Frontend Deployment**
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify, Vercel, or any static host
```

### **Backend Deployment**
```bash
cd backend
# Set production environment variables
NODE_ENV=production
# Deploy to Railway, Heroku, AWS, or any Node.js host
```

### **Database Setup**
- Configure PostgreSQL instance
- Run migrations: `npm run migrate`
- Seed initial data: `npm run seed`

---

## 📚 **Documentation**

- **[Backend Documentation](backend/CLAUDE.md)** - AI agents, API endpoints, architecture
- **[Frontend Documentation](frontend/README.md)** - Components, hooks, utilities
- **[Agent Documentation](backend/ai/agents/CLAUDE.md)** - Individual agent specifications
- **[Validation Rules](backend/.claude/ModernUIUXRules.json)** - 600+ UI/UX compliance rules

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all agents pass comprehensive testing

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⭐ **Acknowledgments**

- **Groq** - For providing fast LLaMA 3.3 70B inference
- **Pexels** - For high-quality stock images
- **Sandpack** - For live React component preview
- **Tailwind CSS** - For utility-first styling
- **React Team** - For the amazing React ecosystem

---

<div align="center">

**Built with ❤️ using AI-powered development**

*Generate beautiful React components from natural language - powered by 9 specialized AI agents*

</div>
