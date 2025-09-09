#!/usr/bin/env node

/**
 * @file backend/debug-helper.js
 * @description Simple CLI tool to inspect debug logs from AI generation system
 * 
 * Usage:
 *   node debug-helper.js list                    # List all debug sessions
 *   node debug-helper.js show <correlationId>    # Show session summary
 *   node debug-helper.js export <correlationId>  # Export session data
 *   node debug-helper.js cleanup                 # Clean up old debug files
 */

const debugUtils = require('./ai/shared/debugUtils');

function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const correlationId = args[1];

    switch (command) {
        case 'list':
            listSessions();
            break;
        
        case 'show':
            if (!correlationId) {
                console.log('❌ Please provide a correlation ID');
                console.log('Usage: node debug-helper.js show <correlationId>');
                return;
            }
            showSession(correlationId);
            break;
        
        case 'export':
            if (!correlationId) {
                console.log('❌ Please provide a correlation ID');
                console.log('Usage: node debug-helper.js export <correlationId>');
                return;
            }
            exportSession(correlationId);
            break;
        
        case 'cleanup':
            cleanup();
            break;
        
        case 'help':
        default:
            showHelp();
            break;
    }
}

function listSessions() {
    console.log('🔍 Available Debug Sessions:');
    console.log('============================');
    
    const sessions = debugUtils.listDebugSessions();
    
    if (sessions.length === 0) {
        console.log('No debug sessions found. Generate some pages to create debug logs!');
        return;
    }

    sessions.forEach((session, index) => {
        console.log(`${index + 1}. ${session.correlationId}`);
        console.log(`   📅 Created: ${session.created.toISOString()}`);
        console.log(`   📝 Size: ${(session.size / 1024).toFixed(1)} KB`);
        console.log('');
    });
    
    console.log(`Total: ${sessions.length} sessions`);
    console.log('\nUse: node debug-helper.js show <correlationId> to view details');
}

function showSession(correlationId) {
    console.log(`🔍 Loading debug session: ${correlationId}`);
    
    // Display formatted summary
    debugUtils.displaySessionSummary(correlationId);
    
    // Show additional details
    const timeline = debugUtils.getAgentTimeline(correlationId);
    if (timeline) {
        console.log('📋 AGENT EXECUTION TIMELINE:');
        timeline.forEach(event => {
            const timestamp = new Date(event.timestamp).toLocaleTimeString();
            if (event.phase === 'INPUT') {
                console.log(`  [${timestamp}] ${event.agent} → Starting (input: ${(event.inputSize / 1024).toFixed(1)}KB)`);
            } else if (event.phase === 'OUTPUT') {
                console.log(`  [${timestamp}] ${event.agent} ← Completed in ${event.executionTime}ms (tokens: ${event.tokenUsage || 'N/A'})`);
            }
        });
    }
    
    console.log('\nUse: node debug-helper.js export <correlationId> to save full data');
}

function exportSession(correlationId) {
    console.log(`📤 Exporting debug session: ${correlationId}`);
    
    const success = debugUtils.exportSession(correlationId);
    
    if (success) {
        console.log('✅ Session exported successfully!');
        console.log('📁 Check the backend/debug/ directory for the export file');
    } else {
        console.log('❌ Failed to export session');
    }
}

function cleanup() {
    console.log('🧹 Cleaning up old debug files...');
    
    const cleaned = debugUtils.cleanup(24); // Clean files older than 24 hours
    
    if (cleaned > 0) {
        console.log(`✅ Cleaned up ${cleaned} old debug files`);
    } else {
        console.log('✨ No files needed cleanup');
    }
}

function showHelp() {
    console.log('🔍 AI Generation Debug Helper');
    console.log('=============================');
    console.log('');
    console.log('Commands:');
    console.log('  list                     List all debug sessions');
    console.log('  show <correlationId>     Show detailed session summary');
    console.log('  export <correlationId>   Export session data to JSON');
    console.log('  cleanup                  Remove old debug files (24h+)');
    console.log('  help                     Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node debug-helper.js list');
    console.log('  node debug-helper.js show gen_1704067200000_abc123');
    console.log('  node debug-helper.js export gen_1704067200000_abc123');
    console.log('');
    console.log('💡 Tip: Run "npm run generate" to create debug sessions');
}

if (require.main === module) {
    main();
}

module.exports = { main };