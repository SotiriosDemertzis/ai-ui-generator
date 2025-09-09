require('dotenv').config({path: require('path').join(__dirname, '..', '.env')});

// Suppress punycode deprecation warning
process.noDeprecation = true;

// Ensure GROQ_API_KEY is available
if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in environment variables');
    process.exit(1);
}

// Import all agents
const { SpecAgent } = require('../ai/agents/specAgent');
const { DesignAgent } = require('../ai/agents/designAgent');
const { ContentAgent } = require('../ai/agents/contentAgent');
const { LayoutAgent } = require('../ai/agents/layoutAgent');
const { CodeAgent } = require('../ai/agents/codeAgent');
const { TailwindStylistAgent } = require('../ai/agents/tailwindStylistAgent');
const { ValidatorAgent } = require('../ai/agents/validatorAgent');

// Import other agents (note: these use default exports, not named exports)
const DesignImplementationAgent = require('../ai/agents/designImplementationAgent');
const { ImageIntegrationAgent } = require('../ai/agents/imageIntegrationAgent');

async function testAllAgents() {
    console.log('🚀 Starting comprehensive AI agent testing suite...');
    console.log('='.repeat(80));
    
    const testStartTime = Date.now();
    const testResults = {};
    
    // Validate environment
    if (!process.env.GROQ_API_KEY) {
        console.error('❌ Critical: GROQ_API_KEY not found - tests will fail');
        return { success: false, error: 'Missing GROQ_API_KEY' };
    }
    
    // Test 1: SpecAgent (Quick test - already verified working)
    console.log('\n1️⃣  Testing SpecAgent...');
    try {
        const specAgent = new SpecAgent();
        // Use simple prompt to avoid long API call
        const result = await specAgent.generateSpec('Shoe store landing page');
        testResults.SpecAgent = {
            success: result.success,
            hasOutput: !!result.pageSpec,
            error: result.success ? null : 'Failed to generate spec',
            details: result.success ? {
                hasType: !!result.pageSpec?.type,
                hasIndustry: !!result.pageSpec?.industry,
                hasSections: !!result.pageSpec?.sections?.length
            } : null
        };
        console.log(`✅ SpecAgent: ${result.success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
        testResults.SpecAgent = { success: false, error: error.message };
        console.log(`❌ SpecAgent: FAILED - ${error.message}`);
    }
    
    // Test 2: DesignAgent (Quick test - already verified working)
    console.log('\n2️⃣  Testing DesignAgent...');
    try {
        const designAgent = new DesignAgent();
        const mockSpec = {
            type: 'ecommerce',
            industry: 'retail',
            complexity: 5,
            sections: [{ name: 'hero', required: true }],
            name: 'Test Shoe Store',
            requirements: { responsive: true, accessibility: true },
            formFields: []
        };
        const result = await designAgent.generateDesign(mockSpec, {}, { pageSpec: mockSpec });
        testResults.DesignAgent = {
            success: result.success,
            hasOutput: !!result.design,
            error: result.success ? null : 'Failed to generate design'
        };
        console.log(`✅ DesignAgent: ${result.success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
        testResults.DesignAgent = { success: false, error: error.message };
        console.log(`❌ DesignAgent: FAILED - ${error.message}`);
    }
    
    // Test 3: ContentAgent (Quick test - already verified working) 
    console.log('\n3️⃣  Testing ContentAgent...');
    try {
        const contentAgent = new ContentAgent();
        const mockPageSpec = {
            type: 'ecommerce',
            industry: 'retail',
            complexity: 5,
            sections: [
                { name: 'hero', required: true },
                { name: 'features', required: true },
                { name: 'testimonials', required: false }
            ],
            name: 'Test Shoe Store',
            requirements: { responsive: true, accessibility: true },
            formFields: []
        };
        const mockContext = {
            pageSpec: mockPageSpec
        };
        const result = await contentAgent.generateContent(mockPageSpec, {}, mockContext);
        testResults.ContentAgent = {
            success: result.success,
            hasOutput: !!result.content,
            error: result.success ? null : 'Failed to generate content'
        };
        console.log(`✅ ContentAgent: ${result.success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
        testResults.ContentAgent = { success: false, error: error.message };
        console.log(`❌ ContentAgent: FAILED - ${error.message}`);
    }
    
    // Test 4: LayoutAgent
    console.log('\n4️⃣  Testing LayoutAgent...');
    try {
        const layoutAgent = new LayoutAgent();
        const mockPageSpec = {
            type: 'ecommerce',
            industry: 'retail',
            complexity: 5,
            sections: [
                { name: 'hero', required: true },
                { name: 'features', required: true }
            ],
            name: 'Test Shoe Store',
            requirements: { responsive: true, accessibility: true },
            formFields: []
        };
        const mockDesign = { 
            modernVisualSystem: { style: 'contemporary' },
            advancedColorSystem: { primary: '#3B82F6' }
        };
        const mockContent = { 
            hero: { title: 'Test Store', subtitle: 'Quality products' },
            features: [{ title: 'Feature 1', description: 'Description 1' }]
        };
        const mockContext = {
            pageSpec: mockPageSpec,
            design: mockDesign,
            content: mockContent
        };
        const result = await layoutAgent.generateLayout(mockPageSpec, mockDesign, mockContext);
        testResults.LayoutAgent = {
            success: result.success,
            hasOutput: !!result.layout,
            error: result.success ? null : 'Failed to generate layout'
        };
        console.log(`✅ LayoutAgent: ${result.success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
        testResults.LayoutAgent = { success: false, error: error.message };
        console.log(`❌ LayoutAgent: FAILED - ${error.message}`);
    }
    
    // Test 5: CodeAgent (Structure test - may take longer)
    console.log('\n5️⃣  Testing CodeAgent...');
    try {
        const codeAgent = new CodeAgent();
        const mockPageSpec = { 
            type: 'ecommerce', 
            industry: 'retail', 
            complexity: 5,
            sections: [
                { name: 'hero', required: true },
                { name: 'features', required: true }
            ],
            name: 'Premium Shoe Store',
            requirements: { responsive: true, accessibility: true },
            formFields: []
        };
        const mockDesign = { 
            modernVisualSystem: { style: 'contemporary' },
            advancedColorSystem: { primary: '#3B82F6' }
        };
        const mockContent = { 
            hero: { title: 'Premium Shoes', subtitle: 'Quality footwear' },
            features: [{ title: 'Quality Materials', description: 'Handcrafted with premium leather' }],
            companyInfo: { name: 'ShoeStore' }
        };
        const mockLayout = { 
            strategy: 'hero-focused',
            sections: [{ name: 'hero', type: 'hero' }, { name: 'features', type: 'grid' }]
        };
        const mockContext = {
            pageSpec: mockPageSpec,
            design: mockDesign,
            content: mockContent,
            layout: mockLayout
        };
        const result = await codeAgent.generateCode(mockPageSpec, mockDesign, mockContent, mockLayout, mockContext);
        // Debug log for undefined/unknown values
        if (!result || typeof result !== 'object') {
            console.error('❌ [DEBUG] CodeAgent returned undefined or non-object:', result);
        }
        // Debug log for JSON parsing errors
        if (result && result.jsonParseError) {
            console.error('❌ [DEBUG] CodeAgent JSON parsing error:', result.jsonParseError);
        }
        testResults.CodeAgent = {
            success: result.success,
            hasOutput: !!result.reactCode,
            error: result.success ? null : 'Failed to generate code'
        };
        console.log(`✅ CodeAgent: ${result.success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
        testResults.CodeAgent = { success: false, error: error.message };
        console.log(`❌ CodeAgent: FAILED - ${error.message}`);
    }
    
    // Test 6: TailwindStylistAgent
    console.log('\n6️⃣  Testing TailwindStylistAgent...');
    try {
        const stylistAgent = new TailwindStylistAgent();
        const mockCode = '<div className="p-4">Test Component</div>';
        const mockPageSpec = { type: 'ecommerce', industry: 'retail' };
        const mockDesign = { modernVisualSystem: { style: 'contemporary' } };
        const result = await stylistAgent.applyModernStyling(mockCode, mockPageSpec, mockDesign);
        testResults.TailwindStylistAgent = {
            success: result.success,
            hasOutput: !!result.styledComponent,
            error: result.success ? null : 'Failed to enhance styling'
        };
        console.log(`✅ TailwindStylistAgent: ${result.success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
        testResults.TailwindStylistAgent = { success: false, error: error.message };
        console.log(`❌ TailwindStylistAgent: FAILED - ${error.message}`);
    }
    
    // Test 7: ValidatorAgent
    console.log('\n7️⃣  Testing ValidatorAgent...');
    try {
        const validatorAgent = new ValidatorAgent();
        const mockContext = {
            pageSpec: {
                type: 'ecommerce',
                industry: 'retail',
                complexity: 5,
                sections: [{ name: 'hero', required: true }],
                name: 'Test Store'
            },
            code: { 
                reactCode: `<div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <header className="py-12 text-center">
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Test Store</h1>
                            <p className="text-xl text-blue-100">Quality products</p>
                            <button className="mt-8 px-8 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200">
                                Shop Now
                            </button>
                        </header>
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-16">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                                <h3 className="text-xl font-semibold text-white mb-2">Quality Products</h3>
                                <p className="text-blue-100">Premium quality items</p>
                            </div>
                        </section>
                    </div>
                </div>`,
                componentName: 'TestComponent'
            },
            design: { 
                modernVisualSystem: { style: 'contemporary' },
                advancedColorSystem: { primary: '#3B82F6' }
            },
            content: { 
                hero: { title: 'Test Store', subtitle: 'Quality products' },
                companyInfo: { name: 'TestStore' }
            }
        };
        const result = await validatorAgent.validateGeneration(mockContext);
        // Debug log for validation failures
        if (!result || typeof result !== 'object' || !result.success) {
            console.error('❌ [DEBUG] ValidatorAgent validation failed or returned invalid result:', result);
        }
        testResults.ValidatorAgent = {
            success: result.success,
            hasOutput: !!result.validation,
            error: result.success ? null : 'Failed to validate'
        };
        console.log(`✅ ValidatorAgent: ${result.success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
        testResults.ValidatorAgent = { success: false, error: error.message };
        console.log(`❌ ValidatorAgent: FAILED - ${error.message}`);
    }
    
    // Test 8: DesignImplementationAgent 
    console.log('\n8️⃣  Testing DesignImplementationAgent...');
    try {
        const designImplAgent = new DesignImplementationAgent();
        const mockDesign = { modernVisualSystem: { style: 'contemporary' } };
        const mockPageSpec = { type: 'ecommerce', industry: 'retail' };
        const result = await designImplAgent.translateDesignToTailwind(mockDesign, mockPageSpec);
        // Debug log for undefined/unknown values
        if (!result || typeof result !== 'object') {
            console.error('❌ [DEBUG] DesignImplementationAgent returned undefined or non-object:', result);
        }
        testResults.DesignImplementationAgent = {
            success: !!result,
            hasOutput: !!result,
            error: !!result ? null : 'Failed to implement design'
        };
        console.log(`✅ DesignImplementationAgent: ${!!result ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
        testResults.DesignImplementationAgent = { success: false, error: error.message };
        console.log(`❌ DesignImplementationAgent: FAILED - ${error.message}`);
    }
    
    // Test 9: ImageIntegrationAgent 
    console.log('\n9️⃣  Testing ImageIntegrationAgent...');
    try {
        const imageAgent = new ImageIntegrationAgent();
        const mockCode = '<div>Test Component</div>';
        const mockPageSpec = { industry: 'retail' };
        const mockContent = { hero: { title: 'Test Store' } };
        const result = await imageAgent.integrateImages(mockCode, mockPageSpec, mockContent);
        // Debug log for undefined/unknown values
        if (!result || typeof result !== 'string') {
            console.error('❌ [DEBUG] ImageIntegrationAgent returned undefined or non-string:', result);
        }
        testResults.ImageIntegrationAgent = {
            success: typeof result === 'string' && result.length > 0,
            hasOutput: typeof result === 'string' && result.length > 0,
            error: (typeof result === 'string' && result.length > 0) ? null : 'Failed to integrate images'
        };
        console.log(`✅ ImageIntegrationAgent: ${(typeof result === 'string' && result.length > 0) ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
        testResults.ImageIntegrationAgent = { success: false, error: error.message };
        console.log(`❌ ImageIntegrationAgent: FAILED - ${error.message}`);
    }
        
    // Calculate summary stats
    const agents = Object.keys(testResults);
    const passedAgents = agents.filter(agent => testResults[agent].success);
    const failedAgents = agents.filter(agent => !testResults[agent].success);
    const totalTime = Date.now() - testStartTime;

    // Print comprehensive summary
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Agents: ${agents.length}`);
    console.log(`Passed: ${passedAgents.length}`);
    console.log(`Failed: ${failedAgents.length}`);
    console.log(`Success Rate: ${Math.round((passedAgents.length / agents.length) * 100)}%`);
    console.log(`Total Execution Time: ${totalTime}ms`);
    
    if (failedAgents.length > 0) {
        console.log('\n❌ FAILED AGENTS:');
        failedAgents.forEach(agent => {
            console.log(`  - ${agent}: ${testResults[agent].error}`);
        });
    }
    
    if (passedAgents.length > 0) {
        console.log('\n✅ PASSED AGENTS:');
        passedAgents.forEach(agent => {
            console.log(`  - ${agent}`);
        });
    }

    // Additional analysis for detecting systematic issues
    const coreAgentsFailed = ['SpecAgent', 'DesignAgent', 'ContentAgent', 'CodeAgent', 'ValidatorAgent']
        .filter(agent => failedAgents.includes(agent));
    
    if (coreAgentsFailed.length > 0) {
        console.log('\n🚨 CRITICAL: Core agents failed:', coreAgentsFailed.join(', '));
    }
    
    // Check for common failure patterns
    const apiErrors = failedAgents.filter(agent => 
        testResults[agent].error?.includes('API') || 
        testResults[agent].error?.includes('network') ||
        testResults[agent].error?.includes('timeout')
    );
    
    if (apiErrors.length > 0) {
        console.log('🌐 API-related failures detected:', apiErrors.join(', '));
    }

    return {
        success: passedAgents.length >= 7, // Increased threshold - at least 7 agents should work
        results: testResults,
        summary: {
            totalAgents: agents.length,
            passedAgents: passedAgents.length,
            failedAgents: failedAgents.length,
            successRate: Math.round((passedAgents.length / agents.length) * 100),
            executionTime: totalTime,
            coreAgentsFailed: coreAgentsFailed.length,
            apiErrors: apiErrors.length
        }
    };
}

// Run test if called directly
if (require.main === module) {
    testAllAgents().then(result => {
        process.exit(result.success ? 0 : 1);
    }).catch(error => {
        console.error('💥 Testing suite crashed:', error.message);
        process.exit(1);
    });
}

module.exports = testAllAgents;