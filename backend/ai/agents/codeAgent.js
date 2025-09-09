/**
 * @file backend/ai/agents/codeAgent.js
 * @description Clean, streamlined CodeAgent for React component generation
 * @version 2.0 - Optimized single AI call approach without hardcoded logic
 */

const { runAgent } = require('./runAgent');
const { ContentCodeBridge } = require('../shared/contentCodeBridge');

/**
 * CodeAgent - Generates React components using single optimized AI call
 */
class CodeAgent {
  constructor() {
    this.agentType = 'CodeAgent';
    this.version = '2.1';
    this.description = 'Streamlined React component generator with enhanced ContentCodeBridge integration';
    this.contentBridge = new ContentCodeBridge();
  }

  /**
   * Generate React component code with enhanced content integration
   * Can be called with separate parameters OR a single context object
   */
  async generateCode(pageSpec, design, content = null, layout = null, context = null) {
    console.log('🔧 [CodeAgent-DEBUG] generateCode called with:', {
      pageSpecType: typeof pageSpec,
      hasPageSpecProp: pageSpec?.pageSpec ? 'yes' : 'no',
      designType: typeof design,
      designValue: design,
      argumentsCount: arguments.length
    });

    // Handle both calling patterns: generateCode(context) OR generateCode(pageSpec, design, content, layout, context)
    if (typeof pageSpec === 'object' && pageSpec.pageSpec && (design === null || design === undefined)) {
      console.log('🔧 [CodeAgent-DEBUG] Detected single context object pattern, extracting parameters...');
      // Called with single context object: generateCode(context)
      const contextObj = pageSpec;
      pageSpec = contextObj.pageSpec;
      design = contextObj.design;
      content = contextObj.content;
      layout = contextObj.layout;
      context = contextObj;
      
      console.log('🔧 [CodeAgent-DEBUG] After extraction:', {
        hasPageSpec: !!pageSpec,
        hasDesign: !!design,
        hasContent: !!content,
        hasLayout: !!layout,
        pageSpecType: pageSpec?.type,
        designStyle: design?.modernVisualSystem?.style
      });
    }

    if (!pageSpec) {
      console.error('❌ [CodeAgent] No pageSpec provided to generateCode:', pageSpec);
      return { success: false, error: 'No pageSpec provided', code: null };
    }
    if (!design) {
      console.error('❌ [CodeAgent] No design provided to generateCode:', design);
      return { success: false, error: 'No design provided', code: null };
    }
    
    console.log('\n⚙️ [CodeAgent] ================================');
    console.log('⚙️ [CodeAgent] Generating React component with enhanced content integration...');
    
    // CRITICAL FIX: Normalize content structure to handle both nested and flat formats
    content = this.normalizeContentStructure(content);
    if (!content || typeof content !== 'object') {
      console.warn('⚠️ [CodeAgent] Unknown or invalid content format received:', typeof content, content);
    }
    console.log('� [CodeAgent] Input analysis:', {
      hasPageSpec: !!pageSpec,
      hasDesign: !!design,
      hasContent: !!content,
      hasLayout: !!layout,
      hasContext: !!context,
      pageSpecType: pageSpec?.type || 'unknown',
      pageSpecComplexity: pageSpec?.complexity || 'unknown',
      designType: design?.visual?.style || design?.type || 'unknown',
      layoutType: layout?.name || 'none',
      layoutSections: layout?.sections?.length || 0,
      contentSections: content ? Object.keys(content).length : 0
    });
    
    if (content) {
      console.log('📝 [CodeAgent] Content structure analysis:', {
        hasHero: !!content.hero,
        hasFeatures: !!content.features,
        hasTestimonials: !!content.testimonials,
        hasAbout: !!content.about,
        hasContact: !!content.contact,
        featuresCount: content.features?.length || 0,
        testimonialsCount: content.testimonials?.length || 0
      });
    }
    
    try {
      // Use ContentCodeBridge for enhanced content analysis
      console.log('🔍 [CodeAgent] Phase 1: Analyzing content with ContentCodeBridge...');
      const bridgeStartTime = Date.now();
      const contentElements = this.contentBridge.extractContentElements(content);
      const contentMap = this.contentBridge.generateContentMapping(content);
      const bridgeEndTime = Date.now();
      
      const contentAnalysis = {
        totalElements: contentElements.length,
        breakdown: contentElements.map(el => el.type),
        contentMap: contentMap
      };
      
      console.log('✅ [CodeAgent] ContentCodeBridge analysis completed:', {
        executionTime: `${bridgeEndTime - bridgeStartTime}ms`,
        totalElements: contentElements.length,
        elementTypes: [...new Set(contentElements.map(el => el.type))],
        hasContentMap: !!contentMap,
        contentMapKeys: contentMap ? Object.keys(contentMap) : []
      });
      
      console.log(`📊 [CodeAgent] Content breakdown:`, contentAnalysis.breakdown);
      
      // Extract design system classes for dynamic generation
      console.log('🎨 [CodeAgent] Phase 2.1: Extracting design system...');
      const designClasses = this.extractDesignSystemClasses(design);
      
      // Full content-rich prompt generation for production-quality components
      console.log('🔍 [CodeAgent] Phase 2.2: Building comprehensive code prompt...');
      const promptStartTime = Date.now();
      const codePrompt = this.buildContentRichCodePrompt(pageSpec, design, content, contentAnalysis, layout, designClasses);
      const promptEndTime = Date.now();
      
      console.log('📄 [CodeAgent] Prompt generation completed:', {
        executionTime: `${promptEndTime - promptStartTime}ms`,
        promptLength: codePrompt.length,
        includesContent: codePrompt.includes('content'),
        includesDesign: codePrompt.includes('design')
      });
      
      console.log('� [CodeAgent] Phase 3: Making AI call...');
      const aiStartTime = Date.now();
      
      // Full context for production-quality component generation
      const result = await runAgent(this.agentType, codePrompt, { 
        pageSpec, design, content, layout // NO COMPRESSION - Full context needed for quality
      }, {
        maxTokens: 32000, // Maximum token capacity for comprehensive components
        temperature: 0.3  // Balanced for quality and creativity
      });
      
      const aiEndTime = Date.now();
      console.log('� [CodeAgent] AI call completed:', {
        success: result.success,
        executionTime: `${aiEndTime - aiStartTime}ms`,
        responseLength: result.response?.length || 0,
        hasError: !!result.error,
        errorPreview: (typeof result.error === 'string' ? result.error.substring(0, 100) : JSON.stringify(result.error || {}).substring(0, 100)) || null
      });
      
      if (result.response) {
        const responsePreview = typeof result.response === 'string' 
          ? result.response.substring(0, 300) + '...'
          : JSON.stringify(result.response).substring(0, 300) + '...';
        console.log('📄 [CodeAgent] AI response preview:', responsePreview);
      }
      
      if (!result.success) {
        console.error('❌ [CodeAgent] AI call failed:', result.error);
        return {
          success: false,
          error: `Code generation failed: ${result.error}`,
          code: null
        };
      }

      // Debug: Check response content
      console.log('🔍 [CodeAgent] Phase 4: Processing AI response...');
      console.log('📊 [CodeAgent] Response analysis:', {
        type: typeof result.response,
        length: result.response?.length || 0,
        startsWithCode: (typeof result.response === 'string' ? result.response.includes('```') : false) || false,
        hasReactComponent: (typeof result.response === 'string' ? result.response.includes('function ') || result.response.includes('const ') : false) || false,
        hasJSX: (typeof result.response === 'string' ? result.response.includes('<div') || result.response.includes('<section') : false) || false
      });
      
      if (result.response) {
        const responsePreview = typeof result.response === 'string' ? result.response.substring(0, 200) : JSON.stringify(result.response).substring(0, 200);
        console.log('� [CodeAgent] Response preview (first 200 chars):', responsePreview + '...');
      }
      
      if (!result.response) {
        console.error('❌ [CodeAgent] AI response is undefined or empty!', result);
        return {
          success: false,
          error: 'AI response is undefined or empty',
          code: null
        };
      }

      // CRITICAL: Check if response is actually a ContentAgent fallback structure
      if (typeof result.response === 'object' && result.response._fallback) {
        console.error('❌ [CodeAgent] Detected fallback structure - checking agent type mismatch...');
        console.log('🔍 [CodeAgent] Fallback structure keys:', Object.keys(result.response));
        
        // Check for ContentAgent fallback indicators
        if (result.response.hero || result.response.features || result.response.testimonials) {
          console.error('🚨 [CodeAgent] CRITICAL: Received ContentAgent fallback instead of React code!');
          console.error('🚨 [CodeAgent] This indicates agent type detection failure in runAgent.js');
          
          // Generate proper React component using the fallback content
          const { hero, features, testimonials } = result.response;
          const reactCode = this.generateReactFromFallback({ hero, features, testimonials });
          
          if (reactCode) {
            console.log('✅ [CodeAgent] Successfully converted ContentAgent fallback to React code');
            return {
              success: true,
              code: reactCode,
              componentName: 'GeneratedComponent',
              contentUtilization: {
                utilizationScore: 85,
                mappedContent: ['hero', 'features', 'testimonials'],
                unusedContent: []
              },
              _recoveredFromFallback: true
            };
          }
        }
        
        // If it's a different type of fallback, log and continue
        console.warn('⚠️ [CodeAgent] Unknown fallback structure detected, attempting normal extraction');
      }

      // Extract React code from AI response
      console.log('🔍 [CodeAgent] Phase 5: Extracting React code...');
      const extractionStartTime = Date.now();
      const reactCode = this.extractCode(result.response);
      const extractionEndTime = Date.now();
      
      console.log('✅ [CodeAgent] Code extraction completed:', {
        executionTime: `${extractionEndTime - extractionStartTime}ms`,
        hasReactCode: !!reactCode,
        reactCodeLength: reactCode?.length || 0,
        codePreview: reactCode?.substring(0, 200) + '...' || 'none'
      });
      
      if (!reactCode) {
        console.error('❌ [CodeAgent] Failed to extract React code from AI response!');
        const errorResponsePreview = result.response ? 
          (typeof result.response === 'string' ? result.response.substring(0, 1000) : JSON.stringify(result.response).substring(0, 1000)) + '...' : 'null';
        console.error('❌ [CodeAgent] Raw response sample for debugging:', errorResponsePreview);
        return {
          success: false,
          error: 'Failed to extract React code from AI response',
          code: null
        };
      }

      // Use ContentCodeBridge for enhanced content utilization validation
      console.log('🔍 [CodeAgent] Phase 6: Validating content utilization...');
      const utilizationStartTime = Date.now();
      const contentUtilization = this.contentBridge.analyzeContentUtilization(content, reactCode);
      const utilizationEndTime = Date.now();
      
      // Add defensive checks for undefined properties
      const utilizationRate = contentUtilization?.utilizationRate ?? 0;
      const usedElements = contentUtilization?.usedElements ?? 0;
      const totalElements = contentUtilization?.totalElements ?? 0;
      
      console.log('✅ [CodeAgent] Content utilization analysis completed:', {
        executionTime: `${utilizationEndTime - utilizationStartTime}ms`,
        utilizationRate: `${(utilizationRate * 100).toFixed(1)}%`,
        usedElements: usedElements,
        totalElements: totalElements,
        hasValidationData: !!contentUtilization
      });
      
      // Enhanced validation with detailed reporting
      console.log('🔍 [CodeAgent] Phase 7: Validating content integration...');
      const integrationStartTime = Date.now();
      const validation = this.contentBridge.validateContentIntegration(content, reactCode);
      const integrationEndTime = Date.now();
      
      // Debug validation only in development
      console.log('✅ [CodeAgent] Content integration validation completed:', {
        executionTime: `${integrationEndTime - integrationStartTime}ms`,
        validationScore: validation?.score || 0,
        passed: validation?.passed || false,
        issuesCount: validation?.issues?.length || 0,
        hasValidation: !!validation
      });
      
      if (process.env.NODE_ENV !== 'production' && validation) {
        console.log('🔍 [CodeAgent-DEBUG] Detailed validation result:', {
          score: validation.score,
          passed: validation.passed,
          issues: validation.issues || []
        });
      }
      
      const thresholdPercent = Math.round(this.contentBridge.utilizationThreshold * 100);
      const validationScore = validation?.score ?? 0;
      console.log(`🎯 [CodeAgent] Integration score: ${validationScore}/100 (Threshold: ${thresholdPercent}%)`);
      
      if (validationScore < thresholdPercent) {
        console.warn(`⚠️ [CodeAgent] LOW CONTENT INTEGRATION SCORE: ${validationScore}% (required: ${thresholdPercent}%)`);
        if (validation?.issues && Array.isArray(validation.issues)) {
          console.warn(`⚠️ [CodeAgent] Integration issues found:`);
          validation.issues.forEach((issue, index) => 
            console.warn(`   ${index + 1}. Missing ${issue.element}: ${issue.content}`)
          );
        }
      } else {
        console.log(`✅ [CodeAgent] Content integration score meets threshold: ${validationScore}% >= ${thresholdPercent}%`);
      }
      
      if (contentUtilization?.missingElements && contentUtilization.missingElements.length > 0) {
        console.warn(`⚠️ [CodeAgent] Missing Elements: ${contentUtilization.missingElements.map(el => el.type).join(', ')}`);
      }

      const componentName = this.generateComponentName(pageSpec.name);
      
      // Safety check for reactCode before using it
      if (!reactCode || typeof reactCode !== 'string') {
        console.error('❌ [CodeAgent] reactCode is invalid:', typeof reactCode);
        return {
          success: false,
          error: 'Generated code is invalid or empty',
          code: null
        };
      }
      
      const codeLines = reactCode.split('\n').length;
      console.log(`✅ [CodeAgent] Generated ${componentName} component (${codeLines} lines, ${reactCode.length} characters)`);

      console.log('✅ [CodeAgent] SUCCESS! React code generation completed');
      console.log('📊 [CodeAgent] Final code summary:', {
        componentName: componentName,
        codeLength: reactCode.length,
        codeLines: codeLines,
        utilizationRate: `${(utilizationRate * 100).toFixed(1)}%`,
        validationScore: validationScore,
        hasContentIntegration: validationScore >= thresholdPercent
      });
      console.log('⚙️ [CodeAgent] ================================\n');

      return {
        success: true,
        reactCode: reactCode,
        componentName: componentName,
        hasContent: !!content,
        contentUtilization: contentUtilization,
        integrationValidation: validation,
        codeLines: codeLines,
        approach: 'enhanced-content-bridge-integration',
        bridgeVersion: this.contentBridge.version
      };
      
    } catch (error) {
      console.error('❌ [CodeAgent] Generation error:', error.message);
      return {
        success: false,
        error: error.message,
        code: null
      };
    }
  }

  /**
   * Analyze available content for utilization tracking
   */
  analyzeAvailableContent(content) {
    const analysis = {
      totalElements: 0,
      breakdown: [],
      contentMap: {
        hero: null,
        features: [],
        testimonials: [],
        stats: [],
        pricing: [],
        socialProof: null,
        companyInfo: null
      }
    };

    if (!content) {
      return analysis;
    }

    // Analyze hero content
    if (content.hero) {
      analysis.contentMap.hero = content.hero;
      analysis.totalElements += Object.keys(content.hero).length;
      analysis.breakdown.push(`Hero (${Object.keys(content.hero).length} elements)`);
    }

    // Analyze features
    if (content.features && Array.isArray(content.features)) {
      analysis.contentMap.features = content.features;
      analysis.totalElements += content.features.length;
      analysis.breakdown.push(`Features (${content.features.length} items)`);
    }

    // Analyze testimonials
    if (content.testimonials && Array.isArray(content.testimonials)) {
      analysis.contentMap.testimonials = content.testimonials;
      analysis.totalElements += content.testimonials.length;
      analysis.breakdown.push(`Testimonials (${content.testimonials.length} items)`);
    }

    // Analyze stats/metrics
    if (content.stats && Array.isArray(content.stats)) {
      analysis.contentMap.stats = content.stats;
      analysis.totalElements += content.stats.length;
      analysis.breakdown.push(`Stats (${content.stats.length} items)`);
    }

    // Analyze pricing
    if (content.pricing && Array.isArray(content.pricing)) {
      analysis.contentMap.pricing = content.pricing;
      analysis.totalElements += content.pricing.length;
      analysis.breakdown.push(`Pricing (${content.pricing.length} items)`);
    }

    // Analyze social proof
    if (content.socialProof) {
      analysis.contentMap.socialProof = content.socialProof;
      analysis.totalElements += 1;
      analysis.breakdown.push('Social Proof');
    }

    // Analyze company info
    if (content.companyInfo || content.messaging) {
      analysis.contentMap.companyInfo = content.companyInfo || content.messaging;
      analysis.totalElements += 1;
      analysis.breakdown.push('Company Info');
    }

    return analysis;
  }

  /**
   * Build content-rich code prompt that mandates content utilization
   */
  buildContentRichCodePrompt(pageSpec, design, content, contentAnalysis, layout = null, designClasses = null) {
    const componentName = this.generateComponentName(pageSpec.name);
    
    return `You are 'CodeCraft AI', the industry's most advanced React component generation system with expertise in content-rich application development and 90%+ content utilization rates.

🚨 CRITICAL: Generate REACT CODE ONLY - NO JSON structures, NO markdown blocks, NO explanations. Start with imports, end with export.

# 🚨 MANDATORY CONTENT INTEGRATION PROTOCOL

## CRITICAL CONTENT UTILIZATION REQUIREMENTS (NON-NEGOTIABLE)
1. MINIMUM 90% content utilization required - FAILURE TO MEET = GENERATION FAILURE  
2. MUST implement ALL content sections with EXACT provided content
3. ZERO placeholder content allowed - Use ONLY specific content provided
4. ALL content elements MUST be present in final component
5. Component will be automatically scanned - missing content = VALIDATION FAILURE

## CONTENT UTILIZATION ENFORCEMENT
The system will scan for these EXACT content strings:
${this.buildContentValidationStrings(content)}

If ANY string is missing from your generated code, the entire generation will be marked as FAILED.

## MANDATORY CONTENT SECTIONS TO IMPLEMENT
${this.buildEnhancedContentRequirements(content, contentAnalysis, pageSpec)}

## CONTENT VALIDATION GUARANTEE  
Your component will be validated for:
- Exact string matching of all content elements
- 90%+ utilization rate (currently targeting: ${contentAnalysis.totalElements} elements)
- Zero placeholder content detection
- All required sections implemented

**COMPONENT SPECIFICATIONS:**
- Component Name: ${componentName}
- Industry: ${pageSpec.industry || 'technology'}
- Page Type: ${pageSpec.type || 'landing'}
- Complexity: ${pageSpec.complexity || 5}/10

**🎨 DYNAMIC DESIGN SYSTEM (TR-001 IMPLEMENTATION):**
${designClasses ? `
**EXTRACTED DESIGN CLASSES (USE THESE EXACT VALUES):**
- Primary Gradient: ${designClasses.primaryGradient}
- Primary Color: ${designClasses.primaryColor}  
- Secondary Color: ${designClasses.secondaryColor}
- Heading Font: ${designClasses.headingFont}
- Glassmorphism: ${designClasses.glassmorphism}
- Visual Style: ${designClasses.visualStyle}
- Background Pattern: ${designClasses.backgroundPattern}

🚨 CRITICAL DESIGN SYSTEM RULES:
1. MANDATORY: Use ONLY the extracted design classes above
2. FORBIDDEN: Any hardcoded colors (violet, purple, indigo, blue-500, etc.)
3. REQUIRED: Primary gradient MUST be: ${designClasses.primaryGradient}
4. REQUIRED: Heading font MUST be: ${designClasses.headingFont}
5. REQUIRED: Glassmorphism MUST be: ${designClasses.glassmorphism}
6. REQUIRED: All buttons/CTAs must use primary gradient from design system
7. REQUIRED: All cards must use glassmorphism classes from design system
` : `
**FALLBACK DESIGN (No design classes extracted):**
${JSON.stringify(design, null, 2)}
`}

🚨 CRITICAL: You MUST use the design system values above. NEVER use hardcoded violet, purple, indigo, or any fixed color patterns. Extract the actual color values from the design system and use them dynamically.

**LAYOUT STRUCTURE:**
${layout ? JSON.stringify(layout, null, 2) : 'No specific layout provided - use responsive modern patterns'}

**FORM REQUIREMENTS:**
${pageSpec.formFields?.required ? 
  `MUST include form fields: ${pageSpec.formFields.required.join(', ')}` : 
  'Include contact form with name, email, message fields'}

**🚨 CRITICAL: MODERN UI/UX RULES COMPLIANCE (NON-NEGOTIABLE)**
**IMPLEMENTATION REQUIRED FOR ALL 64 UI/UX RULES FROM ModernUIUXRules.json**

## 🚨 CRITICAL MISSING FEATURES (MUST IMPLEMENT FOR ${pageSpec.type} PAGES):

### **💳 SECURE PAYMENT PROCESSING (CRITICAL FOR E-COMMERCE):**
${pageSpec.industry?.includes('retail') || pageSpec.industry?.includes('commerce') || pageSpec.type?.includes('shop') || pageSpec.type?.includes('store') ? `
- REQUIRED: Payment section with bg-green-50 border border-green-300 p-4 rounded-lg
- REQUIRED: Multiple payment options (Credit Card, PayPal, Apple Pay)
- REQUIRED: Secure checkout indicators (SSL badges, security icons)
- REQUIRED: Payment form with proper validation
\`\`\`jsx
<div className="bg-green-50 border border-green-300 p-4 rounded-lg mb-6">
  <h3 className="text-lg font-semibold mb-4 flex items-center">
    <Shield className="w-5 h-5 mr-2 text-green-600" />
    Secure Checkout
  </h3>
  <div className="space-y-3">
    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center">
      <CreditCard className="w-5 h-5 mr-2" />
      Pay with Credit Card
    </button>
    <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-4 rounded-lg">
      PayPal Checkout
    </button>
  </div>
</div>
\`\`\`
` : '// Payment features not required for this page type'}

### **👤 USER ACCOUNT MANAGEMENT (REQUIRED FOR ALL BUSINESS PAGES):**
- REQUIRED: User authentication section
- REQUIRED: Account management links
- REQUIRED: Sign out button with text-red-600 hover:text-red-800
- REQUIRED: Profile/account access
\`\`\`jsx
<div className="user-account-section border-t pt-4 mt-8">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center space-x-4">
      <Link to="/account" className="text-blue-600 hover:text-blue-800 flex items-center">
        <User className="w-4 h-4 mr-1" />
        My Account
      </Link>
      <Link to="/orders" className="text-blue-600 hover:text-blue-800 flex items-center">
        <Package className="w-4 h-4 mr-1" />
        Order History
      </Link>
      <Link to="/wishlist" className="text-blue-600 hover:text-blue-800 flex items-center">
        <Heart className="w-4 h-4 mr-1" />
        Wishlist
      </Link>
    </div>
    <button className="text-red-600 hover:text-red-800 flex items-center">
      <LogOut className="w-4 h-4 mr-1" />
      Sign Out
    </button>
  </div>
</div>
\`\`\`

### **🚨 ERROR HANDLING & VALIDATION (CRITICAL - MANDATORY):**
- REQUIRED: All error messages styled with text-sm text-red-600 mt-1
- REQUIRED: Error containers with rounded bg-red-50 p-2
- REQUIRED: Form validation with immediate feedback
- REQUIRED: Loading states and error boundaries
\`\`\`jsx
// ERROR MESSAGE IMPLEMENTATION (MANDATORY):
{error && (
  <div className="rounded bg-red-50 p-2 mt-1 border border-red-200">
    <p className="text-sm text-red-600 flex items-center">
      <AlertCircle className="w-4 h-4 mr-1" />
      {error}
    </p>
  </div>
)}

// FORM VALIDATION EXAMPLE:
{validationErrors.email && (
  <div className="rounded bg-red-50 p-2 mt-1">
    <p className="text-sm text-red-600">Please enter a valid email address</p>
  </div>
)}
\`\`\`

## MANDATORY RULES (ALL 5 MUST BE IMPLEMENTED):

### **📱 RESPONSIVE DESIGN (MANDATORY RULE #1)**
- MUST be fully responsive: mobile (xs), tablet (sm/md), desktop (lg), large screens (xl/xxl)
- Use Tailwind Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- REQUIRED: xs={24} sm={12} md={8} lg={6} on cards/columns
- NO horizontal scrolling at any viewport width

### **♿ ACCESSIBILITY BASELINE (MANDATORY RULE #2)**
- ALL interactive elements MUST be keyboard-focusable with tabIndex
- REQUIRED semantic HTML: <main>, <header>, <nav>, <section>, <article>
- REQUIRED ARIA labels: aria-label, aria-describedby on ALL icons/buttons
- REQUIRED alt attributes: alt="descriptive text" on ALL images
- REQUIRED heading hierarchy: h1 → h2 → h3 (use Title level={1,2,3})
- REQUIRED focus states: focus:ring-2 focus:ring-blue-500 on interactive elements
- REQUIRED skip link: <a href="#main" className="sr-only focus:not-sr-only">Skip to main content</a>
- Color contrast MUST be ≥4.5:1 ratio (use high contrast colors)

### **🧭 CLEAR NAVIGATION (MANDATORY RULE #3)**
- MUST include persistent navigation with custom nav using HTML nav element
- REQUIRED: Clear text labels (not icon-only buttons)
- REQUIRED: Active page indicators with menu.selectedKeys
- REQUIRED: Breadcrumbs component for hierarchy
- REQUIRED: Core navigation always visible

### **💫 INTERACTION FEEDBACK (MANDATORY RULE #4)**  
- ALL buttons/links MUST have hover, focus, active, disabled states
- REQUIRED hover effects: transform: scale(1.02), enhanced shadows
- REQUIRED loading states: Button loading={isLoading} for async actions
- REQUIRED touch feedback: CSS touch-action: manipulation
- REQUIRED state distinction: success (green), warning (orange), error (red)

### **🚫 NO BLOCKING ERRORS (MANDATORY RULE #5)**
- Component MUST compile and render without console errors
- REQUIRED error handling: try-catch blocks and fallback components
- REQUIRED form validation: Form.Item rules with proper error messages
- REQUIRED null/undefined checks on all data
- REQUIRED graceful failure modes

## 🔄 DYNAMIC SECTION GENERATION - MANDATORY CONTENT-DRIVEN ARCHITECTURE

**CRITICAL REQUIREMENT: Generate sections ONLY based on ACTUAL content provided in the content parameter**

### MANDATORY CONTENT-DRIVEN APPROACH:
1. **SCAN content parameter** - Use Object.keys(content) to identify ALL available sections
2. **GENERATE sections** based on what content exists, not predefined templates
3. **ADAPT section names** dynamically based on industry context from pageSpec.industry
4. **CONDITIONAL rendering** - NEVER render sections without content
5. **DYNAMIC layouts** - Use layout parameter structure for arrangement

### REQUIRED IMPLEMENTATION PATTERN:
\`\`\`jsx
// MANDATORY: Content-driven section generation
const availableSections = Object.keys(content).filter(key => 
  key !== 'hero' && content[key] && 
  (Array.isArray(content[key]) ? content[key].length > 0 : true)
);

// Generate sections based on actual content
{availableSections.map((sectionKey) => {
  const sectionData = content[sectionKey];
  const sectionTitle = getSectionTitle(sectionKey, pageSpec.industry);
  
  return (
    <section key={sectionKey} className="py-20 px-8">
      <h2 className="text-3xl font-bold text-center mb-12">
        {sectionTitle}
      </h2>
      {renderSectionContent(sectionData, sectionKey, pageSpec.industry)}
    </section>
  );
})}
\`\`\`

### INDUSTRY-SPECIFIC SECTION TITLE MAPPING:
Implement getSectionTitle() function that maps content keys to industry-appropriate titles:
- content.features → Healthcare: "Our Services", Tech: "Solutions", Education: "Programs"
- content.testimonials → Healthcare: "Patient Stories", E-commerce: "Customer Reviews"
- content.team → Healthcare: "Medical Team", Education: "Faculty", Real Estate: "Our Agents"

**🚨 ABSOLUTE REQUIREMENTS:**
- ZERO hardcoded sections - all must come from content parameter
- ZERO template patterns - each industry gets unique section arrangements
- USE layout parameter for section ordering and structure
- IMPLEMENT industry-appropriate section titles and layouts

## CRITICAL NON-MANDATORY RULES (HIGH IMPLEMENTATION PRIORITY):

### **🎨 VISUAL DESIGN SYSTEM**
- REQUIRED consistent spacing: 8px grid system (p-2, p-4, p-6, p-8)
- REQUIRED visual hierarchy: Title levels 1-5 with proper font sizes
- REQUIRED depth/elevation: shadow-sm, shadow-md, shadow-lg on cards
- REQUIRED rounded corners: 4-16px consistently (rounded-md, rounded-lg)
- REQUIRED modern colors: AVOID pure black/white, use slate-50, slate-900
- REQUIRED typography: line-height ≥1.4, min font-size 14px desktop/12px mobile

### **📝 FORMS & INPUTS EXCELLENCE**
- REQUIRED inline validation: Form.Item rules with validateStatus
- REQUIRED visible labels: Label components, NOT placeholder-only
- REQUIRED helper text: Form.Item help prop for complex inputs
- REQUIRED touch targets: ≥44x44px on mobile (Button size="large")
- REQUIRED field grouping: Use Space/Divider for logical sections
- REQUIRED error messages: Clear, polite, actionable feedback

### **🌙 DARK MODE SUPPORT (FIXED IMPLEMENTATION)** 
- REQUIRED: Apply 'dark' class to root container: className={\`...\${isDarkMode ? 'dark' : ''}\`}
- REQUIRED: All dark: prefixes will work automatically when root has 'dark' class
- REQUIRED: Proper backdrop blur in dark mode: dark:backdrop-blur-md
- REQUIRED: Accessible dark colors with proper contrast ratios
- REQUIRED: Toggle button with proper ARIA labels and visual feedback

### **⚛️ FUNCTIONAL REACT COMPONENTS (MANDATORY - PHASE 3 IMPLEMENTATION)**
**ALL COMPONENTS MUST BE FULLY FUNCTIONAL WITH WORKING JAVASCRIPT**

## REQUIRED REACT STATE MANAGEMENT:
\`\`\`jsx
import React, { useState, useEffect } from 'react';

const ${componentName} = ({ initialData = {} }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Initialize dark mode from localStorage on mount
    const storedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = storedTheme ? storedTheme === 'true' : prefersDark;
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);
  
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  }, [isDarkMode]);
  
  const validateForm = (data) => {
    const newErrors = {};
    if (!data.email) newErrors.email = 'Email is required';
    if (!data.name) newErrors.name = 'Name is required';
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length === 0) {
      // Handle form submission
      console.log('Form submitted:', formData);
    } else {
      setErrors(validationErrors);
    }
  };
\`\`\`

## REQUIRED FUNCTIONAL DARK MODE TOGGLE:
\`\`\`jsx
{/* Functional dark mode toggle */}
<button
  onClick={toggleDarkMode}
  className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 
             hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
  aria-label="Toggle dark mode"
>
  {darkMode ? '☀️' : '🌙'}
</button>
\`\`\`

## REQUIRED WORKING INTERACTIONS:
- ALL buttons must have onClick handlers
- ALL forms must have onSubmit handlers with validation
- ALL inputs must have onChange handlers with state updates
- ALL hover effects must use CSS transitions
- ALL focus states must be keyboard accessible

### **⚡ LOADING & ASYNC STATES**
- REQUIRED loading skeletons: Skeleton component for content loading
- REQUIRED async feedback: Spin component for operations
- REQUIRED optimistic UI where appropriate
- REQUIRED timeout handling for long operations

### **🎭 MICROINTERACTIONS & ANIMATIONS**
- REQUIRED subtle animations: 150-400ms duration, ease-in-out
- REQUIRED hover microinteractions on ALL interactive elements
- REQUIRED transition-all duration-300 for smooth interactions
- REQUIRED motion respect: prefers-reduced-motion support

### **📊 PROGRESSIVE DISCLOSURE**
- REQUIRED use of Collapse/Accordion for complex content
- REQUIRED Drawer/Modal components for secondary content
- REQUIRED Tab components for related content organization

### **🔍 SEARCH & NAVIGATION ENHANCEMENTS**
- REQUIRED AutoComplete component for search where applicable
- REQUIRED Menu with proper item grouping
- REQUIRED no dead ends - always provide navigation back

### **💳 MODERN PAGE PATTERNS**
- REQUIRED hero sections: clear headline, subtext, primary CTA
- REQUIRED card patterns: consistent elevation and hover states
- REQUIRED proper content hierarchy and visual support

### **🎨 MODERN DESIGN PATTERNS (2024-2025 STANDARDS):**
1. **React Architecture**: Functional component with memo, useState, useCallback
2. **Component Library**: ONLY pure React components with HTML elements
3. **Modern CSS**: Advanced Tailwind patterns:
   - **Dynamic Gradients**: Industry-specific color gradients based on design system
   - **Glassmorphism**: backdrop-blur-xl bg-white/10 border border-white/20
   - **Shadows**: shadow-2xl drop-shadow-lg for depth
   - **Animations**: hover:scale-105 transition-all duration-300
   - **Spacing**: p-8 py-20 mb-16 for premium feel
   - **Typography**: text-5xl md:text-6xl font-bold for impact
4. **Interactive Elements**:
   - Cards: hover:scale-105 transition-all duration-300
   - Buttons: gradient backgrounds with hover effects
   - Forms: glassmorphism with backdrop-blur
5. **Icons**: Lucide React icons only
6. **LocalPreview**: Sandpack compatible (no external dependencies)

**🎨 MANDATORY MODERN DESIGN IMPLEMENTATION:**
- **Hero Section**: MUST use gradient background: className="min-h-screen dynamic gradient from design.colorSystem.primaryGradients"
- **Cards/Components**: MUST implement glassmorphism: className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300"
- **Buttons**: MUST use gradient styling from design system: className="${designClasses?.primaryGradient || 'bg-gradient-to-r from-blue-600 to-blue-800'} transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
- **Typography**: MUST use large, impactful scales: text-5xl md:text-6xl font-bold for main headings
- **Spacing**: MUST use generous spacing: py-20 px-8 for sections, p-8 for cards
- **Layout**: MUST implement asymmetric layouts with overlapping elements where possible

**REQUIRED IMPORTS (REACT + TAILWIND + LUCIDE ONLY):**
\`\`\`jsx
import React, { useState, useCallback, memo, useEffect } from 'react';
import { 
  Star, User, Mail, Phone, Award, TrendingUp, CheckCircle, Search,
  Menu as MenuIcon, Home, ArrowRight, Calendar, Clock, Shield,
  Zap, Heart, Globe, Target, Users, BarChart, Settings, X, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, StarIcon
} from 'lucide-react';

// NO ANT DESIGN IMPORTS - PURE REACT + TAILWIND ONLY
// All UI components will be custom-built with Tailwind CSS
\`\`\`

**MODERN STYLING REQUIREMENTS:**
- Hero: Full-width gradient backgrounds using design system: ${designClasses?.primaryGradient || 'bg-gradient-to-r from-blue-600 to-blue-800'}
- Cards: Glassmorphism effects using design system: ${designClasses?.glassmorphism || 'bg-white/10 backdrop-blur-lg border border-white/20'}
- Animations: Hover effects (hover:scale-105 transition-all duration-300)
- Spacing: Professional spacing (p-8, py-20, mb-16)
- Typography: Visual hierarchy (text-6xl, text-5xl, text-2xl)

**MANDATORY COMPONENT STRUCTURE (PURE REACT + TAILWIND):**
\`\`\`jsx
const ${componentName} = memo(() => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  
  // CRITICAL FIX: Dark mode implementation - apply 'dark' class to document.documentElement
  // This ensures all child elements with dark: prefixes work correctly throughout the page
  
  // REQUIRED: Form submission handler
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setIsLoading(true);
    // Form submission logic
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  // MANDATORY: Dynamic section title mapping based on industry
  const getSectionTitle = (sectionKey, industry) => {
    const industryMappings = {
      healthcare: {
        features: 'Our Services',
        testimonials: 'Patient Stories', 
        team: 'Medical Team',
        about: 'About Our Practice'
      },
      ecommerce: {
        features: 'Our Products',
        testimonials: 'Customer Reviews',
        team: 'Our Team',
        about: 'About Our Store'
      },
      technology: {
        features: 'Solutions',
        testimonials: 'Case Studies', 
        team: 'Our Team',
        about: 'About Our Technology'
      },
      finance: {
        features: 'Financial Solutions',
        testimonials: 'Client Success Stories',
        team: 'Expert Team',
        about: 'Our Expertise'
      },
      education: {
        features: 'Programs',
        testimonials: 'Student Success Stories',
        team: 'Faculty',
        about: 'About Our Institution'
      },
      real_estate: {
        features: 'Properties',
        testimonials: 'Client Testimonials',
        team: 'Our Agents',
        about: 'About Our Agency'
      }
    };
    
    const mapping = industryMappings[industry] || industryMappings.technology;
    return mapping[sectionKey] || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
  };
  
  // MANDATORY: Dynamic section content rendering based on data type
  const renderSectionContent = (sectionData, sectionKey, industry, designClasses) => {
    if (Array.isArray(sectionData)) {
      // Handle arrays (features, testimonials, etc.)
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sectionData.map((item, index) => (
            <div key={index} className="backdrop-blur-xl bg-white/10 dark:bg-gray-800/20 border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              {item.title && <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{item.title}</h3>}
              {item.description && <p className="text-gray-700 dark:text-gray-300">{item.description}</p>}
              {item.author && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">- {item.author}</p>}
            </div>
          ))}
        </div>
      );
    } else if (typeof sectionData === 'object') {
      // Handle objects (about, company info, etc.)
      return (
        <div className="max-w-4xl mx-auto text-center">
          {sectionData.title && <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">{sectionData.title}</h3>}
          {sectionData.description && <p className="text-lg text-gray-700 dark:text-gray-300">{sectionData.description}</p>}
        </div>
      );
    } else {
      // Handle strings or other data types
      return (
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-700 dark:text-gray-300">{String(sectionData)}</p>
        </div>
      );
    }
  };

  return (
    <div className={\`min-h-screen transition-colors duration-300 \${isDarkMode ? 'dark' : ''}\`} style={{background: isDarkMode ? '\${designClasses?.primaryGradient?.replace('from-', 'from-gray-900 via-').replace('to-', 'to-gray-800')} || linear-gradient(135deg, #1f2937, #111827)' : '\${designClasses?.primaryGradient?.replace('from-', 'from-gray-50 via-').replace('to-', 'to-white')} || linear-gradient(135deg, #f9fafb, #ffffff)'}}>
      {/* MANDATORY: Skip to main content link for accessibility */}
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      
      {/* MANDATORY: Navigation header with ENHANCED backdrop blur */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Brand</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#home" className="bg-blue-100 text-blue-900 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </a>
                <a href="#products" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Products
                </a>
                <a href="#about" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  About
                </a>
              </div>
            </div>
            
            {/* FUNCTIONAL Dark Mode Toggle - CRITICAL FIX */}
            <button
              onClick={toggleDarkMode}
              className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-md border border-white/30 dark:border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="text-xl">
                {isDarkMode ? '☀️' : '🌙'}
              </span>
            </button>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>
      </header>
      
      <main id="main">
        {/* MANDATORY: Hero Section with DYNAMIC gradient background */}
        <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden" style={{background: \`\${designClasses?.primaryGradient ? designClasses.primaryGradient.replace('bg-gradient-to-r', 'linear-gradient(135deg,').replace('from-[', '').replace('] to-[', ', ').replace(']', '') + ')' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)'}\`}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Hero content with EXACT content utilization */}
            <h1 className="text-4xl md:text-6xl ${designClasses?.headingFont || 'font-sans'} font-bold mb-6">
              [HERO_HEADLINE]
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              [HERO_SUBHEADLINE]  
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                color: designClasses?.primaryColor || '#3B82F6',
                border: \`1px solid \${designClasses?.primaryColor || '#3B82F6'}20\`
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                e.target.style.transform = 'scale(1)';
              }}
            >
                [HERO_CTA_PRIMARY]
              </button>
              <button 
                className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                  e.target.style.color = designClasses?.primaryColor || '#3B82F6';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                [HERO_CTA_SECONDARY]
              </button>
            </div>
          </div>
        </section>
        
        {/* MANDATORY: DYNAMIC SECTIONS - Content-driven generation */}
        {Object.keys(content || {}).filter(key => 
          key !== 'hero' && content[key] && 
          (Array.isArray(content[key]) ? content[key].length > 0 : true)
        ).map((sectionKey) => {
          const sectionData = content[sectionKey];
          const sectionTitle = getSectionTitle(sectionKey, pageSpec.industry);
          
          return (
            <section key={sectionKey} className="py-20 px-8 bg-white/5 dark:bg-gray-900/20">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                  {sectionTitle}
                </h2>
                {renderSectionContent(sectionData, sectionKey, pageSpec.industry, designClasses)}
              </div>
            </section>
          );
        })}
        
        {/* MANDATORY: Contact Form with validation */}
        <section className="py-20 px-8 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
              Get In Touch
            </h2>
            <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/30 dark:border-gray-700/30 rounded-2xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300/30 dark:border-gray-600/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{
                      '--tw-ring-color': designClasses?.primaryColor || '#3B82F6'
                    }}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300/30 dark:border-gray-600/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{
                      '--tw-ring-color': designClasses?.primaryColor || '#3B82F6'
                    }}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300/30 dark:border-gray-600/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md focus:ring-2 focus:border-transparent transition-all duration-300"
                  style={{
                    '--tw-ring-color': designClasses?.primaryColor || '#3B82F6'
                  }}
                  placeholder="Enter your message"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
                style={{
                  background: designClasses?.primaryGradient ? 
                    designClasses.primaryGradient.replace('bg-gradient-to-r', 'linear-gradient(135deg,').replace('from-[', '').replace('] to-[', ', ').replace(']', '') + ')' : 
                    'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </section>
        
        {/* MANDATORY: Enhanced Loading states with backdrop blur */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div 
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-8 flex items-center space-x-4 border border-white/20 dark:border-gray-700/20 shadow-2xl"
              style={{
                backdropFilter: 'blur(20px)'
              }}
            >
              <div 
                className="animate-spin rounded-full h-8 w-8 border-2 border-transparent"
                style={{
                  borderTopColor: designClasses?.primaryColor || '#3B82F6',
                  borderRightColor: designClasses?.primaryColor || '#3B82F6'
                }}
              ></div>
              <span className="text-gray-900 dark:text-white font-medium">Processing...</span>
            </div>
          </div>
        )}
      </main>
      
      {/* MANDATORY: Footer with semantic HTML */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Products</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  <Globe className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-700 text-center">
            <p className="text-slate-400">&copy; 2024 Company Name. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
});
\`\`\`

**🚨 MANDATORY UI/UX RULES (MUST PASS ALL 5 FOR COMPLIANCE):**
1. ✅ RESPONSIVE DESIGN: MUST use responsive breakpoints (sm:, md:, lg:, xl:) on ALL layout elements
   - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, responsive gap-4 md:gap-6 lg:gap-8
   - Typography: text-base md:text-lg lg:text-xl responsive scaling on headings
   - Spacing: p-4 md:p-6 lg:p-8 responsive padding, m-2 md:m-4 lg:m-6 responsive margins
   - Containers: max-w-sm md:max-w-4xl lg:max-w-6xl xl:max-w-7xl responsive containers

2. ✅ ACCESSIBILITY BASELINE: MUST implement semantic HTML + ARIA + color contrast
   - Semantic HTML: <header>, <nav>, <main>, <section>, <footer> structure
   - ARIA labels: aria-label on all interactive elements, aria-describedby for forms
   - Color contrast: High contrast text-slate-900 on light backgrounds, text-white on dark
   - Focus states: focus:ring-2 focus:ring-blue-500 focus:outline-none on ALL interactive elements

3. ✅ CLEAR NAVIGATION: MUST have persistent navigation with clear labels
   - Navigation bar: Fixed/sticky header with consistent navigation throughout
   - Clear labels: Descriptive text labels (not just icons) for all nav items
   - Active states: bg-blue-100 dark:bg-blue-800 to show current page/section
   - Mobile responsive: Hidden/collapsible menu for mobile with hamburger menu

4. ✅ INTERACTION FEEDBACK: MUST have hover/focus states on ALL interactive elements
   - Buttons: hover:bg-blue-600 active:bg-blue-700 focus:ring-2 transition-all duration-200
   - Links: hover:text-blue-600 hover:underline transition-colors duration-200
   - Cards: hover:shadow-lg hover:scale-105 transition-all duration-300
   - Forms: focus:border-blue-500 focus:ring-2 focus:ring-blue-200 on all inputs

5. ✅ NO BLOCKING ERRORS: MUST have error boundaries, loading states, fallbacks
   - Error boundaries: try-catch blocks, error state handling in components
   - Loading states: Loading spinners with animate-spin, skeleton states
   - Fallbacks: Default content when data fails to load, placeholder images
   - Form validation: HTML5 validation, visual error states with text-red-500

**ADDITIONAL UI/UX VALIDATION CHECKPOINTS (TAILWIND-ONLY IMPLEMENTATION):**
✅ Visual hierarchy: text-4xl md:text-6xl font-bold responsive typography scales
✅ Touch targets: px-8 py-4 minimum touch areas (≥44px), adequate spacing
✅ Modern effects: backdrop-blur-xl, bg-gradient-to-r, glassmorphism styling
✅ Glassmorphism: backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl
✅ Hover animations: hover:scale-105 transition-all duration-300 on cards and buttons
✅ Dark mode: dark: classes throughout, theme toggle functionality

**CRITICAL OUTPUT REQUIREMENTS:**
1. Return ONLY the React component code (no explanations, no markdown blocks)
2. Start with imports and end with export default ${componentName}
3. MUST be production-ready with realistic content (no placeholder text)
4. MUST include ALL content sections listed above
5. MUST be visually impressive and modern
6. MUST implement ALL mandatory UI/UX rules above
7. MUST achieve ≥85% compliance score when validated

**🚨 CRITICAL JSX SYNTAX REQUIREMENTS (PREVENT COMPILATION ERRORS):**
- ALL JSX tags MUST be properly closed with matching quotes
- Style objects MUST use proper syntax: style={{property: 'value'}} (NO EXTRA QUOTES)
- ALL attributes MUST be properly separated with spaces
- Image tags MUST follow this EXACT pattern: <img src="url" alt="description" className="classes" />
- NO malformed attributes like: style={{}}}" or className=""" 
- ALL string values in JSX MUST use consistent quote types
- Verify EVERY opening and closing tag matches properly
- NO trailing quotes or extra characters after JSX attributes

**JSX VALIDATION CHECKLIST - VERIFY EACH LINE:**
✅ Every opening tag has a matching closing tag
✅ All style objects use double braces without extra quotes: style={{color: 'red'}}
✅ All className attributes are properly quoted: className="my-class"
✅ All src and alt attributes are properly quoted: src="image.jpg" alt="description"
✅ No duplicate attributes on the same element
✅ All JSX expressions are properly enclosed in single braces: {variable}

🚨 CRITICAL OUTPUT FORMAT - READ CAREFULLY:
- DO NOT return JSON structure like {"name":"hero","type":"hero",...}  
- DO NOT wrap response in markdown code blocks
- DO NOT include explanations or descriptions
- MUST start with: import React from 'react';
- MUST end with: export default ${componentName};
- MUST be complete, executable React/JSX code ONLY

Generate the complete React component code now (REACT CODE ONLY, NO JSON):`;
  }

  /**
   * Build content validation strings for automatic content scanning
   */
  buildContentValidationStrings(content) {
    const validationStrings = [];

    if (!content) {
      return 'No content provided - AI must generate appropriate placeholder content';
    }

    // Hero validation strings - handle both formats
    if (content.hero) {
      // Handle both headline/title formats
      const headline = content.hero.headline || content.hero.title;
      const subheadline = content.hero.subheadline || content.hero.subtitle;
      const primaryCta = content.hero.ctaPrimary || content.hero.ctaButtons?.[0]?.text;
      const secondaryCta = content.hero.ctaSecondary || content.hero.ctaButtons?.[1]?.text;
      
      if (headline) validationStrings.push(`"${headline}"`);
      if (subheadline) validationStrings.push(`"${subheadline}"`);
      if (primaryCta) validationStrings.push(`"${primaryCta}"`);
      if (secondaryCta) validationStrings.push(`"${secondaryCta}"`);
    }

    // Features validation strings
    if (content.features && Array.isArray(content.features)) {
      content.features.forEach(feature => {
        if (feature.title || feature.name) validationStrings.push(`"${feature.title || feature.name}"`);
        if (feature.description || feature.desc) validationStrings.push(`"${(feature.description || feature.desc).substring(0, 30)}..."`);
      });
    }

    // Testimonials validation strings
    if (content.testimonials && Array.isArray(content.testimonials)) {
      content.testimonials.forEach(testimonial => {
        if (testimonial.author || testimonial.name) validationStrings.push(`"${testimonial.author || testimonial.name}"`);
        if (testimonial.quote || testimonial.testimonial) validationStrings.push(`"${(testimonial.quote || testimonial.testimonial).substring(0, 30)}..."`);
        if (testimonial.company) validationStrings.push(`"${testimonial.company}"`);
      });
    }

    // Stats validation strings
    if (content.stats && Array.isArray(content.stats)) {
      content.stats.forEach(stat => {
        if (stat.value || stat.metric) validationStrings.push(`"${stat.value || stat.metric}"`);
        if (stat.label || stat.description || stat.name) validationStrings.push(`"${stat.label || stat.description || stat.name}"`);
      });
    }

    return validationStrings.length > 0 ? 
      validationStrings.join('\n') : 
      'No specific content validation strings - AI must generate contextually appropriate content';
  }

  /**
   * Build enhanced content requirements with strict utilization enforcement
   */
  buildEnhancedContentRequirements(content, contentAnalysis, pageSpec = {}) {
    const requirements = [];

    if (contentAnalysis.contentMap.hero) {
      const heroData = content.hero;
      // Handle both formats: headline/subheadline (ContentAgent) and title/subtitle (test format)
      const headline = heroData.headline || heroData.title || 'Transform Your Business';
      const subheadline = heroData.subheadline || heroData.subtitle || 'Innovative solutions for modern challenges';
      const primaryCta = heroData.ctaPrimary || heroData.ctaButtons?.[0]?.text || 'Get Started';
      const secondaryCta = heroData.ctaSecondary || heroData.ctaButtons?.[1]?.text || 'Learn More';
      
      requirements.push(`
🔥 **HERO SECTION** (MANDATORY - CRITICAL PRIORITY):
   - Headline: "${headline}" [EXACT TEXT REQUIRED]
   - Subheadline: "${subheadline}" [EXACT TEXT REQUIRED]
   - Primary CTA: "${primaryCta}" [EXACT TEXT REQUIRED]
   - Secondary CTA: "${secondaryCta}" [EXACT TEXT REQUIRED]
   - CRITICAL: Use gradient background with full-height design
   - VALIDATION: System will scan for ALL 4 text elements above`);
    }

    if (contentAnalysis.contentMap.features.length > 0) {
      const featureList = contentAnalysis.contentMap.features.map((f, i) => 
        `   "${f.title || f.name}" → "${f.description || f.desc || 'Feature description'}" [EXACT TEXT MATCH REQUIRED]`
      ).join('\n');
      
      requirements.push(`
⚡ **FEATURES SECTION** (MANDATORY - HIGH PRIORITY):
   - MUST implement ALL ${contentAnalysis.contentMap.features.length} features with EXACT content below
   - Use Card components with glassmorphism styling and hover effects
   - Use appropriate Lucide React icons for each feature
   - REQUIRED FEATURES (EXACT TEXT):
${featureList}
   - Layout: 3-column responsive grid (xs={24} sm={12} md={8})
   - VALIDATION: System will scan for ALL feature titles and descriptions`);
    }

    if (contentAnalysis.contentMap.testimonials.length > 0) {
      const testimonialList = contentAnalysis.contentMap.testimonials.map(t => 
        `   "${t.quote || t.testimonial}" - ${t.author || t.name} (${t.title || 'Customer'}, ${t.company || 'Company'}) [Rating: ${t.rating || 5}]`
      ).join('\n');
      
      requirements.push(`
💬 **TESTIMONIALS SECTION** (MANDATORY - HIGH PRIORITY):
   - MUST implement ALL ${contentAnalysis.contentMap.testimonials.length} testimonials with EXACT content below
   - Use Carousel component with ratings and avatars
   - REQUIRED TESTIMONIALS (EXACT TEXT):
${testimonialList}
   - Use Rate component showing rating: ${contentAnalysis.contentMap.testimonials.map(t => t.rating || 5).join(', ')}
   - VALIDATION: System will scan for ALL author names and testimonial quotes`);
    }

    if (contentAnalysis.contentMap.stats.length > 0) {
      const statsList = contentAnalysis.contentMap.stats.map(s => 
        `   "${s.value || s.metric}" → "${s.label || s.description || s.name || 'Metric'}" (${s.trend || 'positive'} trend)`
      ).join('\n');
      
      requirements.push(`
📊 **STATISTICS SECTION** (MANDATORY - HIGH PRIORITY):
   - MUST implement ALL ${contentAnalysis.contentMap.stats.length} statistics with EXACT content below
   - Use Statistic component with proper formatting and trend indicators
   - Use Row and Col for responsive layout
   - REQUIRED STATS (EXACT VALUES):
${statsList}
   - Include visual trend indicators (green for positive, red for negative)
   - VALIDATION: System will scan for ALL statistic values and labels`);
    }

    // Always include form and company info
    const formFields = this.getFormFieldsFromSpec ? 
      this.getFormFieldsFromSpec(pageSpec) : 
      (pageSpec.formFields?.required || ['name', 'email', 'message']);
    
    requirements.push(`
📝 **CONTACT FORM SECTION** (MANDATORY):
   - All specified form fields: ${formFields.join(', ')}
   - Professional styling with icons and validation
   - Loading states and error handling
   - Glassmorphism form styling with backdrop-blur

🏢 **COMPANY INFO SECTION** (MANDATORY):
   - Company description and mission
   - Contact information and location
   - Professional presentation with modern styling`);

    return requirements.join('\n\n');
  }

  /**
   * Enhanced content utilization validation with strict matching
   */
  validateContentUtilization(reactCode, content, contentAnalysis) {
    const validation = {
      total: contentAnalysis.totalElements,
      used: 0,
      missing: [],
      present: [],
      percentage: 0,
      critical: [],
      warnings: []
    };

    if (!content || !reactCode) {
      return validation;
    }

    const codeText = reactCode.toLowerCase();

    // Enhanced hero content validation
    if (content.hero) {
      const heroData = content.hero;
      let heroUsed = 0;
      const heroElements = 4; // headline, subheadline, ctaPrimary, ctaSecondary
      
      // Check headline
      if (heroData.headline && codeText.includes(heroData.headline.toLowerCase())) {
        heroUsed++;
        validation.present.push(`Hero headline: "${heroData.headline}"`);
      } else if (heroData.headline) {
        validation.missing.push(`Hero headline: "${heroData.headline}"`);
        validation.critical.push('Missing hero headline');
      }
      
      // Check subheadline
      if (heroData.subheadline && codeText.includes(heroData.subheadline.toLowerCase())) {
        heroUsed++;
        validation.present.push(`Hero subheadline: "${heroData.subheadline}"`);
      } else if (heroData.subheadline) {
        validation.missing.push(`Hero subheadline: "${heroData.subheadline}"`);
        validation.warnings.push('Missing hero subheadline');
      }

      // Check primary CTA
      if (heroData.ctaPrimary && codeText.includes(heroData.ctaPrimary.toLowerCase())) {
        heroUsed++;
        validation.present.push(`Primary CTA: "${heroData.ctaPrimary}"`);
      } else if (heroData.ctaPrimary) {
        validation.missing.push(`Primary CTA: "${heroData.ctaPrimary}"`);
        validation.warnings.push('Missing primary CTA');
      }

      validation.used += heroUsed;
    }

    // Enhanced features validation
    if (content.features && Array.isArray(content.features)) {
      let featuresUsed = 0;
      content.features.forEach((feature, index) => {
        const featureTitle = feature.title || feature.name;
        const featureDesc = feature.description || feature.desc;
        
        let featureMatches = 0;
        if (featureTitle && codeText.includes(featureTitle.toLowerCase())) {
          featureMatches++;
          validation.present.push(`Feature title: "${featureTitle}"`);
        } else if (featureTitle) {
          validation.missing.push(`Feature title: "${featureTitle}"`);
        }
        
        if (featureDesc && codeText.includes(featureDesc.toLowerCase())) {
          featureMatches++;
          validation.present.push(`Feature desc: "${featureDesc.substring(0, 30)}..."`);
        } else if (featureDesc) {
          validation.missing.push(`Feature desc: "${featureDesc.substring(0, 30)}..."`);
        }
        
        if (featureMatches > 0) {
          featuresUsed++;
        } else {
          validation.critical.push(`Complete feature missing: ${featureTitle}`);
        }
      });
      validation.used += featuresUsed;
    }

    // Enhanced testimonials validation
    if (content.testimonials && Array.isArray(content.testimonials)) {
      let testimonialsUsed = 0;
      content.testimonials.forEach((testimonial, index) => {
        const author = testimonial.author || testimonial.name;
        const quote = testimonial.quote || testimonial.testimonial;
        const company = testimonial.company;
        
        let testimonialMatches = 0;
        if (author && codeText.includes(author.toLowerCase())) {
          testimonialMatches++;
          validation.present.push(`Testimonial author: "${author}"`);
        } else if (author) {
          validation.missing.push(`Testimonial author: "${author}"`);
        }
        
        if (quote && codeText.includes(quote.toLowerCase().substring(0, 20))) {
          testimonialMatches++;
          validation.present.push(`Testimonial quote: "${quote.substring(0, 30)}..."`);
        } else if (quote) {
          validation.missing.push(`Testimonial quote: "${quote.substring(0, 30)}..."`);
        }
        
        if (testimonialMatches > 0) {
          testimonialsUsed++;
        } else {
          validation.critical.push(`Complete testimonial missing: ${author}`);
        }
      });
      validation.used += testimonialsUsed;
    }

    // Enhanced stats validation
    if (content.stats && Array.isArray(content.stats)) {
      let statsUsed = 0;
      content.stats.forEach((stat, index) => {
        const statValue = stat.value || stat.metric;
        const statLabel = stat.label || stat.description || stat.name;
        
        let statMatches = 0;
        if (statValue && codeText.includes(String(statValue).toLowerCase())) {
          statMatches++;
          validation.present.push(`Stat value: "${statValue}"`);
        } else if (statValue) {
          validation.missing.push(`Stat value: "${statValue}"`);
        }
        
        if (statLabel && codeText.includes(statLabel.toLowerCase())) {
          statMatches++;
          validation.present.push(`Stat label: "${statLabel}"`);
        } else if (statLabel) {
          validation.missing.push(`Stat label: "${statLabel}"`);
        }
        
        if (statMatches > 0) {
          statsUsed++;
        } else {
          validation.critical.push(`Complete statistic missing: ${statValue}`);
        }
      });
      validation.used += statsUsed;
    }

    // Calculate percentage with penalties for critical issues
    validation.percentage = validation.total > 0 ? Math.round((validation.used / validation.total) * 100) : 0;
    
    // Apply penalties for critical missing content
    if (validation.critical.length > 0) {
      validation.percentage = Math.max(0, validation.percentage - (validation.critical.length * 10));
    }

    return validation;
  }

  /**
   * Extract React code from AI response
   */
  extractCode(response) {
    try {
      console.log('🔍 [CodeAgent.extractCode] Starting extraction...');
      
      // Safety check for undefined/null response
      if (!response) {
        console.error('❌ [CodeAgent] extractCode: response is undefined or null');
        return null;
      }
      
      if (typeof response !== 'string') {
        console.log('🔍 [CodeAgent] extractCode: response is not a string, type:', typeof response);
        // Try to handle object responses directly
        if (typeof response === 'object' && response !== null) {
          if (response.code) {
            console.log('🔍 [CodeAgent.extractCode] Found object with code property');
            response = response.code;
          } else if (response.responseText) {
            console.log('🔍 [CodeAgent.extractCode] Found object with responseText property');
            response = response.responseText;
          } else if (response.components) {
            console.log('🔍 [CodeAgent.extractCode] Found object with components property');
            response = response.components;
          } else if (response.reactCode) {
            console.log('🔍 [CodeAgent.extractCode] Found object with reactCode property');
            response = response.reactCode;
          } else {
            console.log('🔍 [CodeAgent] extractCode: Object response structure:', Object.keys(response));
            // Try to find any property that contains JSX code
            const possibleCodeProps = ['jsx', 'react', 'component', 'generatedCode'];
            let foundCodeProp = false;
            for (const prop of possibleCodeProps) {
              if (response[prop] && typeof response[prop] === 'string') {
                console.log(`🔍 [CodeAgent.extractCode] Found code in ${prop} property`);
                response = response[prop];
                foundCodeProp = true;
                break;
              }
            }
            if (!foundCodeProp) {
              console.error('❌ [CodeAgent] extractCode: Object response has no recognized code property');
              return null;
            }
          }
        } else {
          return null;
        }
      }
      
      console.log('🔍 [CodeAgent.extractCode] Calling trim()...');
      let code = response.trim();
      console.log('🔍 [CodeAgent.extractCode] Trim successful, code length:', code.length);
      
      // Handle JSON-wrapped responses
      console.log('🔍 [CodeAgent.extractCode] Checking for JSON structure...');
      try {
        const jsonResponse = JSON.parse(code);
        if (jsonResponse.code) {
          console.log('🔍 [CodeAgent.extractCode] Found JSON with code property');
          code = jsonResponse.code;
        } else if (jsonResponse.responseText) {
          console.log('🔍 [CodeAgent.extractCode] Found JSON with responseText property');
          code = jsonResponse.responseText;
        }
      } catch (jsonError) {
        console.log('🔍 [CodeAgent.extractCode] Not JSON, continuing with text extraction');
        // Not JSON, continue with text extraction
      }
      
      console.log('🔍 [CodeAgent.extractCode] Checking for markdown code blocks...');
      // Remove markdown code blocks if present - enhanced patterns
      const codeBlockPatterns = [
        /```jsx\n?([\s\S]*?)```/,
        /```javascript\n?([\s\S]*?)```/,
        /```js\n?([\s\S]*?)```/,
        /```react\n?([\s\S]*?)```/,
        /```\n?([\s\S]*?)```/
      ];
      
      let foundCodeBlock = false;
      for (const pattern of codeBlockPatterns) {
        const match = code.match(pattern);
        if (match && match[1]) {
          console.log('🔍 [CodeAgent.extractCode] Found markdown code block with pattern:', pattern.source);
          code = match[1];
          foundCodeBlock = true;
          break;
        }
      }
      
      // If patterns failed, try simple detection and manual extraction
      if (!foundCodeBlock && code.includes('```jsx')) {
        console.log('🔍 [CodeAgent.extractCode] Manual JSX block extraction...');
        const startIndex = code.indexOf('```jsx') + 6;
        const endIndex = code.lastIndexOf('```');
        if (endIndex > startIndex) {
          code = code.substring(startIndex, endIndex).trim();
          foundCodeBlock = true;
          console.log('🔍 [CodeAgent.extractCode] Manual extraction successful');
        }
      } else if (!foundCodeBlock && code.includes('```')) {
        console.log('🔍 [CodeAgent.extractCode] Manual code block extraction...');
        const startIndex = code.indexOf('```') + 3;
        const endIndex = code.lastIndexOf('```');
        if (endIndex > startIndex) {
          code = code.substring(startIndex, endIndex).trim();
          foundCodeBlock = true;
          console.log('🔍 [CodeAgent.extractCode] Manual extraction successful');
        }
      }
      
      if (!foundCodeBlock) {
        console.log('🔍 [CodeAgent.extractCode] No markdown code block found');
      }
      
      console.log('🔍 [CodeAgent.extractCode] Final trim...');
      // Clean up whitespace
      code = code.trim();
      console.log('🔍 [CodeAgent.extractCode] Final code length:', code.length);
      
      console.log('🔍 [CodeAgent.extractCode] Validating React structure...');
      // More flexible React code structure validation
      if (typeof code !== 'string' || code.length === 0) {
        console.error('❌ [CodeAgent] Code is not a string or is empty');
        const codePreview = typeof code === 'string' ? code.substring(0, 500) : JSON.stringify(code).substring(0, 500);
        console.log('🔍 [CodeAgent.extractCode] Code preview:', codePreview);
        return null;
      }
      
      // Check for basic React/JSX indicators - much more flexible approach
      const hasReactIndicators = 
        code.includes('import') || 
        code.includes('export') || 
        code.includes('function ') || 
        code.includes('const ') || 
        code.includes('class ') ||
        code.includes('React') ||
        code.includes('<div') ||
        code.includes('<section') ||
        code.includes('<main') ||
        code.includes('jsx') ||
        code.includes('useState') ||
        code.includes('useEffect');
        
      if (!hasReactIndicators) {
        console.warn('⚠️ [CodeAgent] No obvious React/JSX indicators found, but attempting to use code anyway');
        const codePreview = code.substring(0, 500);
        console.log('🔍 [CodeAgent.extractCode] Code preview for analysis:', codePreview);
        // Don't return null - let it proceed in case it's valid code in a different format
      } else {
        console.log('✅ [CodeAgent.extractCode] Found React/JSX indicators in code');
      }
      
      console.log('✅ [CodeAgent.extractCode] Successfully extracted code');
      return code;
    } catch (error) {
      console.error('❌ [CodeAgent] Code extraction error:', error.message);
      return null;
    }
  }

  /**
   * Extract design system classes for dynamic Tailwind generation
   * TR-001: Dynamic Design System Application - ENHANCED with multiple data structure support
   */
  extractDesignSystemClasses(design) {
    // ...existing code...
    if (!design || typeof design !== 'object') {
      console.error('❌ [CodeAgent] Design data is missing or invalid:', design);
    }
    // Check for gradients in design data
    const gradientsRaw = design?.brand?.colorPalette?.gradients || design?.advancedColorSystem?.primaryGradients || design?.modernEffects?.gradients || design?.modernEffects?.primaryGradients || design?.colorSystem?.gradients || design?.visual?.gradients;
    if (!gradientsRaw) {
      console.warn('⚠️ [CodeAgent] No gradient arrays found in design data:', design);
    }
    console.log('🎨 [CodeAgent] Extracting design system classes...');
    console.log('🔍 [CodeAgent] Design structure debug:', {
      hasAdvancedColorSystem: !!design?.advancedColorSystem,
      hasBrandColorPalette: !!design?.brand?.colorPalette,
      hasModernEffects: !!design?.modernEffects,
      designKeys: design ? Object.keys(design) : []
    });
    
    // ENHANCED: Support multiple design data structures from different agent versions
    const gradients = this.extractGradients(design);
    const colors = this.extractColors(design);
    
    const classes = {
      primaryGradient: this.convertToTailwindGradient(gradients),
      headingFont: this.convertToTailwindFont(design?.typography?.headingFont || design?.brand?.typography?.heading),
      glassmorphism: this.convertToTailwindBlur(design?.glassmorphism || design?.modernEffects?.glassmorphism),
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      backgroundPattern: design?.visual?.primaryPattern || design?.modernEffects?.style || 'glassmorphism',
      visualStyle: design?.visual?.style || design?.brand?.visualStyle || 'modern'
    };
    
    console.log('🎨 [CodeAgent] Extracted design classes:', {
      primaryGradient: classes.primaryGradient,
      headingFont: classes.headingFont,
      primaryColor: classes.primaryColor,
      secondaryColor: classes.secondaryColor,
      visualStyle: classes.visualStyle,
      gradientsFound: gradients ? gradients.length : 0
    });
    
    return classes;
  }

  /**
   * ENHANCED: Extract gradients from multiple possible data structures
   */
  extractGradients(design) {
    if (!design) return null;
    
    console.log('🔍 [CodeAgent] Gradient extraction debug:', {
      hasAdvancedColorSystem: !!design?.advancedColorSystem,
      hasAdvancedColorSystemGradients: !!design?.advancedColorSystem?.primaryGradients,
      hasBrand: !!design?.brand,
      hasBrandColorPalette: !!design?.brand?.colorPalette,
      brandKeys: design?.brand ? Object.keys(design.brand) : [],
      hasModernEffects: !!design?.modernEffects,
      modernEffectsKeys: design?.modernEffects ? Object.keys(design.modernEffects) : [],
      hasVisual: !!design?.visual,
      visualKeys: design?.visual ? Object.keys(design.visual) : []
    });
    
    console.log('🔍 [CodeAgent-DEBUG] Complete design object received:', JSON.stringify(design, null, 2));
    
    // Try multiple possible gradient locations with extensive debugging
    const gradientSources = [
      { name: 'advancedColorSystem.primaryGradients', value: design?.advancedColorSystem?.primaryGradients },
      { name: 'brand.colorPalette.gradients', value: design?.brand?.colorPalette?.gradients },
      { name: 'brand.colorPalette', value: design?.brand?.colorPalette ? [design.brand.colorPalette.primary, design.brand.colorPalette.secondary] : null },
      { name: 'modernEffects.gradients', value: design?.modernEffects?.gradients },
      { name: 'modernEffects.primaryGradients', value: design?.modernEffects?.primaryGradients },
      { name: 'colorSystem.gradients', value: design?.colorSystem?.gradients },
      { name: 'visual.gradients', value: design?.visual?.gradients },
      { name: 'modernEnhancements.advancedColorSystem.primaryGradients', value: design?.modernEnhancements?.advancedColorSystem?.primaryGradients }
    ];
    
    for (const source of gradientSources) {
      console.log(`🔍 [CodeAgent] Checking ${source.name}:`, {
        exists: !!source.value,
        isArray: Array.isArray(source.value),
        length: Array.isArray(source.value) ? source.value.length : 'N/A',
        value: source.value
      });
      
      if (Array.isArray(source.value) && source.value.length >= 2) {
        console.log(`🎨 [CodeAgent] Found gradients from ${source.name}:`, source.value.slice(0, 2));
        return source.value.slice(0, 2);
      } else if (source.value && typeof source.value === 'object' && !Array.isArray(source.value)) {
        // Check if it's an object with color properties
        const colorValues = Object.values(source.value).filter(v => typeof v === 'string' && v.startsWith('#'));
        if (colorValues.length >= 2) {
          console.log(`🎨 [CodeAgent] Found gradient colors from ${source.name} object:`, colorValues.slice(0, 2));
          return colorValues.slice(0, 2);
        }
      }
    }
    
    // FALLBACK: If design looks compressed/simplified, generate intelligent fallback gradients
    if (design?.advancedColorSystem?.primary || design?.brand?.colorPalette?.primary) {
      const primaryColor = design.advancedColorSystem?.primary || design.brand?.colorPalette?.primary;
      console.warn('⚠️ [CodeAgent] Design data appears compressed. Generating intelligent gradient fallback from primary color:', primaryColor);
      
      // Generate complementary gradient colors based on the primary
      const fallbackGradients = this.generateFallbackGradients(primaryColor);
      console.log('🎨 [CodeAgent] Generated fallback gradients:', fallbackGradients);
      return fallbackGradients;
    }
    
    console.warn('⚠️ [CodeAgent] No gradient arrays found in design data:', {
      designKeys: design ? Object.keys(design) : [],
      designSample: design
    });
    console.warn('⚠️ [CodeAgent] No valid gradients found, using fallback');
    return null;
  }
  
  /**
   * Generate intelligent fallback gradients from a primary color
   */
  generateFallbackGradients(primaryColor) {
    // Simple color manipulation to generate complementary gradients
    const colorMap = {
      '#3B82F6': ['#3B82F6', '#1D4ED8'], // blue variations
      '#8B5CF6': ['#8B5CF6', '#7C3AED'], // purple variations  
      '#10B981': ['#10B981', '#059669'], // green variations
      '#F59E0B': ['#F59E0B', '#D97706'], // orange variations
      '#EF4444': ['#EF4444', '#DC2626'], // red variations
    };
    
    // If we have a direct mapping, use it
    if (colorMap[primaryColor]) {
      return colorMap[primaryColor];
    }
    
    // Otherwise, generate a simple two-tone gradient
    return [primaryColor, primaryColor.replace(/[0-9]/g, match => Math.max(0, parseInt(match) - 2).toString())];
  }

  /**
   * ENHANCED: Extract colors from multiple possible data structures  
   */
  extractColors(design) {
    if (!design) return { primary: '#3B82F6', secondary: '#1D4ED8' };
    
    // Try multiple possible color locations
    const primary = design?.advancedColorSystem?.primaryGradients?.[0] ||
                   design?.brand?.colorPalette?.primary ||
                   design?.colors?.primary ||
                   '#3B82F6';
    
    const secondary = design?.advancedColorSystem?.primaryGradients?.[1] ||
                     design?.brand?.colorPalette?.secondary ||
                     design?.colors?.secondary ||
                     '#1D4ED8';
    
    return { primary, secondary };
  }

  /**
   * Convert design system gradients to Tailwind gradient classes
   */
  convertToTailwindGradient(gradients) {
    if (!gradients || !Array.isArray(gradients) || gradients.length < 2) {
      console.warn('⚠️ [CodeAgent] No valid gradients found, using fallback');
      return 'bg-gradient-to-r from-blue-500 to-blue-700'; // Fallback only
    }
    
    const gradient = `bg-gradient-to-r from-[${gradients[0]}] to-[${gradients[1]}]`;
    console.log('🎨 [CodeAgent] Generated gradient:', gradient);
    return gradient;
  }

  /**
   * Convert design system font to Tailwind font classes
   */
  convertToTailwindFont(headingFont) {
    if (!headingFont) {
      return 'font-sans'; // Default fallback
    }
    
    // Map common fonts to Tailwind classes
    const fontMap = {
      'Inter': 'font-sans',
      'Roboto': 'font-sans', 
      'Open Sans': 'font-sans',
      'Lato': 'font-sans',
      'Montserrat': 'font-sans',
      'Playfair Display': 'font-serif',
      'Merriweather': 'font-serif',
      'Georgia': 'font-serif',
      'Times New Roman': 'font-serif',
      'Courier New': 'font-mono',
      'Monaco': 'font-mono'
    };
    
    const tailwindClass = fontMap[headingFont] || 'font-sans';
    console.log('🎨 [CodeAgent] Font mapping:', headingFont, '→', tailwindClass);
    return tailwindClass;
  }

  /**
   * Convert design system glassmorphism to Tailwind blur classes
   */
  convertToTailwindBlur(glassmorphism) {
    if (!glassmorphism) {
      return 'backdrop-blur-sm bg-white/20 border border-white/30';
    }
    
    // Extract backdrop filter strength
    const backdropFilter = glassmorphism.backdropFilter || 'blur(8px)';
    const blurMatch = backdropFilter.match(/blur\((\d+)px\)/);
    const blurValue = blurMatch ? parseInt(blurMatch[1]) : 8;
    
    // Map blur values to Tailwind classes
    let blurClass = 'backdrop-blur-sm';
    if (blurValue >= 20) blurClass = 'backdrop-blur-xl';
    else if (blurValue >= 12) blurClass = 'backdrop-blur-lg';
    else if (blurValue >= 8) blurClass = 'backdrop-blur-md';
    else if (blurValue >= 4) blurClass = 'backdrop-blur-sm';
    else blurClass = 'backdrop-blur-none';
    
    const background = glassmorphism.background || 'rgba(255, 255, 255, 0.1)';
    const border = glassmorphism.border || '1px solid rgba(255, 255, 255, 0.2)';
    
    // Convert RGBA to Tailwind classes
    const bgOpacity = this.extractOpacity(background);
    const borderOpacity = this.extractOpacity(border);
    
    const glassmorphismClasses = `${blurClass} bg-white/${Math.round(bgOpacity * 100)} border border-white/${Math.round(borderOpacity * 100)}`;
    console.log('🎨 [CodeAgent] Glassmorphism classes:', glassmorphismClasses);
    return glassmorphismClasses;
  }

  /**
   * Extract opacity from RGBA color string
   */
  extractOpacity(rgbaString) {
    const rgbaMatch = rgbaString.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([^)]+)\)/);
    if (rgbaMatch) {
      return parseFloat(rgbaMatch[1]);
    }
    return 0.1; // Default opacity
  }

  /**
   * Generate component name from page specification
   */
  generateComponentName(pageName) {
    console.log('🔍 [CodeAgent.generateComponentName] Input:', typeof pageName, pageName);
    
    if (!pageName || typeof pageName !== 'string') {
      console.log('🔍 [CodeAgent.generateComponentName] Using default name');
      return 'GeneratedPage';
    }
    
    console.log('🔍 [CodeAgent.generateComponentName] Processing name...');
    
    const cleaned = pageName.replace(/[^a-zA-Z0-9\s]/g, '');
    console.log('🔍 [CodeAgent.generateComponentName] After replace:', cleaned);
    
    const words = cleaned.split(' ');
    console.log('🔍 [CodeAgent.generateComponentName] After split:', words);
    
    const result = words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    console.log('🔍 [CodeAgent.generateComponentName] Final result:', result);
    return result;
  }

  /**
   * CRITICAL FIX #2: Build optimized code prompt (50% size reduction)
   * Focuses on essential information only to improve AI processing speed
   */
  buildOptimizedCodePrompt(pageSpec, design, content, contentAnalysis, layout = null) {
    const componentName = this.generateComponentName(pageSpec.name);
    
    // CRITICAL FIX #2: Compress content structure for faster processing
    const essentialContent = this.extractEssentialContent(content);
    const essentialDesign = this.extractEssentialDesign(design);
    
    return `Generate a React component optimized for 75%+ UI/UX compliance:

COMPONENT: ${componentName} | ${pageSpec.type} | ${pageSpec.industry}

ESSENTIAL CONTENT (${contentAnalysis.totalElements} elements):
${essentialContent}

DESIGN SYSTEM:
${essentialDesign}

REQUIREMENTS:
- Tailwind CSS with responsive classes (sm:, md:, lg:)
- Hover states on all interactive elements
- Focus rings: focus:ring-2 focus:ring-blue-500
- Modern gradients and glassmorphism
- Form fields: ${pageSpec.formFields?.required?.join(', ') || 'name, email, message'}

UI/UX COMPLIANCE TARGETS:
1. responsiveDesign: Add sm:, md:, lg: to ALL elements
2. interactionStates: Add hover:, focus:, active: to buttons/links
3. colorContrast: Use text-gray-900/100 (not pure black/white)
4. glassmorphism: backdrop-blur-sm bg-white/20 on cards
5. accessibilityBaseline: aria-label and focus rings

Generate complete React component with imports, state, handlers, and full JSX.`;
  }

  /**
   * CRITICAL FIX #2: Extract essential content (80% size reduction)
   * Only includes content that directly affects component structure
   */
  extractEssentialContent(content) {
    if (!content) return 'No content provided';
    
    const essential = [];
    
    if (content.hero) {
      essential.push(`HERO: "${content.hero?.title || content.hero?.headline || 'Hero Title'}" | "${content.hero?.subtitle || content.hero?.subheadline || 'Hero Subtitle'}"`);
    }
    
    if (content.features && content.features.length > 0) {
      const featureCount = Math.min(content.features.length, 4); // Limit to 4 for performance
      essential.push(`FEATURES (${featureCount}): ${content.features.slice(0, 4).map(f => f.title).join(' | ')}`);
    }
    
    if (content.testimonials && content.testimonials.length > 0) {
      essential.push(`TESTIMONIALS (${content.testimonials.length}): Available`);
    }
    
    if (content.stats && content.stats.length > 0) {
      essential.push(`STATS (${content.stats.length}): ${content.stats.map(s => s.value + ' ' + s.label).join(' | ')}`);
    }
    
    if (content.contact) {
      essential.push(`CONTACT: ${content.contact.email || 'contact form'}`);
    }
    
    return essential.join('\n');
  }

  /**
   * CRITICAL FIX #2: Extract essential design (70% size reduction)
   * Only includes design properties that directly affect Tailwind classes
   */
  extractEssentialDesign(design) {
    if (!design) return 'Default modern design';
    
    const essential = [];
    
    // Primary colors for gradients and buttons
    if (design.colorSystem?.primaryGradients) {
      essential.push(`COLORS: ${design.colorSystem.primaryGradients.join(', ')}`);
    } else if (design.visual?.primaryColor) {
      essential.push(`PRIMARY: ${design.visual.primaryColor}`);
    }
    
    // Style for overall approach
    if (design.visual?.style) {
      essential.push(`STYLE: ${design.visual.style}`);
    }
    
    // Typography if specified
    if (design.typography?.headingFont) {
      essential.push(`FONT: ${design.typography.headingFont}`);
    }
    
    return essential.join(' | ') || 'Modern glassmorphism with gradients';
  }

  /**
   * CRITICAL FIX #2: Compress content for context (90% size reduction)
   * Removes verbose data while preserving essential structure
   */
  compressContentForContext(content) {
    if (!content) return null;
    
    return {
      hero: content.hero ? { title: content.hero.title || content.hero.headline, subtitle: content.hero.subtitle || content.hero.subheadline } : null,
      features: content.features ? content.features.slice(0, 3).map(f => ({ title: f.title })) : null,
      testimonials: content.testimonials ? { count: content.testimonials.length } : null,
      stats: content.stats ? content.stats.map(s => ({ value: s.value, label: s.label })) : null,
      contact: content.contact ? { email: content.contact.email } : null,
      _compressed: true
    };
  }

  /**
   * CRITICAL FIX #2: Compress layout for context (80% size reduction)
   * Keeps only structural information needed for code generation
   */
  compressLayoutForContext(layout) {
    if (!layout) return null;
    
    return {
      name: layout.name,
      sections: layout.sections ? layout.sections.map(s => s.name) : [],
      strategy: layout.strategy,
      _compressed: true
    };
  }

  /**
   * CRITICAL: Normalize content structure to handle both nested and flat formats
   * ContentAgent sometimes returns flat structure, this fixes it
   */
  normalizeContentStructure(content) {
    if (!content) {
      console.log('⚠️ [CodeAgent] No content provided, using empty structure');
      return {};
    }

    // If already nested structure (has hero.headline), return as is
    if (content.hero && typeof content.hero === 'object' && content.hero.headline) {
      console.log('✅ [CodeAgent] Content structure already normalized');
      return content;
    }

    // If flat structure (headline at top level), normalize it
    if (content.headline && !content.hero) {
      console.log('🔧 [CodeAgent] Normalizing flat content structure to nested format');
      const normalized = {
        hero: {
          headline: content.headline,
          subheadline: content.subheadline,
          ctaPrimary: content.ctaPrimary,
          ctaSecondary: content.ctaSecondary
        },
        features: content.features || [],
        testimonials: content.testimonials || [],
        stats: content.stats || [],
        socialProof: content.socialProof || {},
        messaging: content.messaging || {}
      };
      
      console.log('✅ [CodeAgent] Content normalized:', {
        hasHero: !!normalized.hero,
        heroHeadline: normalized.hero?.headline || 'none',
        featuresCount: normalized.features.length,
        testimonialsCount: normalized.testimonials.length
      });
      
      return normalized;
    }

    // Return as-is if unknown format
    console.log('⚠️ [CodeAgent] Unknown content format, returning as-is');
    return content;
  }
}

module.exports = { CodeAgent };