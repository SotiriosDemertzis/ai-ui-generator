/**
 * @file backend/middleware/rateLimiting.js
 * @description Rate limiting middleware to protect against abuse and ensure fair usage
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiting
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Skip rate limiting for localhost in development
  skip: (req) => {
    if (process.env.NODE_ENV !== 'production') {
      return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});

/**
 * Strict rate limiting for AI generation endpoints
 */
const generationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // Limit to 10 generations per 15 minutes in production
  message: {
    error: 'Too many AI generation requests. Please wait before creating more components.',
    retryAfter: '15 minutes',
    suggestion: 'Try refining existing components or use the iterative refinement feature.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  // Custom key generator to track by user ID if available
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  
  // Skip for localhost in development
  skip: (req) => {
    if (process.env.NODE_ENV !== 'production') {
      return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
    return false;
  },
  
  // Custom handler for better UX
  handler: (req, res) => {
    console.warn(`🚨 Rate limit exceeded for ${req.user?.id || req.ip} on generation endpoint`);
    
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many AI generation requests. Please wait before creating more components.',
      retryAfter: Math.ceil(req.rateLimit.resetTime.getTime() / 1000),
      suggestions: [
        'Try refining your existing components using the iterative refinement feature',
        'Use the advanced builder to create more detailed specifications',
        'Review and optimize your current components'
      ]
    });
  }
});

/**
 * Authentication rate limiting to prevent brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  // Skip rate limiting for localhost in development
  skip: (req) => {
    if (process.env.NODE_ENV !== 'production') {
      return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});

/**
 * Session creation rate limiting
 */
const sessionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 100, // 20 sessions per 5 minutes in production
  message: {
    error: 'Too many sessions created. Please use existing sessions or wait a moment.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  
  skip: (req) => {
    if (process.env.NODE_ENV !== 'production') {
      return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});

/**
 * Progressive rate limiting for repeat offenders
 */
class AdaptiveRateLimiter {
  constructor() {
    this.offenders = new Map(); // Track repeat offenders
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }
  
  middleware() {
    return (req, res, next) => {
      const key = req.user?.id || req.ip;
      const now = Date.now();
      
      if (!this.offenders.has(key)) {
        this.offenders.set(key, { count: 0, lastSeen: now, penalties: 0 });
        return next();
      }
      
      const record = this.offenders.get(key);
      const timeSinceLastSeen = now - record.lastSeen;
      
      // Reset count if enough time has passed
      if (timeSinceLastSeen > 60000) { // 1 minute reset
        record.count = 0;
        record.penalties = Math.max(0, record.penalties - 1); // Reduce penalties over time
      }
      
      record.count++;
      record.lastSeen = now;
      
      // Progressive penalties for repeat offenders
      const baseLimit = 10;
      const currentLimit = Math.max(1, baseLimit - (record.penalties * 3));
      
      if (record.count > currentLimit) {
        record.penalties++;
        console.warn(`🚨 Adaptive rate limit exceeded for ${key} (penalties: ${record.penalties})`);
        
        return res.status(429).json({
          success: false,
          error: 'ADAPTIVE_RATE_LIMIT',
          message: `Request frequency too high. Current limit: ${currentLimit} requests per minute.`,
          penalties: record.penalties,
          suggestion: 'Please reduce request frequency to avoid extended penalties.'
        });
      }
      
      next();
    };
  }
  
  cleanup() {
    const now = Date.now();
    const fiveMinutesAgo = now - 300000; // 5 minutes
    
    for (const [key, record] of this.offenders.entries()) {
      if (record.lastSeen < fiveMinutesAgo && record.penalties === 0) {
        this.offenders.delete(key);
      }
    }
  }
  
  getStats() {
    return {
      totalTracked: this.offenders.size,
      offenders: Array.from(this.offenders.entries()).map(([key, record]) => ({
        key: key.substring(0, 8) + '...', // Anonymize for privacy
        count: record.count,
        penalties: record.penalties,
        lastSeen: new Date(record.lastSeen).toISOString()
      }))
    };
  }
}

const adaptiveRateLimiter = new AdaptiveRateLimiter();

/**
 * Rate limiting configuration based on endpoint type
 */
const getRateLimiter = (type) => {
  switch (type) {
    case 'generation':
      return generationLimiter;
    case 'auth':
      return authLimiter;
    case 'session':
      return sessionLimiter;
    case 'adaptive':
      return adaptiveRateLimiter.middleware();
    default:
      return generalLimiter;
  }
};

/**
 * Middleware to add rate limiting headers for better UX
 */
const rateLimitHeaders = (req, res, next) => {
  // Add custom headers for frontend to display rate limit status
  if (req.rateLimit) {
    try {
      res.setHeader('X-AI-Generation-Limit', '10');
      res.setHeader('X-AI-Generation-Remaining', Math.max(0, 10 - req.rateLimit.used));
      res.setHeader('X-AI-Generation-Reset', req.rateLimit.resetTime.toISOString());
    } catch (error) {
      // Headers already sent, ignore
    }
  }
  
  next();
};

module.exports = {
  generalLimiter,
  generationLimiter,
  authLimiter,
  sessionLimiter,
  adaptiveRateLimiter,
  getRateLimiter,
  rateLimitHeaders
};