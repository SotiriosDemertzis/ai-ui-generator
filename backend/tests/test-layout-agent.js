require('dotenv').config({path: '.env'});

// Ensure GROQ_API_KEY is available
if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in environment variables');
    process.exit(1);
}
const { LayoutAgent } = require('../ai/agents/layoutAgent');

async function testLayoutAgent() {
    console.log('=== Testing LayoutAgent with shoe store context ===');
    const startTime = Date.now();
    
    try {
        // Mock context from previous agents
        const mockContext = {
            pageSpec: {
                type: 'ecommerce',
                industry: 'retail',
                complexity: 6,
                sections: [
                    { name: 'hero', required: true, content: 'Main landing section' },
                    { name: 'products', required: true, content: 'Shoe products showcase' },
                    { name: 'features', required: true, content: 'Store features and benefits' }
                ],
                targetAudience: 'Fashion-conscious individuals interested in purchasing shoes online'
            },
            design: {
                modernVisualSystem: { style: 'contemporary' },
                advancedColorSystem: { primaryGradients: ['from-blue-600 to-purple-600'] }
            },
            content: {
                hero: { title: 'Premium Shoe Collection', subtitle: 'Discover your perfect pair' },
                features: [
                    { title: 'Quality Craftsmanship', description: 'Handcrafted with premium materials' }
                ]
            }
        };
        
        const layoutAgent = new LayoutAgent();
        const result = await layoutAgent.generateLayout(mockContext);
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        console.log('Raw Result Structure:', {
            success: result.success,
            hasLayout: !!result.layout,
            layoutKeys: result.layout ? Object.keys(result.layout) : [],
            executionTime: `${executionTime}ms`
        });
        
        if (result.layout) {
            console.log('Layout Preview:', JSON.stringify(result.layout, null, 2).substring(0, 500) + '...');
        }
        
        // LOGICAL VALIDATION
        const logicalErrors = [];
        
        if (!result.success || !result.layout) {
            logicalErrors.push('CRITICAL: Agent did not return successful response with layout data');
        } else {
            const layout = result.layout;
            
            // 1. Should have layout strategy
            if (!layout.strategy && !layout.layoutStrategy && !layout.type && !layout.name) {
                logicalErrors.push('MISSING: layout strategy - Should define overall layout approach');
            }
            
            // 2. Should have sections layout
            if (!layout.sections && !layout.sectionsLayout && !layout.structure?.sections) {
                logicalErrors.push('MISSING: sections layout - Should define section arrangements');
            }
            
            // 3. Should have responsive design
            if (!layout.responsive && !layout.gridSystem && !layout.breakpoints && !layout.structure?.sections?.some(s => s.responsiveClasses)) {
                logicalErrors.push('MISSING: responsive design system - Should have breakpoints or grid');
            }
            
            // 4. Should be shoe store specific (not generic)
            const layoutString = JSON.stringify(layout).toLowerCase();
            const retailKeywords = ['product', 'showcase', 'grid', 'card', 'gallery', 'feature', 'hero'];
            const hasRetailContext = retailKeywords.some(keyword => layoutString.includes(keyword));
            if (!hasRetailContext) {
                logicalErrors.push('CONTEXT ERROR: Layout should reflect retail/ecommerce patterns');
            }
            
            // 5. Should not have template/placeholder content
            const templateIndicators = ['[placeholder]', 'lorem ipsum', 'sample', 'example', 'template', 'default'];
            const foundTemplates = templateIndicators.filter(template => 
                layoutString.includes(template)
            );
            if (foundTemplates.length > 0) {
                logicalErrors.push(`TEMPLATE CONTENT: Found placeholders: ${foundTemplates.join(', ')}`);
            }
            
            // 6. Layout should be detailed and comprehensive
            const layoutKeys = Object.keys(layout);
            if (layoutKeys.length < 2) {
                logicalErrors.push(`INSUFFICIENT DETAIL: Layout should have multiple systems (has ${layoutKeys.length})`);
            }
            
            // 7. Should have component hierarchy or arrangement
            if (!layout.componentHierarchy && !layout.hierarchy && !layout.arrangement && !layout.structure && !layout.components) {
                logicalErrors.push('MISSING: component hierarchy - Should define component relationships');
            }
        }
        
        // PERFORMANCE CHECK
        if (executionTime > 45000) {
            logicalErrors.push(`PERFORMANCE: Execution took ${executionTime}ms (over 45s limit)`);
        }
        
        // FINAL VALIDATION
        if (logicalErrors.length === 0) {
            console.log('✅ LayoutAgent PASSED - Generated comprehensive layout system for shoe store');
            return { success: true, errors: [] };
        } else {
            console.log('❌ LayoutAgent FAILED');
            console.log('ERRORS:', logicalErrors);
            return { success: false, errors: logicalErrors };
        }
        
    } catch (error) {
        console.log('❌ LayoutAgent FAILED - Runtime Error:', error.message);
        console.log('Stack:', error.stack?.substring(0, 500));
        return { success: false, errors: [`Runtime Error: ${error.message}`] };
    }
}

// Run test if called directly
if (require.main === module) {
    testLayoutAgent().then(result => {
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = testLayoutAgent;