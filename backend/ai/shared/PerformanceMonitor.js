/**
 * @file backend/ai/shared/PerformanceMonitor.js
 * @description Advanced Performance Monitor for Multi-Agent System Optimization
 * @version 1.0 - Phase 4 Implementation from MULTIAGENT_SYSTEM_IMPROVEMENT_PLAN.md
 * 
 * Features:
 * - Real-time performance tracking and bottleneck identification
 * - Agent execution optimization recommendations
 * - Memory usage and leak detection
 * - API call efficiency monitoring
 * - Content utilization performance analysis
 * - System resource utilization tracking
 */

/**
 * PerformanceMonitor - Advanced performance tracking and optimization system
 * Works in conjunction with DebugLogger to provide comprehensive performance insights
 */
class PerformanceMonitor {
  constructor() {
    this.version = '1.0';
    this.monitorType = 'PerformanceMonitor';
    this.metrics = new Map();
    this.benchmarks = new Map();
    this.alerts = [];
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.performanceHistory = [];
    
    // Performance thresholds
    this.thresholds = {
      agentExecutionTime: 30000, // 30 seconds
      memoryUsage: 512, // 512 MB
      apiCallRate: 10, // per session
      contentUtilization: 80, // 80% minimum
      uiuxCompliance: 85, // 85% minimum
      responseTime: 5000 // 5 seconds
    };
    
    this.initializeMonitor();
  }

  /**
   * Initialize performance monitor
   */
  initializeMonitor() {
    console.log('📊 [PerformanceMonitor] Initialized with real-time monitoring capabilities');
    this.startMonitoring();
  }

  /**
   * Start real-time performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 5000); // Collect metrics every 5 seconds
    
    console.log('🔍 [PerformanceMonitor] Real-time monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('⏹️ [PerformanceMonitor] Monitoring stopped');
  }

  /**
   * Start tracking a performance operation
   */
  startTracking(operationName, context = {}) {
    const startTime = process.hrtime.bigint();
    const memoryBefore = process.memoryUsage();
    
    const tracking = {
      name: operationName,
      startTime,
      endTime: null,
      duration: null,
      memoryBefore,
      memoryAfter: null,
      memoryDelta: null,
      context: { ...context },
      markers: [],
      alerts: []
    };
    
    this.metrics.set(`${operationName}_${Date.now()}`, tracking);
    
    return {
      operationId: `${operationName}_${Date.now()}`,
      addMarker: (markerName) => this.addMarker(`${operationName}_${Date.now()}`, markerName),
      end: () => this.endTracking(`${operationName}_${Date.now()}`)
    };
  }

  /**
   * Add a performance marker during operation
   */
  addMarker(operationId, markerName, data = {}) {
    const tracking = this.metrics.get(operationId);
    if (!tracking) return;
    
    const markerTime = process.hrtime.bigint();
    const elapsedFromStart = Number(markerTime - tracking.startTime) / 1000000; // Convert to ms
    
    tracking.markers.push({
      name: markerName,
      timestamp: markerTime,
      elapsedFromStart,
      data
    });
  }

  /**
   * End tracking a performance operation
   */
  endTracking(operationId) {
    const tracking = this.metrics.get(operationId);
    if (!tracking) return null;
    
    const endTime = process.hrtime.bigint();
    const memoryAfter = process.memoryUsage();
    
    tracking.endTime = endTime;
    tracking.duration = Number(endTime - tracking.startTime) / 1000000; // Convert to ms
    tracking.memoryAfter = memoryAfter;
    tracking.memoryDelta = {
      rss: memoryAfter.rss - tracking.memoryBefore.rss,
      heapUsed: memoryAfter.heapUsed - tracking.memoryBefore.heapUsed,
      heapTotal: memoryAfter.heapTotal - tracking.memoryBefore.heapTotal,
      external: memoryAfter.external - tracking.memoryBefore.external
    };
    
    // Check for performance alerts
    this.checkPerformanceAlerts(tracking);
    
    // Store in performance history
    this.addToHistory(tracking);
    
    return this.generatePerformanceReport(tracking);
  }

  /**
   * Track agent execution performance
   */
  trackAgentExecution(agentName, executionFn, context = {}) {
    return new Promise(async (resolve, reject) => {
      const tracker = this.startTracking(`agent_${agentName}`, {
        agentName,
        ...context
      });
      
      try {
        tracker.addMarker('execution_start');
        
        const result = await executionFn();
        
        tracker.addMarker('execution_complete', {
          success: result?.success || false,
          resultType: this.determineResultType(result)
        });
        
        const performanceReport = tracker.end();
        
        // Analyze agent performance
        const analysis = this.analyzeAgentPerformance(agentName, performanceReport);
        
        resolve({
          result,
          performance: performanceReport,
          analysis
        });
        
      } catch (error) {
        tracker.addMarker('execution_error', { error: error.message });
        const performanceReport = tracker.end();
        
        reject({
          error,
          performance: performanceReport
        });
      }
    });
  }

  /**
   * Monitor content utilization performance
   */
  monitorContentUtilization(utilizationData) {
    const metric = {
      timestamp: Date.now(),
      utilizationRate: utilizationData.utilizationRate || 0,
      totalElements: utilizationData.totalElements || 0,
      usedElements: utilizationData.usedElements || 0,
      missingElements: utilizationData.missingElements || [],
      performance: {
        belowThreshold: utilizationData.utilizationRate < this.thresholds.contentUtilization,
        improvement: utilizationData.improvement || 0
      }
    };
    
    // Track content utilization trends
    const utilizationMetrics = this.metrics.get('content_utilization') || [];
    utilizationMetrics.push(metric);
    this.metrics.set('content_utilization', utilizationMetrics);
    
    // Generate alert if below threshold
    if (metric.performance.belowThreshold) {
      this.generateAlert('content_utilization', 'low', 
        `Content utilization ${metric.utilizationRate}% below threshold ${this.thresholds.contentUtilization}%`);
    }
    
    return metric;
  }

  /**
   * Monitor UI/UX compliance performance
   */
  monitorUIUXCompliance(complianceData) {
    const metric = {
      timestamp: Date.now(),
      overallScore: complianceData.overallScore || 0,
      compliance: complianceData.compliance || 'UNKNOWN',
      passedRules: complianceData.passedRules || 0,
      totalRules: complianceData.totalRules || 0,
      mandatoryFailures: complianceData.mandatoryFailures || 0,
      performance: {
        belowThreshold: complianceData.overallScore < this.thresholds.uiuxCompliance,
        complianceRate: complianceData.passedRules / (complianceData.totalRules || 1) * 100
      }
    };
    
    // Track UI/UX compliance trends
    const complianceMetrics = this.metrics.get('uiux_compliance') || [];
    complianceMetrics.push(metric);
    this.metrics.set('uiux_compliance', complianceMetrics);
    
    // Generate alert if below threshold
    if (metric.performance.belowThreshold) {
      this.generateAlert('uiux_compliance', 'medium',
        `UI/UX compliance ${metric.overallScore}% below threshold ${this.thresholds.uiuxCompliance}%`);
    }
    
    return metric;
  }

  /**
   * Track API call performance and efficiency
   */
  trackAPICall(apiCall, duration, tokens = 0, success = true) {
    const metric = {
      timestamp: Date.now(),
      apiCall,
      duration,
      tokens,
      success,
      tokensPerSecond: duration > 0 ? (tokens / (duration / 1000)) : 0,
      performance: {
        slow: duration > this.thresholds.responseTime,
        efficient: tokens > 0 && (duration / tokens) < 100 // ms per token
      }
    };
    
    // Track API performance
    const apiMetrics = this.metrics.get('api_calls') || [];
    apiMetrics.push(metric);
    this.metrics.set('api_calls', apiMetrics);
    
    // Generate alert for slow API calls
    if (metric.performance.slow) {
      this.generateAlert('api_performance', 'medium',
        `Slow API call: ${apiCall} took ${duration}ms`);
    }
    
    return metric;
  }

  /**
   * Collect system-level performance metrics
   */
  collectSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const systemMetric = {
      timestamp: Date.now(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024) // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime()
    };
    
    // Track system metrics
    const systemMetrics = this.metrics.get('system_metrics') || [];
    systemMetrics.push(systemMetric);
    
    // Keep only last 100 entries
    if (systemMetrics.length > 100) {
      systemMetrics.splice(0, systemMetrics.length - 100);
    }
    
    this.metrics.set('system_metrics', systemMetrics);
    
    // Check for system alerts
    if (systemMetric.memory.heapUsed > this.thresholds.memoryUsage) {
      this.generateAlert('memory_usage', 'high',
        `High memory usage: ${systemMetric.memory.heapUsed}MB`);
    }
    
    return systemMetric;
  }

  /**
   * Analyze agent performance and generate recommendations
   */
  analyzeAgentPerformance(agentName, performanceReport) {
    const analysis = {
      agent: agentName,
      overall: 'good',
      issues: [],
      recommendations: [],
      benchmarkComparison: null
    };
    
    // Check execution time
    if (performanceReport.duration > this.thresholds.agentExecutionTime) {
      analysis.overall = 'poor';
      analysis.issues.push({
        type: 'slow_execution',
        severity: 'high',
        value: performanceReport.duration,
        threshold: this.thresholds.agentExecutionTime
      });
      analysis.recommendations.push('Consider optimizing agent logic or reducing AI model complexity');
    } else if (performanceReport.duration > this.thresholds.agentExecutionTime * 0.7) {
      analysis.overall = 'moderate';
      analysis.issues.push({
        type: 'moderate_execution',
        severity: 'medium',
        value: performanceReport.duration,
        threshold: this.thresholds.agentExecutionTime * 0.7
      });
      analysis.recommendations.push('Monitor agent performance and consider optimization');
    }
    
    // Check memory usage
    const memoryIncrease = performanceReport.memoryDelta.heapUsed / 1024 / 1024; // MB
    if (memoryIncrease > 50) {
      analysis.issues.push({
        type: 'high_memory_usage',
        severity: 'medium',
        value: memoryIncrease
      });
      analysis.recommendations.push('Check for memory leaks or optimize data structures');
    }
    
    // Compare with benchmark if available
    const benchmark = this.getBenchmark(agentName);
    if (benchmark) {
      analysis.benchmarkComparison = {
        durationRatio: performanceReport.duration / benchmark.averageDuration,
        memoryRatio: memoryIncrease / benchmark.averageMemoryIncrease,
        performance: this.calculatePerformanceScore(performanceReport, benchmark)
      };
    }
    
    // Update benchmark data
    this.updateBenchmark(agentName, performanceReport);
    
    return analysis;
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(tracking) {
    return {
      operation: tracking.name,
      duration: tracking.duration,
      memoryDelta: tracking.memoryDelta,
      markers: tracking.markers,
      alerts: tracking.alerts,
      efficiency: this.calculateEfficiency(tracking),
      bottlenecks: this.identifyBottlenecks(tracking)
    };
  }

  /**
   * Calculate operation efficiency score
   */
  calculateEfficiency(tracking) {
    let score = 100;
    
    // Penalize for long duration
    if (tracking.duration > 10000) score -= 20;
    else if (tracking.duration > 5000) score -= 10;
    
    // Penalize for high memory usage
    const memoryIncreaseMB = tracking.memoryDelta.heapUsed / 1024 / 1024;
    if (memoryIncreaseMB > 50) score -= 15;
    else if (memoryIncreaseMB > 25) score -= 8;
    
    // Bonus for fast execution
    if (tracking.duration < 2000) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identify performance bottlenecks
   */
  identifyBottlenecks(tracking) {
    const bottlenecks = [];
    
    // Analyze markers for time gaps
    for (let i = 1; i < tracking.markers.length; i++) {
      const timeBetweenMarkers = tracking.markers[i].elapsedFromStart - tracking.markers[i-1].elapsedFromStart;
      
      if (timeBetweenMarkers > 3000) { // 3 second gap
        bottlenecks.push({
          type: 'time_gap',
          between: [tracking.markers[i-1].name, tracking.markers[i].name],
          duration: timeBetweenMarkers,
          severity: timeBetweenMarkers > 10000 ? 'high' : 'medium'
        });
      }
    }
    
    return bottlenecks;
  }

  /**
   * Generate performance alert
   */
  generateAlert(category, severity, message, data = {}) {
    const alert = {
      timestamp: Date.now(),
      category,
      severity, // 'low', 'medium', 'high'
      message,
      data,
      acknowledged: false
    };
    
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.splice(0, this.alerts.length - 100);
    }
    
    console.log(`🚨 [PerformanceMonitor] ${severity.toUpperCase()} ALERT: ${message}`);
    
    return alert;
  }

  /**
   * Get performance insights and trends
   */
  getPerformanceInsights() {
    const insights = {
      timestamp: Date.now(),
      summary: this.generateSummaryStatistics(),
      trends: this.analyzeTrends(),
      alerts: this.getActiveAlerts(),
      recommendations: this.generateSystemRecommendations()
    };
    
    return insights;
  }

  /**
   * Generate summary statistics
   */
  generateSummaryStatistics() {
    const stats = {
      totalOperations: this.performanceHistory.length,
      averageOperationTime: 0,
      totalMemoryUsage: 0,
      operationsPerMinute: 0,
      successRate: 0
    };
    
    if (this.performanceHistory.length > 0) {
      const recentHistory = this.performanceHistory.slice(-100); // Last 100 operations
      
      stats.averageOperationTime = recentHistory.reduce((sum, op) => sum + op.duration, 0) / recentHistory.length;
      stats.totalMemoryUsage = recentHistory.reduce((sum, op) => sum + (op.memoryDelta.heapUsed / 1024 / 1024), 0);
      
      const timeSpan = Math.max(1, (Date.now() - recentHistory[0].timestamp) / (1000 * 60)); // Minutes
      stats.operationsPerMinute = recentHistory.length / timeSpan;
    }
    
    return stats;
  }

  /**
   * Analyze performance trends
   */
  analyzeTrends() {
    const trends = {
      performance: 'stable',
      memoryUsage: 'stable',
      apiEfficiency: 'stable',
      contentUtilization: 'stable',
      uiuxCompliance: 'stable'
    };
    
    // Analyze content utilization trend
    const contentMetrics = this.metrics.get('content_utilization') || [];
    if (contentMetrics.length >= 3) {
      const recent = contentMetrics.slice(-3);
      const isImproving = recent.every((metric, i) => 
        i === 0 || metric.utilizationRate >= recent[i-1].utilizationRate
      );
      trends.contentUtilization = isImproving ? 'improving' : 'declining';
    }
    
    // Analyze UI/UX compliance trend
    const complianceMetrics = this.metrics.get('uiux_compliance') || [];
    if (complianceMetrics.length >= 3) {
      const recent = complianceMetrics.slice(-3);
      const isImproving = recent.every((metric, i) => 
        i === 0 || metric.overallScore >= recent[i-1].overallScore
      );
      trends.uiuxCompliance = isImproving ? 'improving' : 'declining';
    }
    
    return trends;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return this.alerts
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
  }

  /**
   * Generate system-wide optimization recommendations
   */
  generateSystemRecommendations() {
    const recommendations = [];
    
    // Check recent performance history
    const recentOps = this.performanceHistory.slice(-20);
    if (recentOps.length > 0) {
      const avgDuration = recentOps.reduce((sum, op) => sum + op.duration, 0) / recentOps.length;
      
      if (avgDuration > 15000) {
        recommendations.push({
          type: 'performance',
          priority: 'high',
          recommendation: 'System performance is degraded. Consider optimizing agent execution or reviewing AI model parameters.',
          metrics: { averageDuration: avgDuration }
        });
      }
    }
    
    // Check memory trends
    const systemMetrics = this.metrics.get('system_metrics') || [];
    if (systemMetrics.length > 0) {
      const latestMemory = systemMetrics[systemMetrics.length - 1].memory.heapUsed;
      
      if (latestMemory > this.thresholds.memoryUsage) {
        recommendations.push({
          type: 'memory',
          priority: 'medium',
          recommendation: 'Memory usage is high. Consider implementing garbage collection optimization or reviewing data structures.',
          metrics: { currentMemory: latestMemory, threshold: this.thresholds.memoryUsage }
        });
      }
    }
    
    // Check content utilization performance
    const contentMetrics = this.metrics.get('content_utilization') || [];
    if (contentMetrics.length > 0) {
      const avgUtilization = contentMetrics.reduce((sum, m) => sum + m.utilizationRate, 0) / contentMetrics.length;
      
      if (avgUtilization < this.thresholds.contentUtilization) {
        recommendations.push({
          type: 'content',
          priority: 'high',
          recommendation: 'Content utilization is consistently below threshold. Review ContentCodeBridge implementation and CodeAgent integration.',
          metrics: { averageUtilization: avgUtilization, threshold: this.thresholds.contentUtilization }
        });
      }
    }
    
    return recommendations;
  }

  // Helper methods

  /**
   * Add operation to performance history
   */
  addToHistory(tracking) {
    this.performanceHistory.push({
      timestamp: Date.now(),
      name: tracking.name,
      duration: tracking.duration,
      memoryDelta: tracking.memoryDelta,
      success: !tracking.alerts.some(alert => alert.severity === 'high')
    });
    
    // Keep only last 1000 operations
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory.splice(0, this.performanceHistory.length - 1000);
    }
  }

  /**
   * Get benchmark data for agent
   */
  getBenchmark(agentName) {
    return this.benchmarks.get(agentName);
  }

  /**
   * Update benchmark data for agent
   */
  updateBenchmark(agentName, performanceReport) {
    const existing = this.benchmarks.get(agentName) || {
      samples: [],
      averageDuration: 0,
      averageMemoryIncrease: 0
    };
    
    existing.samples.push({
      duration: performanceReport.duration,
      memoryIncrease: performanceReport.memoryDelta.heapUsed / 1024 / 1024
    });
    
    // Keep only last 50 samples
    if (existing.samples.length > 50) {
      existing.samples.splice(0, existing.samples.length - 50);
    }
    
    // Recalculate averages
    existing.averageDuration = existing.samples.reduce((sum, s) => sum + s.duration, 0) / existing.samples.length;
    existing.averageMemoryIncrease = existing.samples.reduce((sum, s) => sum + s.memoryIncrease, 0) / existing.samples.length;
    
    this.benchmarks.set(agentName, existing);
  }

  /**
   * Calculate performance score compared to benchmark
   */
  calculatePerformanceScore(report, benchmark) {
    let score = 100;
    
    // Duration comparison (50% weight)
    const durationRatio = report.duration / benchmark.averageDuration;
    if (durationRatio > 1.5) score -= 25;
    else if (durationRatio > 1.2) score -= 15;
    else if (durationRatio < 0.8) score += 10;
    
    // Memory comparison (30% weight)
    const memoryIncrease = report.memoryDelta.heapUsed / 1024 / 1024;
    const memoryRatio = memoryIncrease / benchmark.averageMemoryIncrease;
    if (memoryRatio > 1.5) score -= 15;
    else if (memoryRatio > 1.2) score -= 10;
    else if (memoryRatio < 0.8) score += 5;
    
    // Alert penalty (20% weight)
    const highSeverityAlerts = report.alerts.filter(a => a.severity === 'high').length;
    score -= highSeverityAlerts * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determine result type from operation result
   */
  determineResultType(result) {
    if (!result) return 'none';
    if (result.code) return 'code';
    if (result.validation) return 'validation';
    if (result.design) return 'design';
    if (result.content) return 'content';
    return 'generic';
  }

  /**
   * Check for performance alerts during operation
   */
  checkPerformanceAlerts(tracking) {
    // Check for slow execution
    if (tracking.duration > this.thresholds.agentExecutionTime) {
      tracking.alerts.push({
        type: 'slow_execution',
        severity: 'high',
        message: `Operation took ${Math.round(tracking.duration/1000)}s (threshold: ${this.thresholds.agentExecutionTime/1000}s)`
      });
    }
    
    // Check for high memory usage
    const memoryIncreaseMB = tracking.memoryDelta.heapUsed / 1024 / 1024;
    if (memoryIncreaseMB > 100) {
      tracking.alerts.push({
        type: 'high_memory_usage',
        severity: 'medium',
        message: `Operation increased memory by ${Math.round(memoryIncreaseMB)}MB`
      });
    }
  }
}

module.exports = { PerformanceMonitor };