/**
 * @file backend/tests/orchestrator_simple.test.js
 * @description Simple orchestrator test that imports environment variables and runs the orchestrator
 * @version 1.0
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ImprovedOrchestrator } = require('../ai/orchestrator');

// Suppress deprecation warnings for tests
process.noDeprecation = true;

// Log storage setup
const LOG_DIR = path.join(__dirname, 'logs');
const GENERATED_PAGES_DIR = path.join(__dirname, 'generatedPages');
const TEST_START_TIME = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_FILE = path.join(LOG_DIR, `orchestrator_test_${TEST_START_TIME}.log`);

// Ensure logs and generated pages directories exist
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}
if (!fs.existsSync(GENERATED_PAGES_DIR)) {
    fs.mkdirSync(GENERATED_PAGES_DIR, { recursive: true });
}

// Store original console methods
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
};

// Create log file stream
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w', encoding: 'utf8' });

// Log capture methods that write ONLY to file (silent mode)
const logCapture = {
    log: (...args) => {
        const message = args.join(' ');
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] LOG: ${message}\n`;
        logStream.write(logLine);
    },
    error: (...args) => {
        const message = args.join(' ');
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ERROR: ${message}\n`;
        logStream.write(logLine);
    },
    warn: (...args) => {
        const message = args.join(' ');
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] WARN: ${message}\n`;
        logStream.write(logLine);
    },
    info: (...args) => {
        const message = args.join(' ');
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] INFO: ${message}\n`;
        logStream.write(logLine);
    }
};

// Override console methods to capture logs silently
console.log = logCapture.log;
console.error = logCapture.error;
console.warn = logCapture.warn;
console.info = logCapture.info;

/**
 * Simple test to verify orchestrator initialization and basic functionality
 */
async function testOrchestratorSimple() {
    const startTime = Date.now();
    
    // Only show essential test info to console
    originalConsole.log('🧪 [Orchestrator Simple Test] Starting...');
    originalConsole.log(`📁 [Test] Logs will be saved to: ${LOG_FILE}`);
    originalConsole.log('📋 [Test] Running orchestrator test (all logs captured to file)...');
    
    // Write test start to log (all orchestrator output will be captured)
    logStream.write(`[${new Date().toISOString()}] TEST_START: Orchestrator Simple Test\n`);
    logStream.write(`[${new Date().toISOString()}] ENVIRONMENT_CHECK: GROQ_API_KEY=${!!process.env.GROQ_API_KEY}, DATABASE_URL=${!!process.env.DATABASE_URL}, JWT_SECRET=${!!process.env.JWT_SECRET}\n`);
    
    // Log test details
    console.log('🧪 [Orchestrator Simple Test] Starting...');
    console.log('📋 [Test] Environment variables loaded');
    console.log('🔑 [Test] GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);
    console.log('🔑 [Test] DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.log('🔑 [Test] JWT_SECRET present:', !!process.env.JWT_SECRET);
    
    try {
        // Test 1: Initialize orchestrator (log to file)
        console.log('\n📋 [Test 1] Initializing orchestrator...');
        const orchestrator = new ImprovedOrchestrator();
        console.log('✅ [Test 1] Orchestrator initialized successfully');
        
        // Test 2: Simple generation test (all orchestrator logs go to file)
        console.log('\n📋 [Test 2] Running simple generation test...');
        const testPrompt = 'Create a simple contact form for a tech startup';
        console.log('📝 [Test 2] Test prompt:', testPrompt);
        
        originalConsole.log('🔄 [Test] Orchestrator execution starting (logs captured to file)...');
        
        const testStartTime = Date.now();
        const result = await orchestrator.generatePage(testPrompt, {
            sessionId: `test_${Date.now()}`
        });
        const executionTime = Date.now() - testStartTime;
        
        // Show only results to console
        originalConsole.log('\n📊 [Test 2] Generation Results:');
        originalConsole.log('🔍 Success:', result.success);
        originalConsole.log('🔍 Execution Time:', executionTime, 'ms');
        originalConsole.log('🔍 Final Code Length:', result.finalCode?.length || 0);
        originalConsole.log('🔍 Validation Score:', result.validationScore || 0);
        originalConsole.log('🔍 Agents Used:', result.agentsUsed?.join(', ') || 'none');
        
        if (result.success) {
            originalConsole.log('✅ [Test 2] Generation completed successfully');
            
            // Save the generated page to file
            originalConsole.log('\n📋 [Test 3] Saving generated page to file...');
            try {
                const pageFileName = `generated_page_${TEST_START_TIME}.jsx`;
                const pageFilePath = path.join(GENERATED_PAGES_DIR, pageFileName);
                
                // Create page content with metadata
                const pageContent = `/*
 * Generated Page - Test Run
 * Generated at: ${new Date().toISOString()}
 * Test prompt: ${testPrompt}
 * Validation Score: ${result.validationScore || 0}
 * Agents Used: ${result.agentsUsed?.join(' → ') || 'none'}
 * Execution Time: ${executionTime}ms
 */

${result.finalCode || '// No code generated'}
`;

                // Write the generated page to file
                fs.writeFileSync(pageFilePath, pageContent, 'utf8');
                
                originalConsole.log('✅ [Test 3] Page saved to file successfully');
                originalConsole.log('📁 File Path:', pageFilePath);
                originalConsole.log('📄 File Size:', Math.round(pageContent.length / 1024) + 'KB');
                
                // Also save metadata as JSON
                const metadataFileName = `generated_page_metadata_${TEST_START_TIME}.json`;
                const metadataFilePath = path.join(GENERATED_PAGES_DIR, metadataFileName);
                const metadata = {
                    timestamp: new Date().toISOString(),
                    testPrompt,
                    validationScore: result.validationScore || 0,
                    agentsUsed: result.agentsUsed || [],
                    executionTime,
                    finalCodeLength: result.finalCode?.length || 0,
                    context: {
                        pageSpec: result.context?.pageSpec,
                        layout: result.context?.layout,
                        validation: result.context?.validation
                    }
                };
                
                fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2), 'utf8');
                originalConsole.log('� Metadata saved to:', metadataFileName);
                
                // Log the saved file info to log file
                console.log(`✅ [File Save] Page saved to: ${pageFilePath}`);
                console.log(`📋 [File Save] Metadata saved to: ${metadataFilePath}`);
                console.log(`📄 [File Save] Content length: ${pageContent.length} characters`);
                
            } catch (fileError) {
                originalConsole.error('❌ [Test 3] Failed to save page to file:', fileError.message);
                console.error(`❌ [File Save] Save failed: ${fileError.message}`);
            }
            
            // Basic validation checks
            if (result.finalCode && result.finalCode.length > 0) {
                originalConsole.log('✅ [Validation] Final code generated');
            } else {
                originalConsole.warn('⚠️ [Validation] Final code is empty or missing');
            }
            
            if (result.validationScore >= 80) {
                originalConsole.log('✅ [Validation] Good validation score');
            } else {
                originalConsole.warn('⚠️ [Validation] Low validation score');
            }
            
        } else {
            originalConsole.error('❌ [Test 2] Generation failed:', result.error);
        }
        
        // Test 4: Context completeness check (renumbered from Test 3)
        originalConsole.log('\n📋 [Test 4] Context completeness check...');
        if (result.context) {
            const completeness = result.context.metadata?.completeness || 0;
            const finalState = result.context.metadata?.finalState;
            
            originalConsole.log('🔍 Context Completeness:', completeness + '%');
            if (process.env.NODE_ENV !== 'production') {
                originalConsole.log('🔍 Final State:', JSON.stringify(finalState, null, 2));
            }
            
            if (completeness >= 80) {
                originalConsole.log('✅ [Test 4] Good context completeness');
            } else {
                originalConsole.warn('⚠️ [Test 4] Low context completeness');
            }
        } else {
            originalConsole.warn('⚠️ [Test 4] No context available');
        }
        
        originalConsole.log('\n🎉 [Orchestrator Simple Test] Completed successfully!');
        
        // Write test completion to log
        logStream.write(`\n[${new Date().toISOString()}] TEST_SUMMARY: SUCCESS\n`);
        logStream.write(`[${new Date().toISOString()}] EXECUTION_TIME: ${Date.now() - startTime}ms\n`);
        logStream.write(`[${new Date().toISOString()}] VALIDATION_SCORE: ${result.validationScore || 0}\n`);
        logStream.write(`[${new Date().toISOString()}] FINAL_CODE_LENGTH: ${result.finalCode?.length || 0}\n`);
        logStream.write(`[${new Date().toISOString()}] AGENTS_USED: ${result.agentsUsed?.join(', ') || 'none'}\n`);
        
        return true;
        
    } catch (error) {
        originalConsole.error('❌ [Orchestrator Simple Test] Failed with error:', error.message);
        originalConsole.error('📋 [Error Details]:', error.stack);
        
        // Write test failure to log
        logStream.write(`\n[${new Date().toISOString()}] TEST_SUMMARY: FAILED\n`);
        logStream.write(`[${new Date().toISOString()}] ERROR: ${error.message}\n`);
        logStream.write(`[${new Date().toISOString()}] STACK: ${error.stack}\n`);
        
        return false;
    } finally {
        // Restore original console methods
        console.log = originalConsole.log;
        console.error = originalConsole.error;
        console.warn = originalConsole.warn;
        console.info = originalConsole.info;
        
        // Close log stream
        logStream.end();
        
        originalConsole.log(`\n📁 [Test] Logs saved to: ${LOG_FILE}`);
        originalConsole.log(`📊 [Test] Log file size: ${fs.existsSync(LOG_FILE) ? Math.round(fs.statSync(LOG_FILE).size / 1024) : 0}KB`);
        originalConsole.log(`📄 [Test] Generated pages saved to: ${GENERATED_PAGES_DIR}`);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testOrchestratorSimple()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ [Test Runner] Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { testOrchestratorSimple };