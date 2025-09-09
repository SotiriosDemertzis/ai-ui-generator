require('dotenv').config({path: '.env'});

// Ensure GROQ_API_KEY is available
if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in environment variables');
    process.exit(1);
}
const { DesignAgent } = require('../ai/agents/designAgent');

async function testDesignAgent() {
    console.log('=== Testing DesignAgent with shoe store context ===');
    const startTime = Date.now();
    
    try {
        // Mock context from SpecAgent (as would come from orchestrator)
        const mockPageSpec = {
            type: 'ecommerce',
            industry: 'retail',
            complexity: 6,
            sections: [
                { name: 'hero', required: true },
                { name: 'products', required: true },
                { name: 'features', required: true }
            ],
            targetAudience: 'Fashion-conscious individuals interested in shoes'
        };
        
        const designAgent = new DesignAgent();
        const result = await designAgent.generateDesign(mockPageSpec);
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        console.log('Raw Result Structure:', {
            success: result.success,
            hasDesign: !!result.design,
            designKeys: result.design ? Object.keys(result.design) : [],
            executionTime: `${executionTime}ms`
        });
        
        if (result.design) {
            console.log('Design Preview:', JSON.stringify(result.design, null, 2).substring(0, 500) + '...');
        }
        
        // LOGICAL VALIDATION
        const logicalErrors = [];
        
        if (!result.success || !result.design) {
            logicalErrors.push('CRITICAL: Agent did not return successful response with design data');
        } else {
            const design = result.design;
            
            // 1. Should have modern visual system
            if (!design.modernVisualSystem) {
                logicalErrors.push('MISSING: modernVisualSystem - Should define overall visual approach');
            } else {
                if (!design.modernVisualSystem.style) {
                    logicalErrors.push('MISSING: modernVisualSystem.style');
                }
            }
            
            // 2. Should have color system appropriate for retail
            if (!design.advancedColorSystem) {
                logicalErrors.push('MISSING: advancedColorSystem - Should define color palette');
            } else {
                if (!design.advancedColorSystem.primaryGradients || !Array.isArray(design.advancedColorSystem.primaryGradients)) {
                    logicalErrors.push('MISSING: advancedColorSystem.primaryGradients array');
                }
            }
            
            // 3. Should have typography system
            if (!design.modernTypography) {
                logicalErrors.push('MISSING: modernTypography - Should define font system');
            }
            
            // 4. Should have micro-interactions
            if (!design.microInteractions) {
                logicalErrors.push('MISSING: microInteractions - Should define hover/focus effects');
            }
            
            // 5. Should be retail-appropriate (not generic)
            const designString = JSON.stringify(design).toLowerCase();
            const retailKeywords = ['product', 'shop', 'buy', 'ecommerce', 'retail', 'modern', 'contemporary'];
            const hasRetailContext = retailKeywords.some(keyword => designString.includes(keyword));
            if (!hasRetailContext) {
                logicalErrors.push('CONTEXT ERROR: Design should reflect retail/ecommerce context');
            }
            
            // 6. Should not have template/generic content  
            const templateIndicators = ['[placeholder]', 'example', 'lorem', 'sample', 'default', 'template'];
            const foundTemplates = templateIndicators.filter(template => 
                designString.includes(template)
            );
            if (foundTemplates.length > 0) {
                logicalErrors.push(`TEMPLATE CONTENT: Found generic templates: ${foundTemplates.join(', ')}`);
            }
            
            // 7. Should have layout innovations
            if (!design.layoutInnovations) {
                logicalErrors.push('MISSING: layoutInnovations - Should include modern layout patterns');
            }
            
            // 8. Design should be detailed and comprehensive
            const designKeys = Object.keys(design);
            if (designKeys.length < 4) {
                logicalErrors.push(`INSUFFICIENT DETAIL: Design should have multiple systems (has ${designKeys.length})`);
            }
        }
        
        // PERFORMANCE CHECK
        if (executionTime > 45000) {
            logicalErrors.push(`PERFORMANCE: Execution took ${executionTime}ms (over 45s limit)`);
        }
        
        // FINAL VALIDATION
        if (logicalErrors.length === 0) {
            console.log('✅ DesignAgent PASSED - Created comprehensive design system for shoe store');
            return { success: true, errors: [] };
        } else {
            console.log('❌ DesignAgent FAILED');
            console.log('ERRORS:', logicalErrors);
            return { success: false, errors: logicalErrors };
        }
        
    } catch (error) {
        console.log('❌ DesignAgent FAILED - Runtime Error:', error.message);
        console.log('Stack:', error.stack?.substring(0, 500));
        return { success: false, errors: [`Runtime Error: ${error.message}`] };
    }
}

// Run test if called directly
if (require.main === module) {
    testDesignAgent().then(result => {
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = testDesignAgent;