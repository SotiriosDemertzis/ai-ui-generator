/**
 * @file backend/middleware/telemetry.js
 * @description Comprehensive telemetry and logging middleware for multi-agent system
 * Tracks performance, usage, errors, and business metrics in PostgreSQL
 */

const dbConnection = require('../database/database');
const os = require('os');

/**
 * Telemetry Service Class
 * Handles all telemetry data collection and storage
 */
class TelemetryService {
  constructor() {
    this.instanceId = `instance_${process.pid}_${Date.now()}`;
    this.metricsBuffer = [];
    this.bufferSize = 100; // Batch insert after 100 events
    this.flushInterval = 30000; // Flush every 30 seconds
    this.startTime = Date.now();
    
    // Start background flush process
    this.startBackgroundFlush();
    
    // Track system metrics
    this.trackSystemMetrics();
  }

  /**
   * Express middleware for request telemetry
   * Tracks all API requests with performance and business metrics
   */
  requestTelemetry() {
    return async (req, res, next) => {
      const startTime = Date.now();
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      // Add request ID to request for tracking
      req.requestId = requestId;
      
      // ENHANCED: Extract session context with multiple fallback strategies
      const sessionId = this.extractSessionId(req);
      const userId = this.extractUserId(req);
      
      // Extract request metadata
      const requestMetadata = {
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        sessionId,
        userId,
        contentLength: req.get('content-length') || 0
      };

      // Log request start
      await this.logEvent({
        eventType: 'request_start',
        eventCategory: 'performance',
        eventData: {
          requestId,
          ...requestMetadata
        },
        sessionId: requestMetadata.sessionId,
        userId: requestMetadata.userId
      });

      // Override res.json to capture response data
      const originalJson = res.json;
      let responseData = null;
      
      res.json = function(data) {
        responseData = data;
        return originalJson.call(this, data);
      };

      // Handle response completion
      res.on('finish', async () => {
        const duration = Date.now() - startTime;
        const statusCategory = Math.floor(res.statusCode / 100);
        
        // Log request completion
        await this.logEvent({
          eventType: 'request_complete',
          eventCategory: statusCategory === 2 ? 'performance' : 'error',
          eventData: {
            requestId,
            statusCode: res.statusCode,
            responseSize: res.get('content-length') || 0,
            success: statusCategory === 2,
            responseData: responseData ? {
              success: responseData.success,
              hasComponent: !!responseData.jsx_code,
              qualityScore: responseData.metadata?.score,
              strategy: responseData.metadata?.strategy
            } : null,
            ...requestMetadata
          },
          durationMs: duration,
          sessionId: requestMetadata.sessionId,
          userId: requestMetadata.userId
        });

        // Track business metrics for generation requests
        if (req.path.includes('/generate') && responseData?.success) {
          await this.trackGenerationMetrics({
            requestId,
            sessionId: requestMetadata.sessionId,
            userId: requestMetadata.userId,
            prompt: req.body?.prompt,
            strategy: responseData.metadata?.strategy,
            qualityScore: responseData.metadata?.score,
            processingTime: duration,
            iterations: responseData.metadata?.iterations || 1,
            tokenCount: this.estimateTokenCount(req.body?.prompt, responseData.jsx_code),
            cost: this.estimateCost(req.body?.prompt, responseData.jsx_code)
          });
        }
      });

      // Handle request errors
      res.on('error', async (error) => {
        const duration = Date.now() - startTime;
        
        await this.logEvent({
          eventType: 'request_error',
          eventCategory: 'error',
          eventData: {
            requestId,
            error: error.message,
            stack: error.stack?.substring(0, 1000), // Limit stack trace
            ...requestMetadata
          },
          durationMs: duration,
          sessionId: requestMetadata.sessionId,
          userId: requestMetadata.userId
        });
      });

      next();
    };
  }

  /**
   * Log a telemetry event
   */
  /**
   * Validates and converts session ID to proper format for database
   * Returns null for non-integer session IDs (like test sessions)
   */
  validateSessionId(sessionId) {
    if (!sessionId) return null;
    
    // Convert to integer if it's a numeric string
    const numericSessionId = parseInt(sessionId, 10);
    
    // Return the integer if it's valid, otherwise null (for test sessions)
    return (Number.isInteger(numericSessionId) && numericSessionId > 0) ? numericSessionId : null;
  }

  /**
   * Enhanced session ID extraction with multiple fallback strategies
   */
  extractSessionId(req) {
    // Strategy 1: From request body (most common for API calls)
    if (req.body?.sessionId) {
      return this.validateSessionId(req.body.sessionId);
    }
    
    // Strategy 2: From query parameters
    if (req.query?.sessionId) {
      return this.validateSessionId(req.query.sessionId);
    }
    
    // Strategy 3: From URL parameters (for REST API routes like /api/pages/:sessionId)
    if (req.params?.sessionId) {
      return this.validateSessionId(req.params.sessionId);
    }
    
    // Strategy 4: From Authorization header or custom headers
    const sessionHeader = req.get('X-Session-ID');
    if (sessionHeader) {
      return this.validateSessionId(sessionHeader);
    }
    
    // Strategy 5: From cookies (if session is stored in cookies)
    if (req.cookies?.sessionId) {
      return this.validateSessionId(req.cookies.sessionId);
    }
    
    // Strategy 6: Extract from JWT token payload if available
    if (req.user?.sessionId) {
      return this.validateSessionId(req.user.sessionId);
    }
    
    // Strategy 7: For internal system operations, allow null but log for debugging
    if (this.isSystemOperation(req)) {
      return null; // System operations don't need session context
    }
    
    return null;
  }

  /**
   * Enhanced user ID extraction with multiple fallback strategies
   */
  extractUserId(req) {
    // Strategy 1: From authenticated user (JWT middleware)
    if (req.user?.id) {
      return req.user.id;
    }
    
    // Strategy 2: From request body
    if (req.body?.userId) {
      return req.body.userId;
    }
    
    // Strategy 3: From query parameters
    if (req.query?.userId) {
      return req.query.userId;
    }
    
    // Strategy 4: From URL parameters
    if (req.params?.userId) {
      return req.params.userId;
    }
    
    return null;
  }

  /**
   * Determine if this is a system-level operation that doesn't require session context
   */
  isSystemOperation(req) {
    const systemPaths = [
      '/health',
      '/api/health',
      '/favicon.ico',
      '/_next/',
      '/static/',
      '/public/'
    ];
    
    return systemPaths.some(path => req.path.startsWith(path)) ||
           req.method === 'OPTIONS' ||
           req.path === '/' ||
           req.path === '';
  }

  /**
   * CRITICAL FIX: Filter events with database validation to prevent foreign key violations
   */
  async filterValidEvents(events) {
    const dbConnection = require('../database/database');
    
    // Get unique session IDs to check
    const sessionIds = [...new Set(events.map(e => e.sessionId).filter(id => id && id > 0))];
    
    // Check which sessions exist in database
    let existingSessions = [];
    if (sessionIds.length > 0) {
      try {
        const placeholders = sessionIds.map((_, i) => `$${i + 1}`).join(',');
        const query = `SELECT id FROM sessions WHERE id IN (${placeholders})`;
        const result = await dbConnection.query(query, sessionIds);
        existingSessions = result.rows.map(row => row.id);
        
        if (sessionIds.length > existingSessions.length) {
          const missingSessions = sessionIds.filter(id => !existingSessions.includes(id));
          console.log(`📊 Found ${missingSessions.length} invalid session IDs: [${missingSessions.join(', ')}]`);
        }
      } catch (error) {
        console.warn('📊 Could not validate sessions, filtering conservatively:', error.message);
        // If validation fails, filter out all events with session IDs to be safe
        return events.filter(event => !event.sessionId);
      }
    }

    // Filter events based on validation
    return events.filter(event => {
      // Skip events with test user_id that doesn't exist in database
      const userId = typeof event.userId === 'string' ? parseInt(event.userId) : event.userId;
      const isTestUserId = (
        userId === 12345 || userId === 98765 || // Common test IDs
        (userId >= 11111 && userId <= 99999 && userId % 1111 === 0) || // Pattern-based test IDs (11111, 22222, etc.)
        (userId >= 77777 && userId <= 77800) || // Dynamic test IDs from debug tests
        (userId >= 88888 && userId <= 88900)    // Dynamic test IDs from debug tests
      );
      
      if (isTestUserId) {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          console.log(`📊 Skipping telemetry for test user ID: ${userId}`);
          return false;
        }
      }
      
      // Skip events with null or invalid session_id (except system-level events)
      const systemEvents = ['system_health', 'server_start', 'server_stop', 'background_task', 'request_start', 'request_complete'];
      const isSystemEvent = systemEvents.includes(event.eventType);
      
      // ENHANCED: Only log warnings for non-system events that should have session context
      if (!isSystemEvent && (!event.sessionId || event.sessionId <= 0)) {
        // Only log warning if this isn't a health check or system operation
        const isSystemPath = event.eventData && typeof event.eventData === 'string' && 
                            JSON.parse(event.eventData)?.path && 
                            ['/health', '/api/health', '/favicon.ico', '/'].some(path => 
                              JSON.parse(event.eventData).path.startsWith(path));
        
        if (!isSystemPath) {
          console.log(`📊 Skipping telemetry for invalid session ID: ${event.sessionId} (event: ${event.eventType})`);
        }
        return false;
      }
      
      // CRITICAL FIX: Skip events with non-existent session_id (except system events)
      if (!isSystemEvent && !existingSessions.includes(event.sessionId)) {
        console.log(`📊 Skipping telemetry for deleted session ID: ${event.sessionId} (event: ${event.eventType})`);
        return false;
      }
      
      return true;
    });
  }

  async logEvent({
    eventType,
    eventCategory,
    eventData = {},
    durationMs = null,
    sessionId = null,
    userId = null,
    generationRequestId = null,
    cost = null,
    tokenCount = null,
    qualityScore = null
  }) {
    try {
      const event = {
        sessionId: this.validateSessionId(sessionId),
        userId,
        generationRequestId,
        eventType,
        eventCategory,
        eventData: JSON.stringify({
          instanceId: this.instanceId,
          timestamp: new Date().toISOString(),
          ...eventData
        }),
        durationMs,
        memoryUsageMb: this.getCurrentMemoryUsage(),
        cpuUsagePercent: await this.getCurrentCpuUsage(),
        costUsd: cost,
        tokenCount,
        qualityScore,
        createdAt: new Date()
      };

      // Add to buffer for batch processing
      this.metricsBuffer.push(event);

      // Special handling for agent execution events - also save to agent_executions table
      if (eventType === 'agent_execution_complete' && eventData.success) {
        await this.recordAgentExecution({
          generationRequestId,
          agentName: eventData.agentName,
          agentType: eventData.agentType,
          executionTime: durationMs,
          status: 'completed',
          qualityScore,
          tokenUsage: tokenCount,
          apiCost: cost,
          iterationNumber: eventData.attempt || 1,
          sessionId: this.validateSessionId(sessionId),
          userId
        });
      }

      // Flush if buffer is full
      if (this.metricsBuffer.length >= this.bufferSize) {
        await this.flushMetrics();
      }

    } catch (error) {
      console.error('❌ Failed to log telemetry event:', error);
    }
  }

  /**
   * Record agent execution in dedicated agent_executions table
   */
  async recordAgentExecution({
    generationRequestId,
    agentName,
    agentType,
    executionTime,
    status,
    qualityScore,
    tokenUsage,
    apiCost,
    iterationNumber,
    sessionId,
    userId
  }) {
    try {
      await dbConnection.query(`
        INSERT INTO agent_executions (
          request_id, agent_name, agent_type, execution_time, 
          status, quality_score, token_usage, api_cost, iteration_number,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      `, [
        generationRequestId, agentName, agentType, executionTime,
        status, qualityScore, tokenUsage, apiCost, iterationNumber
      ]);
      
      console.log(`📊 Agent execution recorded: ${agentName} (${executionTime}ms)`);
    } catch (error) {
      console.warn('❌ Failed to record agent execution:', error.message);
    }
  }

  /**
   * Track generation-specific metrics
   */
  async trackGenerationMetrics({
    requestId,
    sessionId,
    userId,
    prompt,
    strategy,
    qualityScore,
    processingTime,
    iterations,
    tokenCount,
    cost
  }) {
    await this.logEvent({
      eventType: 'generation_complete',
      eventCategory: 'usage',
      eventData: {
        requestId,
        strategy,
        promptLength: prompt?.length || 0,
        iterations,
        success: true
      },
      durationMs: processingTime,
      sessionId,
      userId,
      cost,
      tokenCount,
      qualityScore
    });
  }

  /**
   * Track agent execution metrics
   */
  async trackAgentExecution({
    requestId,
    agentName,
    agentType,
    executionTime,
    tokenUsage,
    cost,
    qualityScore,
    success,
    errorMessage = null,
    sessionId = null,  // CRITICAL FIX: Add sessionId parameter
    userId = null      // CRITICAL FIX: Add userId parameter
  }) {
    await this.logEvent({
      eventType: 'agent_execution',
      eventCategory: success ? 'performance' : 'error',
      eventData: {
        requestId,
        agentName,
        agentType,
        success,
        errorMessage
      },
      durationMs: executionTime,
      sessionId,  // CRITICAL FIX: Pass sessionId to logEvent
      userId,     // CRITICAL FIX: Pass userId to logEvent
      cost,
      tokenCount: tokenUsage,
      qualityScore
    });
  }

  /**
   * Track system health metrics
   */
  async trackSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    await this.logEvent({
      eventType: 'system_health',
      eventCategory: 'performance',
      eventData: {
        uptime,
        memoryUsage: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        },
        loadAverage: os.loadavg(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem()
      }
    });

    // Schedule next health check in 5 minutes
    setTimeout(() => this.trackSystemMetrics(), 5 * 60 * 1000);
  }

  /**
   * Flush metrics buffer to database
   */
  async flushMetrics() {
    if (this.metricsBuffer.length === 0) {
      return;
    }

    const events = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      // CRITICAL FIX: Enhanced filtering with database session validation
      const validEvents = await this.filterValidEvents(events);

      if (validEvents.length === 0) {
        console.log('📊 Skipped all telemetry events (invalid user references)');
        return;
      }

      // Batch insert all valid events
      const values = validEvents.map((event, index) => {
        const baseIndex = index * 12;
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11}, $${baseIndex + 12})`;
      }).join(', ');

      const params = validEvents.flatMap(event => [
        event.sessionId,
        event.userId,
        event.generationRequestId,
        event.eventType,
        event.eventCategory,
        event.eventData,
        event.durationMs,
        event.memoryUsageMb,
        event.cpuUsagePercent,
        event.costUsd,
        event.tokenCount,
        event.qualityScore
      ]);

      const query = `
        INSERT INTO telemetry_events 
        (session_id, user_id, request_id, event_type, event_category, event_data, 
         duration_ms, memory_usage_mb, cpu_usage_percent, cost_usd, token_count, quality_score)
        VALUES ${values}
      `;

      await dbConnection.query(query, params);
      
      console.log(`📊 Flushed ${validEvents.length} telemetry events to database`);

    } catch (error) {
      console.error('❌ Failed to flush telemetry metrics:', error);
      // Re-add events to buffer for retry
      this.metricsBuffer.unshift(...events);
    }
  }

  /**
   * Start background flush process
   */
  startBackgroundFlush() {
    setInterval(() => {
      this.flushMetrics().catch(error => {
        console.error('❌ Background telemetry flush failed:', error);
      });
    }, this.flushInterval);

    // Flush on process exit
    process.on('SIGINT', async () => {
      console.log('🔄 Flushing final telemetry data...');
      try {
        await this.flushMetrics();
        console.log('✅ Telemetry data flushed successfully');
      } catch (error) {
        console.error('❌ Failed to flush telemetry metrics:', error.message);
      }
      
      // Let the database handler close connections
      setTimeout(() => process.exit(0), 100);
    });
  }

  /**
   * Get current memory usage in MB
   */
  getCurrentMemoryUsage() {
    return parseFloat((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2));
  }

  /**
   * Get current CPU usage percentage (estimated)
   */
  async getCurrentCpuUsage() {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = Date.now();
      
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = Date.now();
        const elapTime = endTime - startTime;
        
        const elapUserMS = endUsage.user / 1000;
        const elapSystMS = endUsage.system / 1000;
        const cpuPercent = ((elapUserMS + elapSystMS) / elapTime) * 100;
        
        resolve(parseFloat(cpuPercent.toFixed(2)));
      }, 100);
    });
  }

  /**
   * Estimate token count from text
   */
  estimateTokenCount(prompt = '', component = '') {
    const totalText = `${prompt} ${component}`;
    return Math.ceil(totalText.length / 4); // Rough estimate: 4 chars per token
  }

  /**
   * Estimate cost based on token usage
   */
  estimateCost(prompt = '', component = '') {
    const tokenCount = this.estimateTokenCount(prompt, component);
    const costPerToken = 0.00000059; // Groq pricing
    return parseFloat((tokenCount * costPerToken).toFixed(8));
  }

  /**
   * COST OPTIMIZATION: Enhanced cost tracking for page generation
   */
  async logGenerationCost(data) {
    try {
      const {
        generationId,
        sessionId,
        agentsUsed = [],
        agentsSkipped = [],
        totalTokens = 0,
        actualCost = 0,
        estimatedSavings = 0,
        cacheHits = 0,
        duration = 0,
        complexity = 0,
        pageType = 'unknown',
        industry = 'general'
      } = data;

      await dbConnection.query(`
        INSERT INTO telemetry_events (
          event_type, event_category, session_id, 
          duration_ms, token_count, cost_usd,
          event_data, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        'cost_analysis',
        'generation',
        sessionId,
        duration,
        totalTokens,
        actualCost,
        {
          generationId,
          agentsUsed,
          agentsSkipped,
          estimatedSavings,
          cacheHits,
          complexity,
          pageType,
          industry,
          costPerToken: 0.00000059,
          optimizationVersion: '1.0'
        }
      ]);

      console.log(`💰 [COST TRACKED] Generation ${generationId}: $${actualCost.toFixed(6)} (saved $${estimatedSavings.toFixed(6)})`);
      
    } catch (error) {
      console.error('❌ Failed to log generation cost:', error);
    }
  }

  /**
   * Get cost analytics for dashboard
   */
  async getCostAnalytics(timeframe = '24 hours') {
    try {
      const timeClause = timeframe === '24 hours' ? "created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'" :
                        timeframe === '7 days' ? "created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'" :
                        timeframe === '30 days' ? "created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'" :
                        "created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'";

      const [costStats, savingsStats, agentUsageStats] = await Promise.all([
        // Total cost statistics
        dbConnection.query(`
          SELECT 
            COUNT(*) as total_generations,
            SUM(cost_usd) as total_cost,
            AVG(cost_usd) as avg_cost_per_generation,
            AVG(token_count) as avg_tokens_per_generation,
            AVG(duration_ms) as avg_duration_ms
          FROM telemetry_events 
          WHERE event_type = 'cost_analysis' AND ${timeClause}
        `),

        // Savings statistics
        dbConnection.query(`
          SELECT 
            SUM(CAST(event_data->>'estimatedSavings' AS DECIMAL)) as total_savings,
            AVG(CAST(event_data->>'cacheHits' AS INTEGER)) as avg_cache_hits,
            COUNT(CASE WHEN JSONB_ARRAY_LENGTH(event_data->'agentsSkipped') > 0 THEN 1 END) as generations_with_skipped_agents
          FROM telemetry_events 
          WHERE event_type = 'cost_analysis' AND ${timeClause}
        `),

        // Agent usage statistics
        dbConnection.query(`
          SELECT 
            event_data->>'pageType' as page_type,
            COUNT(*) as usage_count,
            AVG(cost_usd) as avg_cost,
            AVG(CAST(event_data->>'complexity' AS INTEGER)) as avg_complexity
          FROM telemetry_events 
          WHERE event_type = 'cost_analysis' AND ${timeClause}
          GROUP BY event_data->>'pageType'
          ORDER BY usage_count DESC
        `)
      ]);

      return {
        timeframe,
        totalCost: costStats.rows[0]?.total_cost || 0,
        totalGenerations: costStats.rows[0]?.total_generations || 0,
        avgCostPerGeneration: costStats.rows[0]?.avg_cost_per_generation || 0,
        avgTokensPerGeneration: costStats.rows[0]?.avg_tokens_per_generation || 0,
        avgDurationMs: costStats.rows[0]?.avg_duration_ms || 0,
        totalSavings: savingsStats.rows[0]?.total_savings || 0,
        avgCacheHits: savingsStats.rows[0]?.avg_cache_hits || 0,
        optimizedGenerations: savingsStats.rows[0]?.generations_with_skipped_agents || 0,
        pageTypeBreakdown: agentUsageStats.rows,
        estimatedMonthlyCost: (costStats.rows[0]?.total_cost || 0) * (30 * 24 / (timeframe === '24 hours' ? 24 : timeframe === '7 days' ? 24 * 7 : 24 * 30)),
        estimatedMonthlySavings: (savingsStats.rows[0]?.total_savings || 0) * (30 * 24 / (timeframe === '24 hours' ? 24 : timeframe === '7 days' ? 24 * 7 : 24 * 30))
      };

    } catch (error) {
      console.error('❌ Failed to get cost analytics:', error);
      throw error;
    }
  }

  /**
   * Get telemetry analytics for dashboard
   */
  async getAnalytics(timeframe = '24 hours') {
    try {
      const timeClause = timeframe === '24 hours' ? "created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'" :
                        timeframe === '7 days' ? "created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'" :
                        timeframe === '30 days' ? "created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'" :
                        "created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'";

      const [requestStats, generationStats, errorStats, costStats] = await Promise.all([
        // Request statistics
        dbConnection.query(`
          SELECT 
            event_category,
            COUNT(*) as count,
            AVG(duration_ms) as avg_duration,
            MAX(duration_ms) as max_duration
          FROM telemetry_events 
          WHERE event_type = 'request_complete' AND ${timeClause}
          GROUP BY event_category
        `),

        // Generation statistics  
        dbConnection.query(`
          SELECT 
            AVG(quality_score) as avg_quality,
            AVG(duration_ms) as avg_processing_time,
            AVG(token_count) as avg_tokens,
            SUM(cost_usd) as total_cost,
            COUNT(*) as total_generations
          FROM telemetry_events 
          WHERE event_type = 'generation_complete' AND ${timeClause}
        `),

        // Error statistics
        dbConnection.query(`
          SELECT 
            COUNT(*) as error_count,
            COUNT(DISTINCT session_id) as affected_sessions
          FROM telemetry_events 
          WHERE event_category = 'error' AND ${timeClause}
        `),

        // Cost breakdown by strategy
        dbConnection.query(`
          SELECT 
            event_data->>'strategy' as strategy,
            COUNT(*) as usage_count,
            SUM(cost_usd) as total_cost,
            AVG(quality_score) as avg_quality
          FROM telemetry_events 
          WHERE event_type = 'generation_complete' AND ${timeClause}
          GROUP BY event_data->>'strategy'
        `)
      ]);

      return {
        timeframe,
        requests: requestStats.rows,
        generations: generationStats.rows[0] || {},
        errors: errorStats.rows[0] || {},
        costBreakdown: costStats.rows,
        systemHealth: {
          uptime: process.uptime(),
          memoryUsage: this.getCurrentMemoryUsage(),
          instanceId: this.instanceId
        }
      };

    } catch (error) {
      console.error('❌ Failed to get telemetry analytics:', error);
      throw error;
    }
  }

  /**
   * Clean old telemetry data
   */
  async cleanOldData(daysToKeep = 30) {
    try {
      const result = await dbConnection.query(
        'DELETE FROM telemetry_events WHERE created_at < CURRENT_TIMESTAMP - INTERVAL \'$1 days\'',
        [daysToKeep]
      );

      console.log(`🧹 Cleaned ${result.rowCount} old telemetry records`);
      return result.rowCount;
    } catch (error) {
      console.error('❌ Failed to clean old telemetry data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const telemetryService = new TelemetryService();

/**
 * Error handling middleware with telemetry
 */
const errorTelemetry = () => {
  return async (error, req, res, next) => {
    // Log error event
    await telemetryService.logEvent({
      eventType: 'application_error',
      eventCategory: 'error',
      eventData: {
        requestId: req.requestId,
        error: error.message,
        stack: error.stack?.substring(0, 1000),
        path: req.path,
        method: req.method
      },
      sessionId: req.body?.sessionId || req.query?.sessionId,
      userId: req.user?.id
    });

    // Continue with error handling
    next(error);
  };
};

/**
 * Performance monitoring middleware
 */
const performanceMonitoring = () => {
  return async (req, res, next) => {
    // Track slow requests
    const slowRequestThreshold = 5000; // 5 seconds
    
    const timer = setTimeout(async () => {
      await telemetryService.logEvent({
        eventType: 'slow_request',
        eventCategory: 'performance',
        eventData: {
          requestId: req.requestId,
          path: req.path,
          method: req.method,
          threshold: slowRequestThreshold
        },
        sessionId: req.body?.sessionId || req.query?.sessionId,
        userId: req.user?.id
      });
    }, slowRequestThreshold);

    // Clear timer when response is sent
    res.on('finish', () => {
      clearTimeout(timer);
    });

    next();
  };
};

module.exports = {
  TelemetryService,
  telemetryService,
  requestTelemetry: () => telemetryService.requestTelemetry(),
  errorTelemetry,
  performanceMonitoring,
  trackGenerationMetrics: (...args) => telemetryService.trackGenerationMetrics(...args),
  trackAgentExecution: (...args) => telemetryService.trackAgentExecution(...args),
  getAnalytics: (...args) => telemetryService.getAnalytics(...args)
};