/**
 * @file backend/middleware/security.js
 * @description Comprehensive security middleware for input sanitization and protection
 */

const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');

/**
 * Input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize all string inputs recursively
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);
    
    next();
  } catch (error) {
    console.error('❌ Input sanitization failed:', error);
    res.status(400).json({
      success: false,
      error: 'INVALID_INPUT',
      message: 'Invalid input detected'
    });
  }
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return sanitizeValue(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key names
    const cleanKey = sanitizeKey(key);
    if (cleanKey) {
      sanitized[cleanKey] = sanitizeObject(value);
    }
  }
  
  return sanitized;
};

/**
 * Sanitize individual values
 */
const sanitizeValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  
  // Remove potential XSS vectors
  let sanitized = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: []
  });
  
  // Additional sanitization for common attack vectors
  sanitized = sanitized
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/eval\(/gi, '') // Remove eval calls
    .replace(/expression\(/gi, ''); // Remove CSS expressions
  
  return sanitized.trim();
};

/**
 * Sanitize object keys
 */
const sanitizeKey = (key) => {
  if (typeof key !== 'string') {
    return null;
  }
  
  // Only allow alphanumeric keys with underscores and hyphens
  const cleanKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
  
  // Reject keys that are too long or suspicious
  if (cleanKey.length > 50 || cleanKey.length === 0) {
    return null;
  }
  
  return cleanKey;
};

/**
 * Validate prompt input specifically
 */
const validatePrompt = (req, res, next) => {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PROMPT',
      message: 'Prompt is required and must be a string'
    });
  }
  
  // Validate prompt length - increased limit for advanced/expert mode prompts
  if (!validator.isLength(prompt, { min: 5, max: 8000 })) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PROMPT_LENGTH',
      message: 'Prompt must be between 5 and 8000 characters'
    });
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /(\bjavascript\b|\bvbscript\b)/i,
    /<script\b/i,
    /eval\s*\(/i,
    /document\.write/i,
    /window\.location/i,
    /\bxss\b/i,
    /\bsql\b.*\binjection\b/i,
    /union\s+select/i,
    /drop\s+table/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(prompt)) {
      console.warn(`🚨 Suspicious prompt detected from ${req.ip}: ${prompt.substring(0, 100)}...`);
      return res.status(400).json({
        success: false,
        error: 'SUSPICIOUS_CONTENT',
        message: 'Prompt contains potentially unsafe content'
      });
    }
  }
  
  next();
};

/**
 * Validate session data
 */
const validateSession = (req, res, next) => {
  const { sessionId } = req.body;
  
  if (sessionId && !validator.isUUID(sessionId)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_SESSION_ID',
      message: 'Session ID must be a valid UUID'
    });
  }
  
  next();
};

/**
 * Validate user registration data
 */
const validateRegistration = (req, res, next) => {
  const { email, password, name } = req.body;
  
  // Validate email
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_EMAIL',
      message: 'Valid email address is required'
    });
  }
  
  // Validate password strength
  if (!password || !validator.isLength(password, { min: 8, max: 128 })) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PASSWORD',
      message: 'Password must be between 8 and 128 characters'
    });
  }
  
  // Check password complexity
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
    return res.status(400).json({
      success: false,
      error: 'WEAK_PASSWORD',
      message: 'Password must contain uppercase, lowercase, numbers, and special characters'
    });
  }
  
  // Validate name
  if (!name || !validator.isLength(name, { min: 2, max: 50 })) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_NAME',
      message: 'Name must be between 2 and 50 characters'
    });
  }
  
  // Sanitize name to prevent XSS
  req.body.name = validator.escape(name);
  
  next();
};

/**
 * CORS configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:5173'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'production') {
      // In production, only allow specific domains
      const productionOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      if (!productionOrigins.includes(origin)) {
        return callback(new Error('Not allowed by CORS'), false);
      }
    } else {
      // In development, be more permissive
      if (!allowedOrigins.includes(origin)) {
        console.warn(`⚠️ CORS warning: ${origin} not in allowed origins`);
      }
    }
    
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for React
    "style-src 'self' 'unsafe-inline'", // Needed for Tailwind
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.groq.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  
  next();
};

/**
 * Request size limiting
 */
const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxBytes = parseSize(maxSize);
    
    if (contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        error: 'REQUEST_TOO_LARGE',
        message: `Request size exceeds ${maxSize} limit`,
        maxSize: maxSize
      });
    }
    
    next();
  };
};

/**
 * Parse size string to bytes
 */
const parseSize = (sizeStr) => {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  
  if (!match) return 0;
  
  const size = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return Math.floor(size * units[unit]);
};

/**
 * Logging middleware for security events
 */
const securityLogger = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(obj) {
    // Log security-related responses
    if (obj && obj.error && 
        ['INVALID_INPUT', 'SUSPICIOUS_CONTENT', 'RATE_LIMIT_EXCEEDED'].includes(obj.error)) {
      console.warn(`🔒 Security Event: ${obj.error} from ${req.ip} - ${req.method} ${req.path}`);
    }
    
    return originalJson.call(this, obj);
  };
  
  next();
};

module.exports = {
  sanitizeInput,
  validatePrompt,
  validateSession,
  validateRegistration,
  corsOptions,
  securityHeaders,
  requestSizeLimit,
  securityLogger
};