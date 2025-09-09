/**
 * @file backend/routes/health.js
 * @description Comprehensive health check system for monitoring system status
 */

const express = require('express');
const pool = require('../database/database');
const cacheService = require('../services/cacheService');
const router = express.Router();

/**
 * Check database connectivity and performance
 */
const checkDatabase = async () => {
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      version: result.rows[0].pg_version.split(' ')[0],
      timestamp: result.rows[0].current_time,
      details: {
        poolSize: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Check GROQ API connectivity
 */
const checkGroqAPI = async () => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return {
        status: 'misconfigured',
        error: 'GROQ_API_KEY not configured'
      };
    }
    
    const axios = require('axios');
    const start = Date.now();
    
    // Simple API test - just check if we can connect
    const response = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      timeout: 5000
    });
    
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      modelsAvailable: response.data.data?.length || 0,
      endpoint: 'https://api.groq.com'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      code: error.code,
      endpoint: 'https://api.groq.com'
    };
  }
};

/**
 * Check cache service status
 */
const checkCache = async () => {
  try {
    const stats = await cacheService.getStats();
    const testKey = 'health-check-test';
    const testValue = { timestamp: Date.now(), test: true };
    
    // Test cache write/read
    await cacheService.set(testKey, testValue, 60);
    const retrieved = await cacheService.get(testKey);
    
    const isWorking = retrieved && retrieved.test === true;
    
    return {
      status: isWorking ? 'healthy' : 'degraded',
      type: stats.type,
      connected: stats.connected,
      testPassed: isWorking,
      stats: stats
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      type: 'unknown'
    };
  }
};


/**
 * Get system metrics
 */
const getSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    uptime: `${Math.round(process.uptime())}s`,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };
};

/**
 * Calculate overall system health score
 */
const calculateHealthScore = (checks) => {
  const weights = {
    database: 0.3,
    groqAPI: 0.3,
    cache: 0.2,
    orchestrator: 0.2
  };
  
  let score = 0;
  let totalWeight = 0;
  
  Object.entries(checks).forEach(([service, check]) => {
    if (weights[service]) {
      const serviceScore = check.status === 'healthy' ? 100 : 
                          check.status === 'degraded' ? 70 : 0;
      score += serviceScore * weights[service];
      totalWeight += weights[service];
    }
  });
  
  return Math.round(score / totalWeight);
};

/**
 * Main health check endpoint
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Run all health checks in parallel for speed
    const [database, groqAPI, cache, orchestrator] = await Promise.all([
      checkDatabase(),
      checkGroqAPI(),
      checkCache(),
      checkOrchestrator()
    ]);
    
    const checks = { database, groqAPI, cache, orchestrator };
    const metrics = getSystemMetrics();
    const healthScore = calculateHealthScore(checks);
    const responseTime = Date.now() - startTime;
    
    const health = {
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'degraded' : 'unhealthy',
      score: healthScore,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      metrics
    };
    
    // Log health status for monitoring
    console.log(`🏥 Health Check: ${health.status} (${health.score}/100) - ${responseTime}ms`);
    
    // Return appropriate HTTP status
    const httpStatus = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    res.status(httpStatus).json(health);
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      score: 0,
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

/**
 * Detailed health check with extended diagnostics
 */
router.get('/detailed', async (req, res) => {
  try {
    const [database, groqAPI, cache, orchestrator] = await Promise.all([
      checkDatabase(),
      checkGroqAPI(), 
      checkCache(),
      checkOrchestrator()
    ]);
    
    const metrics = getSystemMetrics();
    const healthScore = calculateHealthScore({ database, groqAPI, cache, orchestrator });
    
    // Extended diagnostics
    const diagnostics = {
      database: {
        ...database,
        recentActivity: await getRecentDatabaseActivity()
      },
      cache: {
        ...cache,
        hitRate: await getCacheHitRate()
      },
      orchestrator: {
        ...orchestrator,
        recentGenerations: await getRecentGenerations()
      }
    };
    
    res.json({
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'degraded' : 'unhealthy',
      score: healthScore,
      timestamp: new Date().toISOString(),
      checks: { database, groqAPI, cache, orchestrator },
      metrics,
      diagnostics
    });
    
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Simple readiness probe for Kubernetes/Docker
 */
router.get('/ready', async (req, res) => {
  try {
    // Quick checks for essential services
    const dbCheck = await pool.query('SELECT 1');
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    
    if (dbCheck.rows.length > 0 && hasGroqKey) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

/**
 * Simple liveness probe for Kubernetes/Docker
 */
router.get('/live', (req, res) => {
  res.status(200).json({ 
    status: 'alive',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Helper functions for detailed diagnostics
 */
async function getRecentDatabaseActivity() {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as recent_prompts 
      FROM prompts 
      WHERE created_at > NOW() - INTERVAL '1 hour'
    `);
    return {
      promptsLastHour: parseInt(result.rows[0].recent_prompts)
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function getCacheHitRate() {
  try {
    // This would need to be implemented based on cache service metrics
    return { hitRate: 'N/A', note: 'Hit rate tracking not implemented' };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Check orchestrator system health
 */
async function checkOrchestrator() {
  try {
    const { runSimplifiedOrchestrator } = require('../ai/orchestrator');
    
    // Test with a simple prompt to ensure orchestrator is working
    const start = Date.now();
    const testResult = await runSimplifiedOrchestrator('health check test', null, {
      testMode: true,
      timeout: 10000
    });
    const responseTime = Date.now() - start;
    
    return {
      status: testResult.success ? 'healthy' : 'degraded',
      responseTime: `${responseTime}ms`,
      type: 'simplified',
      testPassed: testResult.success,
      orchestratorVersion: testResult.metadata?.orchestrator || 'simplified',
      agentsAvailable: 4 // Our 4 simplified agents
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      type: 'simplified'
    };
  }
}

async function getRecentGenerations() {
  try {
    // This would query the database for recent page generations
    const result = await pool.query(`
      SELECT COUNT(*) as recent_generations
      FROM pages 
      WHERE created_at > NOW() - INTERVAL '1 hour'
    `);
    return {
      generationsLastHour: parseInt(result.rows[0].recent_generations)
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * COST OPTIMIZATION: Cost analytics endpoint
 */
router.get('/cost-analytics', async (req, res) => {
  try {
    const { timeframe = '24 hours' } = req.query;
    const telemetryService = require('../middleware/telemetry');
    
    const [costAnalytics, cacheStats] = await Promise.all([
      telemetryService.getCostAnalytics(timeframe),
      Promise.resolve({ totalCacheSize: 0, blueprintCache: { hitRate: '0%' }, brandCache: { hitRate: '0%' }, contentCache: { hitRate: '0%' } })
    ]);

    const costOptimizationReport = {
      timeframe,
      currentPeriod: {
        totalCost: parseFloat(costAnalytics.totalCost || 0).toFixed(6),
        totalGenerations: costAnalytics.totalGenerations || 0,
        avgCostPerGeneration: parseFloat(costAnalytics.avgCostPerGeneration || 0).toFixed(6),
        totalSavings: parseFloat(costAnalytics.totalSavings || 0).toFixed(6)
      },
      projections: {
        estimatedMonthlyCost: parseFloat(costAnalytics.estimatedMonthlyCost || 0).toFixed(2),
        estimatedMonthlySavings: parseFloat(costAnalytics.estimatedMonthlySavings || 0).toFixed(2),
        savingsPercentage: costAnalytics.totalCost > 0 ? 
          ((costAnalytics.totalSavings / (costAnalytics.totalCost + costAnalytics.totalSavings)) * 100).toFixed(1) : '0.0'
      },
      optimization: {
        cacheHitRates: {
          blueprint: cacheStats.blueprintCache.hitRate,
          brand: cacheStats.brandCache.hitRate,
          content: cacheStats.contentCache.hitRate
        },
        totalCacheSize: cacheStats.totalCacheSize,
        optimizedGenerations: costAnalytics.optimizedGenerations || 0,
        avgCacheHits: parseFloat(costAnalytics.avgCacheHits || 0).toFixed(1)
      },
      pageTypeBreakdown: costAnalytics.pageTypeBreakdown || [],
      recommendations: generateCostOptimizationRecommendations(costAnalytics, cacheStats),
      timestamp: new Date().toISOString()
    };

    res.json(costOptimizationReport);
    
  } catch (error) {
    console.error('❌ Cost analytics error:', error);
    res.status(500).json({
      error: 'Failed to generate cost analytics',
      message: error.message
    });
  }
});

/**
 * Generate cost optimization recommendations
 */
function generateCostOptimizationRecommendations(costAnalytics, cacheStats) {
  const recommendations = [];
  
  // Check cache hit rates
  const blueprintHitRate = parseFloat(cacheStats.blueprintCache.hitRate.replace('%', ''));
  const brandHitRate = parseFloat(cacheStats.brandCache.hitRate.replace('%', ''));
  
  if (blueprintHitRate < 40) {
    recommendations.push({
      type: 'cache',
      priority: 'high',
      message: `Blueprint cache hit rate is low (${blueprintHitRate}%). Consider increasing cache TTL or improving cache key strategy.`,
      potentialSavings: '$0.01-0.02 per generation'
    });
  }
  
  if (brandHitRate < 30) {
    recommendations.push({
      type: 'cache',
      priority: 'medium',
      message: `Brand cache hit rate is low (${brandHitRate}%). Group similar page types for better reuse.`,
      potentialSavings: '$0.003-0.005 per generation'
    });
  }
  
  // Check generation patterns
  if (costAnalytics.totalGenerations > 0) {
    const avgCost = parseFloat(costAnalytics.avgCostPerGeneration || 0);
    if (avgCost > 0.025) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        message: `Average cost per generation is high ($${avgCost.toFixed(4)}). Consider enabling more agent skipping for simple pages.`,
        potentialSavings: '30-50% cost reduction'
      });
    }
  }
  
  // Check optimization adoption
  const optimizationRate = costAnalytics.totalGenerations > 0 ? 
    (costAnalytics.optimizedGenerations / costAnalytics.totalGenerations) * 100 : 0;
  
  if (optimizationRate < 60) {
    recommendations.push({
      type: 'adoption',
      priority: 'medium',
      message: `Only ${optimizationRate.toFixed(1)}% of generations use cost optimizations. Review agent selection criteria.`,
      potentialSavings: '20-40% additional savings'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      priority: 'info',
      message: 'Cost optimization is working well! Continue monitoring for further improvements.',
      potentialSavings: 'System optimized'
    });
  }
  
  return recommendations;
}

module.exports = router;