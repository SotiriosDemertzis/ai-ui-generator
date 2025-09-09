require('dotenv').config({path: '.env'});

// Ensure GROQ_API_KEY is available
if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in environment variables');
    process.exit(1);
}
const { CodeAgent } = require('../ai/agents/codeAgent');

async function testCodeAgent() {
    console.log('=== Testing CodeAgent with complete shoe store context ===');
    const startTime = Date.now();
    
    try {
        // Mock context from previous agents (comprehensive)
        const mockContext = {
            pageSpec: {
                type: 'landing_page',
                industry: 'retail',
                complexity: 7,
                sections: [
                    { name: 'hero', required: true },
                    { name: 'products', required: true },
                    { name: 'features', required: true }
                ],
                functionalRequirements: ['responsive design', 'product showcase', 'CTA buttons']
            },
            design: {
                modernVisualSystem: { style: 'contemporary', primaryPattern: 'grid-focused' },
                advancedColorSystem: {
                    primaryGradients: ['from-blue-600 to-purple-600'],
                    semanticColors: { success: 'green-500', warning: 'yellow-500' }
                },
                modernTypography: { headingFont: 'Inter' }
            },
            content: {
                hero: { 
                    title: 'Premium Footwear Collection', 
                    subtitle: 'Discover comfort and style in every step',
                    ctaButtons: [{ text: 'Shop Now', action: 'browse products' }]
                },
                features: [
                    { title: 'Quality Materials', description: 'Premium leather and sustainable fabrics' },
                    { title: 'Comfort Technology', description: 'Advanced cushioning systems' }
                ],
                companyInfo: { name: 'SoleStride', description: 'Premium shoe retailer' }
            },
            layout: {
                strategy: 'hero-focused',
                sections: [
                    { name: 'hero', layout: 'split-screen', responsive: true },
                    { name: 'features', layout: 'three-column-grid', responsive: true }
                ]
            }
        };
        
        const codeAgent = new CodeAgent();
        const result = await codeAgent.generateCode(mockContext);
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        console.log('Raw Result Structure:', {
            success: result.success,
            hasReactCode: !!result.reactCode,
            resultKeys: result ? Object.keys(result) : [],
            reactCodeLength: result.reactCode?.length || 0
        });
        
        if (result.reactCode) {
            console.log('React Code Preview (first 500 chars):', result.reactCode.substring(0, 500));
        }
        
        console.log(`Execution Time: ${executionTime}ms`);
        
        // LOGICAL VALIDATION
        const logicalErrors = [];
        
        if (!result.success || !result.reactCode) {
            logicalErrors.push('CRITICAL: Agent did not return successful response with data');
        } else {
            const codeOutput = { reactCode: result.reactCode, componentName: result.componentName };
            
            // 1. Should have React code
            if (!codeOutput.reactCode) {
                logicalErrors.push('MISSING: reactCode - Should generate React component');
            } else {
                const code = codeOutput.reactCode;
                
                // Basic React structure validation
                if (!code.includes('function') && !code.includes('const') && !code.includes('=>')) {
                    logicalErrors.push('INVALID: reactCode should contain React component definition');
                }
                
                if (!code.includes('return')) {
                    logicalErrors.push('INVALID: React component should have return statement');
                }
                
                if (!code.includes('jsx') && !code.includes('<div') && !code.includes('<')) {
                    logicalErrors.push('INVALID: React component should contain JSX elements');
                }
                
                // Should use Tailwind CSS classes
                if (!code.includes('className')) {
                    logicalErrors.push('MISSING: Should use Tailwind CSS with className');
                }
                
                // Should include shoe store content
                const codeString = code.toLowerCase();
                const shoeContent = ['premium footwear', 'shoe', 'solestride', 'quality materials', 'comfort'];
                const hasShoeContent = shoeContent.some(content => codeString.includes(content.toLowerCase()));
                if (!hasShoeContent) {
                    logicalErrors.push('CONTEXT ERROR: Generated code should include shoe store content');
                }
                
                // Should have responsive classes
                const responsiveClasses = ['sm:', 'md:', 'lg:', 'xl:'];
                const hasResponsive = responsiveClasses.some(cls => code.includes(cls));
                if (!hasResponsive) {
                    logicalErrors.push('RESPONSIVE: Code should include responsive Tailwind classes');
                }
                
                // Should not have template/placeholder content
                const templateIndicators = ['[placeholder]', 'lorem ipsum', 'sample', 'example', 'your company'];
                const foundTemplates = templateIndicators.filter(template => 
                    codeString.includes(template)
                );
                if (foundTemplates.length > 0) {
                    logicalErrors.push(`TEMPLATE CONTENT: Found placeholders: ${foundTemplates.join(', ')}`);
                }
                
                // Should have proper component structure
                if (!code.includes('export') && !code.includes('module.exports')) {
                    logicalErrors.push('EXPORT: Component should be exportable');
                }
                
                // Code length validation
                if (code.length < 500) {
                    logicalErrors.push('CODE TOO BRIEF: Generated code seems insufficient for a complete landing page');
                }
                
                // Should have modern JSX patterns
                const modernPatterns = ['className=', 'onClick', 'useState', 'useEffect'];
                const hasModernPattern = modernPatterns.some(pattern => code.includes(pattern));
                if (!hasModernPattern) {
                    logicalErrors.push('OUTDATED: Code should use modern React patterns');
                }
            }
            
            // 2. Should have component name
            if (!codeOutput.componentName) {
                logicalErrors.push('MISSING: componentName - Should specify component name');
            } else if (codeOutput.componentName.length < 3) {
                logicalErrors.push('INVALID: componentName should be meaningful');
            }
            
            // 3. Should list dependencies if any
            if (codeOutput.dependencies && !Array.isArray(codeOutput.dependencies)) {
                logicalErrors.push('INVALID: dependencies should be an array');
            }
            
            // 4. Should list features
            if (codeOutput.features && !Array.isArray(codeOutput.features)) {
                logicalErrors.push('INVALID: features should be an array');
            }
        }
        
        // PERFORMANCE CHECK
        if (executionTime > 45000) { // Code generation can take longer
            logicalErrors.push(`PERFORMANCE: Execution took ${executionTime}ms (over 45s limit)`);
        }
        
        // FINAL VALIDATION
        if (logicalErrors.length === 0) {
            console.log('✅ CodeAgent PASSED - Generated production-ready React component for shoe store');
            return { success: true, errors: [] };
        } else {
            console.log('❌ CodeAgent FAILED');
            console.log('ERRORS:', logicalErrors);
            return { success: false, errors: logicalErrors };
        }
        
    } catch (error) {
        console.log('❌ CodeAgent FAILED - Runtime Error:', error.message);
        console.log('Stack:', error.stack?.substring(0, 500));
        return { success: false, errors: [`Runtime Error: ${error.message}`] };
    }
}

// Run test if called directly
if (require.main === module) {
    testCodeAgent().then(result => {
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = testCodeAgent;