require('dotenv').config();
const { SpecAgent } = require('../ai/agents/specAgent');

async function testSpecAgent() {
    console.log('=== Testing SpecAgent with: "Shoe store landing page" ===');
    const startTime = Date.now();
    
    try {
        const specAgent = new SpecAgent();
        const result = await specAgent.generateSpec('Shoe store landing page');
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        console.log('Raw Result:', JSON.stringify(result, null, 2));
        console.log(`Execution Time: ${executionTime}ms`);
        
        // LOGICAL VALIDATION: Does SpecAgent do what it's supposed to do?
        const logicalErrors = [];
        
        // Check if we have a successful response with data
        if (!result.success || !result.pageSpec) {
            logicalErrors.push('CRITICAL: Agent did not return successful response with pageSpec');
        } else {
            const pageSpec = result.pageSpec;
            
            // 1. Should extract page type correctly
            if (!pageSpec.type) {
                logicalErrors.push('MISSING: pageSpec.type - Agent should identify this as a landing page');
            } else if (!['landing', 'landing_page', 'ecommerce', 'retail'].includes(pageSpec.type.toLowerCase())) {
                logicalErrors.push(`WRONG TYPE: Expected landing/ecommerce type for shoe store, got '${pageSpec.type}'`);
            }
            
// 2. Should identify industry correctly            if (!pageSpec.industry) {                logicalErrors.push('MISSING: pageSpec.industry - Should identify retail/ecommerce industry');            } else {                const industryText = pageSpec.industry.toLowerCase();                const expectedIndustries = ['retail', 'ecommerce', 'e-commerce', 'fashion', 'footwear'];                const hasValidIndustry = expectedIndustries.some(expected => industryText.includes(expected));                if (!hasValidIndustry) {                    logicalErrors.push(`INDUSTRY MISMATCH: Expected retail/ecommerce/fashion/footwear, got '${pageSpec.industry}'`);                }            }
            
            // 3. Should have shoe store specific sections
            if (!pageSpec.sections || !Array.isArray(pageSpec.sections)) {
                logicalErrors.push('MISSING: pageSpec.sections - Should define page sections for shoe store');
            } else {
                const sectionNames = pageSpec.sections.map(s => (s.name || '').toLowerCase());
                const expectedSections = ['hero', 'products', 'product', 'features', 'catalog', 'collection'];
                const hasRelevantSections = expectedSections.some(expected => 
                    sectionNames.some(section => section.includes(expected))
                );
                if (!hasRelevantSections) {
                    logicalErrors.push('LOGICAL ERROR: No shoe store relevant sections found (hero, products, features, etc.)');
                }
            }
            
            // 4. Should not contain template/generic answers
            const jsonString = JSON.stringify(pageSpec);
            const templateIndicators = ['[placeholder]', 'example.com', 'lorem ipsum', 'todo:', 'tbd', 'sample company', 'your company'];
            const foundTemplates = templateIndicators.filter(template => 
                jsonString.toLowerCase().includes(template)
            );
            if (foundTemplates.length > 0) {
                logicalErrors.push(`TEMPLATE CONTENT: Found generic templates: ${foundTemplates.join(', ')}`);
            }
            
            // 5. Should have complexity rating
            if (!pageSpec.complexity || pageSpec.complexity < 1 || pageSpec.complexity > 10) {
                logicalErrors.push('MISSING/INVALID: complexity rating should be 1-10');
            }
            
            // 6. Should have functional requirements for shoe store
            if (!pageSpec.functionalRequirements || !Array.isArray(pageSpec.functionalRequirements)) {
                logicalErrors.push('MISSING: functionalRequirements array');
            } else if (pageSpec.functionalRequirements.length === 0) {
                logicalErrors.push('EMPTY: functionalRequirements should include shoe store features');
            }
            
            // 7. Should have style guide
            if (!pageSpec.styleGuide) {
                logicalErrors.push('MISSING: styleGuide - Should provide styling guidance');
            }
        }
        
        // PERFORMANCE CHECK
        if (executionTime > 30000) { // 30 second timeout
            logicalErrors.push(`PERFORMANCE: Execution took ${executionTime}ms (over 30s limit)`);
        }
        
        // FINAL VALIDATION
        if (logicalErrors.length === 0) {
            console.log('✅ SpecAgent PASSED - Correctly identified shoe store landing page requirements');
            return { success: true, errors: [] };
        } else {
            console.log('❌ SpecAgent FAILED');
            console.log('LOGICAL ERRORS:', logicalErrors);
            return { success: false, errors: logicalErrors };
        }
        
    } catch (error) {
        console.log('❌ SpecAgent FAILED - Runtime Error:', error.message);
        console.log('Stack:', error.stack);
        return { success: false, errors: [`Runtime Error: ${error.message}`] };
    }
}

// Run test if called directly
if (require.main === module) {
    testSpecAgent().then(result => {
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = testSpecAgent;