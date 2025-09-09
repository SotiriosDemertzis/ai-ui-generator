require('dotenv').config({path: '../.env'});

// Import test functions
const testSpecAgent = require('./test-spec-agent-fixed');

async function runAllTests() {
    console.log('🧪 === COMPREHENSIVE AGENT TEST SUITE ===');
    console.log('Running all agent tests to validate fixes...\n');
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        details: []
    };
    
    const tests = [
        { name: 'SpecAgent', fn: testSpecAgent }
        // Add other tests as we fix them
    ];
    
    for (const test of tests) {
        console.log(`\n🔄 Running ${test.name} test...`);
        results.total++;
        
        try {
            const result = await test.fn();
            if (result.success) {
                results.passed++;
                console.log(`✅ ${test.name} PASSED`);
            } else {
                results.failed++;
                console.log(`❌ ${test.name} FAILED:`, result.errors.slice(0, 3));
            }
            results.details.push({
                agent: test.name,
                success: result.success,
                errors: result.errors
            });
        } catch (error) {
            results.failed++;
            console.log(`❌ ${test.name} CRASHED:`, error.message);
            results.details.push({
                agent: test.name,
                success: false,
                errors: [`Runtime Error: ${error.message}`]
            });
        }
    }
    
    // Final report
    console.log('\n🎯 === FINAL TEST REPORT ===');
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
    
    console.log('\n📋 Detailed Results:');
    results.details.forEach(detail => {
        console.log(`\n${detail.success ? '✅' : '❌'} ${detail.agent}:`);
        if (!detail.success && detail.errors.length > 0) {
            detail.errors.slice(0, 5).forEach(error => console.log(`  - ${error}`));
        }
    });
    
    console.log('\n🏆 === CRITICAL ISSUES IDENTIFIED ===');
    
    const criticalIssues = [];
    results.details.forEach(detail => {
        if (!detail.success) {
            detail.errors.forEach(error => {
                if (error.includes('CRITICAL') || error.includes('Runtime Error')) {
                    criticalIssues.push(`${detail.agent}: ${error}`);
                }
            });
        }
    });
    
    if (criticalIssues.length > 0) {
        criticalIssues.forEach(issue => console.log(`🚨 ${issue}`));
    } else {
        console.log('✅ No critical issues found!');
    }
    
    console.log('\n📊 === SYSTEM HEALTH ASSESSMENT ===');
    if (results.passed === results.total) {
        console.log('🎉 ALL AGENTS WORKING CORRECTLY! System is production-ready.');
    } else if (results.passed / results.total >= 0.8) {
        console.log('⚠️  Most agents working, minor fixes needed.');
    } else if (results.passed / results.total >= 0.5) {
        console.log('🔧 Significant issues detected, major fixes required.');
    } else {
        console.log('🚨 SYSTEM CRITICAL - Multiple agents failing!');
    }
    
    process.exit(results.failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
});