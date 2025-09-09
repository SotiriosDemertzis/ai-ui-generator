/**
 * @file backend/server.js
 * @description Express server entry point for AI UI Generator backend
 * 
 * This server provides:
 * - Multi-agent AI component generation system
 * - User authentication with JWT
 * - Session and project management
 * - Component export functionality
 * - Real-time component preview integration
 * 
 * Production deployment: Railway (auto-deploy from GitHub main branch)
 * Database: PostgreSQL with automatic connection pooling
 * AI Providers: Groq (primary) + OpenAI (fallback) for cost optimization
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Performance and security imports
const { getRateLimiter, rateLimitHeaders } = require('./middleware/rateLimiting');
const { securityHeaders, sanitizeInput, corsOptions } = require('./middleware/security');

// Route imports - each handles specific functionality
const authRoutes = require('./routes/auth');           // User authentication (login/register)
const pagesRoutes = require('./routes/pages');         // New multi-agent page generation system
// Enhanced UI routes removed - using diagram-based orchestrator in ui.js
const sessionRoutes = require('./routes/sessions');    // Session CRUD operations  
const exportRoutes = require('./routes/export');       // Component export (ZIP/HTML)

// Load environment variables from .env file
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug environment loading
console.log('🔧 Environment variables loaded:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('  GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
console.log('  JWT_SECRET exists:', !!process.env.JWT_SECRET);

const app = express();
// Fix port configuration - ensure consistent port usage
const DEFAULT_PORT = 5000;
const PORT = process.env.PORT || DEFAULT_PORT;

// Validate port configuration
if (PORT != DEFAULT_PORT && !process.env.PORT) {
  console.warn(`⚠️ [Server] Port mismatch detected - using ${PORT} instead of documented ${DEFAULT_PORT}`);
}

// Import telemetry middleware
const { requestTelemetry, errorTelemetry, performanceMonitoring } = require('./middleware/telemetry');

/**
 * Validates required environment variables are present for production deployment
 * Critical for AI API access and database connectivity
 */
const validateEnvironment = () => {
  console.log('🔍 Validating production environment...');
  
  const requiredEnvVars = [
    'GROQ_API_KEY',
    'JWT_SECRET'
  ];
  
  const missing = [];
  const present = [];
  
  // Check if we have database connection info (either DATABASE_URL or individual params)
  const hasDatabaseConfig = process.env.DATABASE_URL || 
    (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD);
  
  if (!hasDatabaseConfig) {
    missing.push('DATABASE_CONNECTION (DATABASE_URL or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD)');
  } else {
    present.push('DATABASE_CONNECTION');
  }
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    } else {
      present.push(envVar);
      // Validate GROQ API Key format
      if (envVar === 'GROQ_API_KEY') {
        const key = process.env[envVar];
        if (!key.startsWith('gsk_') || key.length < 20) {
          console.warn(`⚠️ GROQ_API_KEY format appears invalid (should start with 'gsk_')`);
        } else {
          console.log(`✅ GROQ_API_KEY format validated`);
        }
      }
    }
  });
  
  console.log(`✅ Present environment variables: ${present.join(', ')}`);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error(`❌ Multi-agent AI system will not function without these variables`);
    console.error(`❌ Please set them in your .env file or deployment environment`);
    
    if (process.env.NODE_ENV === 'production') {
      console.error(`❌ Production deployment cannot start without required environment variables`);
      process.exit(1); // Exit in production if env vars missing
    } else {
      console.warn(`⚠️ Development mode: continuing without required environment variables (AI features disabled)`);
    }
  } else {
    console.log(`🚀 All required environment variables present - Multi-agent AI system enabled`);
  }
  
  // Test Groq API connectivity if key is present
  if (process.env.GROQ_API_KEY) {
    testGroqConnection();
  }
};

const testGroqConnection = async () => {
  try {
    console.log(`🔗 Testing Groq API connectivity...`);
    const axios = require('axios');
    
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: 'Test connection - respond with just "OK"'
        }
      ],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.choices) {
      console.log(`✅ Groq API connection successful`);
      console.log(`📊 Model: ${response.data.model}`);
      console.log(`🎯 Multi-agent AI system fully operational`);
    }
  } catch (error) {
    console.error(`❌ Groq API connection failed:`, error.response?.data || error.message);
    console.error(`❌ Multi-agent system will not work until API connection is fixed`);
    
    if (error.response?.status === 401) {
      console.error(`❌ Authentication failed - check GROQ_API_KEY validity`);
    } else if (error.response?.status === 429) {
      console.error(`❌ Rate limited - check Groq API usage limits`);
    }
  }
};

// Call validation on startup
validateEnvironment();

// Test Groq API connectivity if key is present
if (process.env.GROQ_API_KEY) {
  testGroqConnection();
}

// Security and performance middleware (must be early in the stack)
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(sanitizeInput);
app.use(express.json({ limit: '10mb' }));
app.use(getRateLimiter('general'));
app.use(rateLimitHeaders);

// Telemetry middleware
app.use(requestTelemetry());
app.use(errorTelemetry());
app.use(performanceMonitoring());

// Import health route
const healthRoutes = require('./routes/health');

// Routes
app.use('/api/auth', getRateLimiter('auth'), authRoutes);
app.use('/api/pages', pagesRoutes);              // New multi-agent page generation system
// Enhanced UI routes removed - diagram-based orchestrator integrated into /api/ui
app.use('/api/sessions', getRateLimiter('session'), sessionRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/health', healthRoutes);

// Error handling middleware (must be last)
app.use(errorTelemetry());

// ✅ Health check routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI UI Generator Backend is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', async (req, res) => {
  try {
    const dbConnection = require('./database/database');
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '20.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          connected: dbConnection.pool._connected,
          status: dbConnection.pool._connected ? 'healthy' : 'disconnected'
        },
        groq: {
          configured: !!process.env.GROQ_API_KEY,
          status: process.env.GROQ_API_KEY ? 'configured' : 'missing'
        },
        jwt: {
          configured: !!process.env.JWT_SECRET,
          status: process.env.JWT_SECRET ? 'configured' : 'missing'
        }
      }
    };

    // Try to get database health if connected
    if (dbConnection.pool._connected) {
      try {
        // Assuming dbConnection has a getHealthStatus method
        // This part needs to be adapted based on what dbConnection.getHealthStatus() actually does
        // For now, we'll just assume it's healthy if connected
        // const dbHealth = await dbConnection.getHealthStatus();
        // health.services.database = {
        //   ...health.services.database,
        //   ...dbHealth
        // };
      } catch (error) {
        health.services.database.error = error.message;
        health.services.database.status = 'error';
      }
    }

    // Overall health status
    const allHealthy = Object.values(health.services).every(service => 
      service.status === 'healthy' || service.status === 'configured'
    );
    
    if (!allHealthy) {
      health.status = 'degraded';
      res.status(503);
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize database and start server
const db = require('./database/database');
db.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`
🌟 AI UI Generator Backend Server`);
    console.log(`========================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/`);
    console.log(`📊 Detailed health: http://localhost:${PORT}/health`);
    console.log(`
📋 API Routes:`);
    console.log(`   - GET  /api/auth/me`);
    console.log(`   - POST /api/auth/register`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - GET  /api/sessions`);
    console.log(`   - POST /api/sessions`);
    console.log(`   - POST /api/ui/generate`);
    console.log(`   - POST /api/pages/generatePage`);
    console.log(`   - GET  /api/pages/:id`);
    console.log(`   - GET  /api/pages`);
    console.log(`   - POST /api/pages/qa`);
    console.log(`   - GET  /api/export/:sessionId`);
    console.log(`   - GET  /api/health/`);
    console.log(`
💡 For local setup help: see LOCAL_SETUP.md`);
    console.log(`========================================
`);
    console.log(`🎯 System ready for AI generation with optimizations!
`);
  });
}).catch(error => {
  console.error('Failed to initialize database and start server:', error);
  process.exit(1);
});
