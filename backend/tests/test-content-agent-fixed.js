require('dotenv').config({path: '.env'});

// Ensure GROQ_API_KEY is available
if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in environment variables');
    process.exit(1);
}
const { ContentAgent } = require('../ai/agents/contentAgent');

async function testContentAgent() {
    console.log('=== Testing ContentAgent with shoe store context ===');
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
                    { name: 'features', required: true, content: 'Store features and benefits' },
                    { name: 'testimonials', required: false, content: 'Customer reviews' }
                ],
                targetAudience: 'Fashion-conscious individuals interested in purchasing shoes online'
            },
            design: {
                modernVisualSystem: { style: 'contemporary' },
                advancedColorSystem: { primaryGradients: ['from-blue-600 to-purple-600'] }
            }
        };
        
        const contentAgent = new ContentAgent();
        const result = await contentAgent.generateContent(mockContext.pageSpec);
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        console.log('Raw Result Structure:', {
            success: result.success,
            hasContent: !!result.content,
            contentKeys: result.content ? Object.keys(result.content) : [],
            executionTime: `${executionTime}ms`
        });
        
        if (result.content) {
            console.log('Content Preview:', JSON.stringify(result.content, null, 2).substring(0, 500) + '...');
        }
        
        // LOGICAL VALIDATION
        const logicalErrors = [];
        
        if (!result.success || !result.content) {
            logicalErrors.push('CRITICAL: Agent did not return successful response with content data');
        } else {
            const content = result.content;
            
            // 1. Should have hero content
            if (!content.hero) {
                logicalErrors.push('MISSING: hero section content');
            } else {
                if ((!content.hero.title && !content.hero.headline) || 
                    ((content.hero.title && content.hero.title.length < 5) || 
                     (content.hero.headline && content.hero.headline.length < 5))) {
                    logicalErrors.push('MISSING/WEAK: hero.title/headline should be meaningful');
                }
                if ((!content.hero.subtitle && !content.hero.subheadline) || 
                    ((content.hero.subtitle && content.hero.subtitle.length < 10) || 
                     (content.hero.subheadline && content.hero.subheadline.length < 10))) {
                    logicalErrors.push('MISSING/WEAK: hero.subtitle/subheadline should be descriptive');
                }
            }
            
            // 2. Should have features/products content
            if (!content.features && !content.products) {
                logicalErrors.push('MISSING: Either features or products section should exist');
            }
            
            if (content.features) {
                if (!Array.isArray(content.features)) {
                    logicalErrors.push('INVALID: features should be an array');
                } else if (content.features.length === 0) {
                    logicalErrors.push('EMPTY: features array should have content');
                } else {
                    // Check feature structure
                    const hasValidFeatures = content.features.every(feature => 
                        feature.title && feature.description
                    );
                    if (!hasValidFeatures) {
                        logicalErrors.push('INVALID: features should have title and description');
                    }
                }
            }
            
            // 3. Should be shoe store specific (not generic)
            const contentString = JSON.stringify(content).toLowerCase();
            const shoeKeywords = ['shoe', 'footwear', 'sneaker', 'boot', 'sandal', 'heel', 'athletic', 'fashion', 'style', 'retail'];
            const hasShoeContext = shoeKeywords.some(keyword => contentString.includes(keyword));
            if (!hasShoeContext) {
                logicalErrors.push('CONTEXT ERROR: Content should be shoe store specific');
            }
            
            // 4. Should not have template/placeholder content
            const templateIndicators = [
                '[placeholder]', 'lorem ipsum', 'sample company', 'your business', 
                'your store', 'example.com', 'company name', 'insert', 'replace'
            ];
            const foundTemplates = templateIndicators.filter(template => 
                contentString.includes(template)
            );
            if (foundTemplates.length > 0) {
                logicalErrors.push(`TEMPLATE CONTENT: Found placeholders: ${foundTemplates.join(', ')}`);
            }
            
            // 5. Should have company information
            if (!content.companyInfo) {
                logicalErrors.push('MISSING: companyInfo - Should have store details');
            } else {
                if (!content.companyInfo.name) {
                    logicalErrors.push('MISSING: companyInfo.name');
                }
                if (!content.companyInfo.description) {
                    logicalErrors.push('MISSING: companyInfo.description');
                }
            }
            
            // 6. Content should be realistic and detailed
            const textLength = contentString.length;
            if (textLength < 500) {
                logicalErrors.push('CONTENT TOO BRIEF: Generated content seems insufficient for a landing page');
            }
            
            // 7. Should have call-to-action elements
            if (content.hero && content.hero.ctaButtons) {
                if (!Array.isArray(content.hero.ctaButtons) || content.hero.ctaButtons.length === 0) {
                    logicalErrors.push('MISSING CTA: Hero section should have call-to-action buttons');
                }
            }
            
            // 8. Should be industry-appropriate
            const industryTerms = ['quality', 'premium', 'collection', 'discover', 'explore', 'shop'];
            const hasIndustryTerms = industryTerms.some(term => contentString.includes(term));
            if (!hasIndustryTerms) {
                logicalErrors.push('INDUSTRY MISMATCH: Content should use retail/ecommerce terminology');
            }
        }
        
        // PERFORMANCE CHECK
        if (executionTime > 45000) {
            logicalErrors.push(`PERFORMANCE: Execution took ${executionTime}ms (over 45s limit)`);
        }
        
        // FINAL VALIDATION
        if (logicalErrors.length === 0) {
            console.log('✅ ContentAgent PASSED - Generated authentic shoe store content');
            return { success: true, errors: [] };
        } else {
            console.log('❌ ContentAgent FAILED');
            console.log('ERRORS:', logicalErrors);
            return { success: false, errors: logicalErrors };
        }
        
    } catch (error) {
        console.log('❌ ContentAgent FAILED - Runtime Error:', error.message);
        console.log('Stack:', error.stack?.substring(0, 500));
        return { success: false, errors: [`Runtime Error: ${error.message}`] };
    }
}

// Run test if called directly
if (require.main === module) {
    testContentAgent().then(result => {
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = testContentAgent;