/**
 * @file backend/ai/shared/debugUtils.js
 * @description Utility functions for debugging AI generation system
 */

const fs = require('fs');
const path = require('path');

class DebugUtils {
    constructor() {
        this.debugDir = path.join(__dirname, '../../debug');
    }

    /**
     * Get all available debug sessions
     */
    listDebugSessions() {
        if (!fs.existsSync(this.debugDir)) {
            return [];
        }

        const files = fs.readdirSync(this.debugDir);
        return files
            .filter(file => file.startsWith('debug_') && file.endsWith('.json'))
            .map(file => {
                const stats = fs.statSync(path.join(this.debugDir, file));
                return {
                    correlationId: file.replace('debug_', '').replace('.json', ''),
                    fileName: file,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    size: stats.size
                };
            })
            .sort((a, b) => b.modified - a.modified);
    }

    /**
     * Load debug session by correlation ID
     */
    loadDebugSession(correlationId) {
        const filename = `debug_${correlationId}.json`;
        const filepath = path.join(this.debugDir, filename);
        
        if (!fs.existsSync(filepath)) {
            return null;
        }

        try {
            const content = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error('Error loading debug session:', error);
            return null;
        }
    }

    /**
     * Get agent execution timeline for a session
     */
    getAgentTimeline(correlationId) {
        const logs = this.loadDebugSession(correlationId);
        if (!logs) return null;

        const timeline = logs
            .filter(log => log.phase === 'INPUT' || log.phase === 'OUTPUT')
            .map(log => ({
                timestamp: log.timestamp,
                agent: log.agent,
                phase: log.phase,
                executionTime: log.executionTime || null,
                inputSize: log.inputSize || null,
                outputSize: log.outputSize || null,
                tokenUsage: log.tokenUsage || null
            }));

        return timeline;
    }

    /**
     * Get validation history for a session
     */
    getValidationHistory(correlationId) {
        const logs = this.loadDebugSession(correlationId);
        if (!logs) return null;

        return logs.filter(log => log.phase === 'VALIDATION_RESULT');
    }

    /**
     * Get context evolution for a session
     */
    getContextEvolution(correlationId) {
        const logs = this.loadDebugSession(correlationId);
        if (!logs) return null;

        return logs
            .filter(log => log.agent === 'CONTEXT_TRACKER')
            .map(log => ({
                phase: log.phase,
                timestamp: log.timestamp,
                contextSize: log.contextSize,
                contextKeys: log.contextKeys,
                hasPageSpec: log.hasPageSpec,
                hasDesign: log.hasDesign,
                hasContent: log.hasContent,
                hasLayout: log.hasLayout,
                hasCode: log.hasCode,
                hasValidation: log.hasValidation
            }));
    }

    /**
     * Get memory usage tracking for a session
     */
    getMemoryTracking(correlationId) {
        const logs = this.loadDebugSession(correlationId);
        if (!logs) return null;

        return logs
            .filter(log => log.agent === 'MEMORY_MONITOR')
            .map(log => ({
                timestamp: log.timestamp,
                heapUsed: log.heapUsed,
                heapTotal: log.heapTotal,
                external: log.external,
                rss: log.rss
            }));
    }

    /**
     * Generate performance report for a session
     */
    generatePerformanceReport(correlationId) {
        const logs = this.loadDebugSession(correlationId);
        if (!logs) return null;

        const agentExecutions = logs.filter(log => log.phase === 'OUTPUT' && log.executionTime);
        const memoryLogs = logs.filter(log => log.agent === 'MEMORY_MONITOR');
        const validationLogs = logs.filter(log => log.phase === 'VALIDATION_RESULT');

        const report = {
            correlationId,
            summary: {
                totalAgents: new Set(agentExecutions.map(l => l.agent)).size,
                totalExecutionTime: agentExecutions.reduce((sum, l) => sum + l.executionTime, 0),
                totalTokens: agentExecutions.reduce((sum, l) => sum + (l.tokenUsage || 0), 0),
                validationAttempts: validationLogs.length,
                peakMemory: Math.max(...memoryLogs.map(l => l.heapUsed))
            },
            agentPerformance: agentExecutions.map(log => ({
                agent: log.agent,
                executionTime: log.executionTime,
                tokenUsage: log.tokenUsage,
                inputSize: log.inputSize,
                outputSize: log.outputSize,
                efficiency: log.tokenUsage ? Math.round(log.tokenUsage / (log.executionTime / 1000)) : null
            })),
            memoryProfile: memoryLogs.map(log => ({
                timestamp: log.timestamp,
                heapUsed: log.heapUsed,
                growth: log.heapUsed - (memoryLogs[0]?.heapUsed || 0)
            })),
            validationScores: validationLogs.map(log => ({
                timestamp: log.timestamp,
                overallScore: log.overallScore,
                passed: log.passed,
                criticalIssues: log.criticalIssues,
                contentUtilization: log.contentUtilization
            }))
        };

        return report;
    }

    /**
     * Export session data to JSON file
     */
    exportSession(correlationId, outputPath = null) {
        const logs = this.loadDebugSession(correlationId);
        if (!logs) return false;

        const report = this.generatePerformanceReport(correlationId);
        const exportData = {
            correlationId,
            rawLogs: logs,
            performanceReport: report,
            timeline: this.getAgentTimeline(correlationId),
            contextEvolution: this.getContextEvolution(correlationId),
            validationHistory: this.getValidationHistory(correlationId),
            memoryTracking: this.getMemoryTracking(correlationId)
        };

        const filename = outputPath || path.join(this.debugDir, `export_${correlationId}.json`);
        
        try {
            fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
            console.log(`Debug session exported to: ${filename}`);
            return true;
        } catch (error) {
            console.error('Error exporting session:', error);
            return false;
        }
    }

    /**
     * Clean up old debug files
     */
    cleanup(maxAgeHours = 24) {
        if (!fs.existsSync(this.debugDir)) return;

        const maxAge = maxAgeHours * 60 * 60 * 1000;
        const now = Date.now();
        
        const files = fs.readdirSync(this.debugDir);
        let cleaned = 0;

        files.forEach(file => {
            const filepath = path.join(this.debugDir, file);
            const stats = fs.statSync(filepath);
            
            if (now - stats.mtime.getTime() > maxAge) {
                fs.unlinkSync(filepath);
                cleaned++;
            }
        });

        console.log(`Cleaned up ${cleaned} debug files older than ${maxAgeHours} hours`);
        return cleaned;
    }

    /**
     * Display formatted debug summary for console
     */
    displaySessionSummary(correlationId) {
        const report = this.generatePerformanceReport(correlationId);
        if (!report) {
            console.log('❌ Debug session not found:', correlationId);
            return;
        }

        console.log('\n🔍 =================================');
        console.log('🔍 DEBUG SESSION SUMMARY');
        console.log('🔍 =================================');
        console.log('📋 Correlation ID:', correlationId);
        console.log('⏱️  Total Execution Time:', report.summary.totalExecutionTime, 'ms');
        console.log('🤖 Agents Used:', report.summary.totalAgents);
        console.log('🔢 Total Tokens:', report.summary.totalTokens);
        console.log('🔍 Validation Attempts:', report.summary.validationAttempts);
        console.log('💾 Peak Memory:', report.summary.peakMemory, 'MB');
        
        console.log('\n📊 AGENT PERFORMANCE:');
        report.agentPerformance.forEach(agent => {
            console.log(`  ${agent.agent}: ${agent.executionTime}ms, ${agent.tokenUsage} tokens`);
        });

        console.log('\n✅ VALIDATION SCORES:');
        report.validationScores.forEach((val, i) => {
            console.log(`  Attempt ${i + 1}: ${val.overallScore}% (${val.passed ? 'PASS' : 'FAIL'})`);
        });
        
        console.log('🔍 =================================\n');
    }
}

module.exports = new DebugUtils();