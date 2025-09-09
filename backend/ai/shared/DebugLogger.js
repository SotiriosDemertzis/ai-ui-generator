const fs = require('fs');
const path = require('path');

class DebugLogger {
    constructor() {
        this.debugDir = path.join(__dirname, '../../debug');
        this.ensureDebugDir();
        this.correlationId = null;
        this.sessionLogs = new Map();
    }

    ensureDebugDir() {
        if (!fs.existsSync(this.debugDir)) {
            fs.mkdirSync(this.debugDir, { recursive: true });
        }
    }

    generateCorrelationId() {
        this.correlationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return this.correlationId;
    }

    setCorrelationId(id) {
        this.correlationId = id;
    }

    logAgentExecution(agentName, phase, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            correlationId: this.correlationId,
            agent: agentName,
            phase,
            ...data
        };

        // Console output for immediate debugging
        console.log(`[${timestamp}] [${this.correlationId}] [${agentName}:${phase}]`, 
            JSON.stringify(data, this.getCircularReplacer(), 2));

        // Store in memory for session tracking
        if (!this.sessionLogs.has(this.correlationId)) {
            this.sessionLogs.set(this.correlationId, []);
        }
        this.sessionLogs.get(this.correlationId).push(logEntry);

        // Write to file for persistence
        this.writeToFile(logEntry);
    }

    logAgentInput(agentName, input) {
        const inputData = {
            inputSize: this.getObjectSize(input.context),
            inputKeys: Object.keys(input.context || {}),
            promptLength: input.prompt ? input.prompt.length : 0,
            contextCompression: this.calculateContextCompression(input.context)
        };

        this.logAgentExecution(agentName, 'INPUT', inputData);
    }

    logAgentOutput(agentName, output, executionTime) {
        const outputData = {
            success: output.success,
            outputSize: this.getObjectSize(output.response),
            outputKeys: this.getOutputKeys(output.response), // FIXED: Use proper key extraction for different types
            executionTime: executionTime,
            tokenUsage: output.metadata?.tokensUsed, // FIXED: Changed from tokenUsage to tokensUsed to match runAgent.js
            hasError: !!output.error
        };

        if (output.error) {
            outputData.error = output.error.message || output.error;
        }

        this.logAgentExecution(agentName, 'OUTPUT', outputData);
    }

    /**
     * Get appropriate keys for different output types
     */
    getOutputKeys(response) {
        if (!response) return [];
        
        // If it's a string (AI response), don't return character indices
        if (typeof response === 'string') {
            return ['responseText']; // Indicate it's a text response
        }
        
        // If it's an object, return its keys
        if (typeof response === 'object') {
            return Object.keys(response);
        }
        
        // For other types, return type indicator
        return [typeof response];
    }

    logValidationDetails(validationResult) {
        const validationData = {
            overallScore: validationResult.overallScore,
            passed: validationResult.passed,
            compliance: validationResult.compliance,
            criticalIssues: validationResult.criticalIssues?.length || 0,
            contentUtilization: validationResult.contentUtilization?.rate,
            failedRulesCount: this.countFailedRules(validationResult),
            passedRulesCount: this.countPassedRules(validationResult)
        };

        this.logAgentExecution('ValidatorAgent', 'VALIDATION_RESULT', validationData);
    }

    logContextEvolution(phase, context) {
        const contextData = {
            phase,
            contextSize: this.getObjectSize(context),
            contextKeys: Object.keys(context || {}),
            hasPageSpec: !!context.pageSpec,
            hasDesign: !!context.design,
            hasContent: !!context.content,
            hasLayout: !!context.layout,
            hasCode: !!context.code,
            hasValidation: !!context.validation
        };

        this.logAgentExecution('CONTEXT_TRACKER', phase, contextData);
    }

    logMemoryUsage() {
        const memUsage = process.memoryUsage();
        const memoryData = {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
            external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100, // MB
            rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100 // MB
        };

        this.logAgentExecution('MEMORY_MONITOR', 'USAGE', memoryData);
    }

    getGenerationSummary(correlationId) {
        const logs = this.sessionLogs.get(correlationId || this.correlationId);
        if (!logs) return null;

        const summary = {
            correlationId: correlationId || this.correlationId,
            startTime: logs[0]?.timestamp,
            endTime: logs[logs.length - 1]?.timestamp,
            totalLogs: logs.length,
            agents: [...new Set(logs.map(l => l.agent))],
            phases: logs.map(l => `${l.agent}:${l.phase}`),
            executionTimes: logs.filter(l => l.executionTime).map(l => ({
                agent: l.agent,
                time: l.executionTime
            })),
            tokenUsage: logs.filter(l => l.tokensUsed || l.promptTokens || l.completionTokens).map(l => ({
                agent: l.agent,
                tokensUsed: l.tokensUsed || 0,
                promptTokens: l.promptTokens || 0,
                completionTokens: l.completionTokens || 0
            })),
            totalTokens: logs.reduce((sum, l) => sum + (l.tokensUsed || 0), 0),
            memoryPeaks: logs.filter(l => l.agent === 'MEMORY_MONITOR').map(l => l.heapUsed),
            errors: logs.filter(l => l.hasError).map(l => ({
                agent: l.agent,
                error: l.error
            }))
        };

        return summary;
    }

    writeToFile(logEntry) {
        const filename = `debug_${this.correlationId}.json`;
        const filepath = path.join(this.debugDir, filename);
        
        try {
            // Append to existing file or create new one
            let existingData = [];
            if (fs.existsSync(filepath)) {
                const content = fs.readFileSync(filepath, 'utf8');
                if (content.trim()) {
                    existingData = JSON.parse(content);
                }
            }
            
            existingData.push(logEntry);
            fs.writeFileSync(filepath, JSON.stringify(existingData, null, 2));
        } catch (error) {
            console.error('Error writing debug log to file:', error);
        }
    }

    // Helper methods
    getObjectSize(obj) {
        if (!obj) return 0;
        try {
            return JSON.stringify(obj).length;
        } catch (e) {
            return 0;
        }
    }

    calculateContextCompression(context) {
        if (!context) return 0;
        const originalSize = this.getObjectSize(context);
        // This is a placeholder - actual compression would depend on your compression logic
        return originalSize > 10000 ? Math.round((originalSize - 10000) / originalSize * 100) : 0;
    }

    countFailedRules(validationResult) {
        // Try UIUXRulesValidator format first
        if (validationResult.summary?.totalRules && validationResult.summary?.passedRules) {
            const totalRules = validationResult.summary.totalRules;
            const passedRules = validationResult.summary.passedRules;
            const partialRules = validationResult.summary.partialRules || 0;
            return totalRules - passedRules - partialRules;
        }
        
        // Fallback to category-based counting
        if (!validationResult.categories) return 0;
        return Object.values(validationResult.categories).reduce((count, category) => {
            if (category.rules) {
                const failedRules = category.rules.filter(rule => rule.status === 'FAIL').length;
                return count + failedRules;
            }
            return count + (category.failedRules?.length || 0);
        }, 0);
    }

    countPassedRules(validationResult) {
        // Try UIUXRulesValidator format first
        if (validationResult.summary?.passedRules !== undefined) {
            return validationResult.summary.passedRules;
        }
        
        // Fallback to category-based counting
        if (!validationResult.categories) return 0;
        return Object.values(validationResult.categories).reduce((count, category) => {
            if (category.rules) {
                const passedRules = category.rules.filter(rule => rule.status === 'PASS').length;
                return count + passedRules;
            }
            return count + (category.passedRules?.length || 0);
        }, 0);
    }

    getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return "[Circular]";
                }
                seen.add(value);
            }
            return value;
        };
    }

    cleanup(maxAge = 24 * 60 * 60 * 1000) { // Default: 24 hours
        try {
            const files = fs.readdirSync(this.debugDir);
            const now = Date.now();
            
            files.forEach(file => {
                const filepath = path.join(this.debugDir, file);
                const stats = fs.statSync(filepath);
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filepath);
                    console.log(`Cleaned up old debug file: ${file}`);
                }
            });
        } catch (error) {
            console.error('Error during debug file cleanup:', error);
        }
    }
}

// Singleton instance
const debugLogger = new DebugLogger();

module.exports = debugLogger;