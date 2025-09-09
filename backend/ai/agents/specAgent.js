/**
 * @file backend/ai/agents/specAgent.js
 * @description Enhanced Spec Agent - Multi-pass requirement extraction with validation
 * @version 3.0 - Optimized with comprehensive requirement extraction protocol
 */

const { runAgent, parseJSONResponse } = require('./runAgent');
const { InputValidator } = require('../validation/InputValidator');

class SpecAgent {
  constructor() {
    this.agentType = 'SpecAgent';
    this.version = '3.0';
    this.expertise = 'Multi-pass requirement extraction, specification validation, completeness verification';
    this.inputValidator = new InputValidator();
    console.log('🔧 [SpecAgent] Initialized v3.0');
  }

  /**
   * Generate complete page specification using multi-pass AI extraction
   */
  async generateSpec(userPrompt) {
    console.log('\n� [SpecAgent] ================================');
    console.log('�📋 [SpecAgent] Starting multi-pass requirement extraction...');
    console.log('📝 [SpecAgent] Input prompt:', {
      length: userPrompt?.length || 0,
      preview: userPrompt?.substring(0, 200) + '...' || 'undefined',
      type: typeof userPrompt
    });
    
    // Phase 1: Input validation and analysis
    console.log('🔍 [SpecAgent] Phase 1: Input validation and analysis...');
    const inputValidation = this.inputValidator.validateSpecInput(userPrompt);
    console.log('✅ [SpecAgent] Input validation result:', {
      isValid: inputValidation.isValid,
      extractedFields: inputValidation.extractedElements.formFields,
      extractedSections: inputValidation.extractedElements.sections,
      extractedIndustries: inputValidation.extractedElements.industries,
      totalIssues: inputValidation.issues?.length || 0
    });
    
    if (inputValidation.issues?.length > 0) {
      console.log('⚠️ [SpecAgent] Validation issues found:', inputValidation.issues);
    }
    
    if (!inputValidation.isValid) {
      console.error('❌ [SpecAgent] Input validation failed!');
      console.error('❌ [SpecAgent] Issues:', inputValidation.issues);
      return {
        success: false,
        error: `Input validation failed: ${inputValidation.issues.join(', ')}`,
        pageSpec: null
      };
    }
    
    // Phase 2: Enhanced multi-pass prompt generation
    console.log('🔍 [SpecAgent] Phase 2: Building enhanced prompt...');
    const prompt = this.buildEnhancedSpecPrompt(userPrompt, inputValidation);
    console.log('� [SpecAgent] Generated prompt:', {
      length: prompt.length,
      hasUserRequest: prompt.includes(userPrompt),
      hasDetectedElements: prompt.includes('PRE-DETECTED ELEMENTS')
    });
    
    console.log('🚀 [SpecAgent] Phase 3: Calling AI with enhanced prompt...');
    const aiStartTime = Date.now();
    
    const result = await runAgent('SpecAgent', prompt, { inputValidation }, {
      maxTokens: 32000,
      temperature: 0.7
    });
    
    const aiEndTime = Date.now();
    console.log('📡 [SpecAgent] AI response received:', {
      success: result.success,
      responseLength: result.response?.length || 0,
      executionTime: `${aiEndTime - aiStartTime}ms`,
      hasError: !!result.error,
      errorPreview: result.error?.substring(0, 100) || null
    });
    
    if (result.response) {
      console.log('📄 [SpecAgent] AI response preview:', typeof result.response === 'string' ? result.response.substring(0, 300) + '...' : JSON.stringify(result.response).substring(0, 300) + '...');
    }
    
    if (!result.success) {
      console.error('❌ [SpecAgent] AI call failed!');
      console.error('❌ [SpecAgent] Error details:', result.error);
      return {
        success: false,
        error: `SpecAgent AI call failed: ${result.error}`,
        pageSpec: null
      };
    }
    
    // Phase 4: Parse and validate response
    console.log('🔍 [SpecAgent] Phase 4: Parsing AI response...');
    // Check if response is already parsed (new runAgent behavior) or needs parsing
    let parseResult;
    if (typeof result.response === 'object' && result.response !== null) {
      // Already parsed
      parseResult = { success: true, data: result.response };
    } else {
      // Still needs parsing
      parseResult = parseJSONResponse(result.response);
    }
    console.log('🔍 [SpecAgent] JSON parsing result:', { 
      success: parseResult.success,
      hasData: !!parseResult.data,
      errorMessage: parseResult.error || null
    });
    
    if (parseResult.data) {
      console.log('📊 [SpecAgent] Parsed spec structure:', {
        name: parseResult.data.name,
        type: parseResult.data.type,
        industry: parseResult.data.industry,
        complexity: parseResult.data.complexity,
        sectionsCount: parseResult.data.sections?.length || 0,
        hasFormFields: !!parseResult.data.formFields,
        hasRequirements: !!parseResult.data.requirements
      });
    }
    
    if (!parseResult.success) {
      console.error('❌ [SpecAgent] JSON parsing failed!');
      console.error('❌ [SpecAgent] Parse error:', parseResult.error);
      console.error('❌ [SpecAgent] Raw response preview:', result.response?.substring(0, 500) + '...');
      return {
        success: false,
        error: `Failed to parse AI response: ${parseResult.error}`,
        pageSpec: null
      };
    }
    
    // Phase 5: Multi-layered validation with AI-powered completeness check
    console.log('� [SpecAgent] Phase 5: Starting completeness validation...');
    const validationStartTime = Date.now();
    const pageSpec = await this.validateSpecWithCompleteness(parseResult.data, userPrompt, inputValidation);
    const validationEndTime = Date.now();
    
    console.log('🔬 [SpecAgent] Completeness validation completed:', {
      executionTime: `${validationEndTime - validationStartTime}ms`,
      isValid: !!pageSpec,
      completenessScore: pageSpec?._validation?.completenessScore || 'unknown'
    });
    
    if (!pageSpec) {
      console.error('❌ [SpecAgent] Spec validation failed! Generated spec does not meet quality standards');
      return {
        success: false,
        error: 'AI generated invalid specification',
        pageSpec: null
      };
    }
    
    console.log('✅ [SpecAgent] SUCCESS! Specification generation completed');
    console.log('📊 [SpecAgent] Final spec summary:', {
      name: pageSpec.name,
      type: pageSpec.type,
      industry: pageSpec.industry,
      complexity: pageSpec.complexity,
      completenessScore: pageSpec._validation?.completenessScore || 'unknown',
      sectionsCount: pageSpec.sections?.length || 0,
      formFieldsRequired: pageSpec.formFields?.required?.length || 0,
      formFieldsOptional: pageSpec.formFields?.optional?.length || 0,
      requirementsCount: pageSpec.requirements?.length || 0
    });
    console.log('📋 [SpecAgent] ================================\n');
    
    return {
      success: true,
      pageSpec: pageSpec,
      metadata: {
        inputValidation,
        completenessScore: pageSpec._validation?.completenessScore,
        extractedElements: inputValidation.extractedElements
      }
    };
  }
  
  /**
   * Build enhanced multi-pass prompt for comprehensive requirement extraction
   */
  buildEnhancedSpecPrompt(userPrompt, inputValidation) {
    const detectedFields = inputValidation.extractedElements.formFields;
    const detectedSections = inputValidation.extractedElements.sections;
    const detectedIndustries = inputValidation.extractedElements.industries;
    
    console.log('🔧 [SpecAgent] Building prompt with detected elements:', JSON.stringify({
      fields: detectedFields.length,
      sections: detectedSections.length,
      industries: detectedIndustries.length
    }));
    
    return `You are 'RequirementMaster AI', the industry's most sophisticated requirement extraction and specification generation system. You combine deep analytical expertise with systematic validation protocols to ensure 100% requirement capture.

# 🚨 ENHANCED REQUIREMENT EXTRACTION PROTOCOL (3-PASS SYSTEM)

## PASS 1: EXPLICIT REQUIREMENT DETECTION
Read the user prompt 3 times and extract EVERY mentioned:
- Form field: ${detectedFields.length > 0 ? detectedFields.join(', ') : 'NONE DETECTED - look harder'}
- Page section: ${detectedSections.length > 0 ? detectedSections.join(', ') : 'NONE DETECTED - look harder'}
- Industry context: ${detectedIndustries.length > 0 ? detectedIndustries.join(', ') : 'NONE DETECTED - infer from context'}
- Functional requirements (validation, submission, navigation, etc.)
- Design preferences (modern, professional, colorful, etc.)

## PASS 2: IMPLICIT REQUIREMENT INFERENCE
Based on detected elements, add standard requirements:
${this.buildImplicitRequirements(inputValidation)}

## PASS 3: COMPLETENESS VALIDATION
Verify specification includes:
- All explicitly mentioned elements from Pass 1
- All standard elements for page type from Pass 2  
- Realistic complexity assessment (1-10 scale)
- Industry-appropriate content strategy

## SELF-CONSISTENCY CHECK
Before finalizing, answer these questions:
- Did I capture EVERY form field mentioned in the prompt?
- Did I include EVERY section requested by the user?
- Does the complexity level match the scope of requirements?
- Is the industry context accurate for the requested page?
- Are all functional requirements captured?

Only proceed if ALL answers are YES.

**USER REQUEST:**
"${userPrompt}"

**PRE-DETECTED ELEMENTS FOR VALIDATION:**
- Form Fields: ${detectedFields.join(', ') || 'None detected'}
- Sections: ${detectedSections.join(', ') || 'None detected'} 
- Industries: ${detectedIndustries.join(', ') || 'None detected'}

**ENHANCED SPECIFICATION FORMAT (JSON only):**
🚨 CRITICAL: You MUST include ALL fields below. Missing fields will cause system failure.

{
  "name": "Specific descriptive page name matching user intent",
  "type": "landing|dashboard|ecommerce|portfolio|blog|contact|app|custom",
  "industry": "specific industry category from context",
  "complexity": 1-10,
  "description": "Detailed description capturing user's exact vision",
  "styleGuide": {
    "tone": "professional|friendly|corporate|modern|playful|authoritative",
    "brandVoice": "Describe the brand's personality",
    "targetAudience": "Detailed user persona from context",
    "keywords": ["list", "of", "relevant", "keywords", "from", "prompt"]
  },
  "sections": [
    {
      "type": "hero|features|testimonials|pricing|contact_form|about|footer|custom",
      "name": "Section Name",
      "priority": "high|medium|low",
      "required": true|false,
      "description": "What this section accomplishes for the user",
      "components": ["list_every_mentioned_component", "button", "input", "text", "image"]
    }
  ],
  "formFields": {
    "required": ["list_all_explicitly_mentioned_fields"],
    "optional": ["infer_commonly_needed_fields"],
    "validation": ["required", "email", "phone", "minLength", "pattern"]
  },
  "requirements": [
    "Modern UI/UX", 
    "Responsive design", 
    "Form validation",
    "Accessibility compliance",
    "list_all_mentioned_requirements"
  ],
  "designExpectations": {
    "style": "modern|minimal|bold|elegant|tech|corporate|creative",
    "visualElements": ["gradients", "shadows", "animations", "cards", "buttons"],
    "interactivity": ["hover_effects", "form_validation", "animations", "transitions"],
    "colorScheme": "blue|green|purple|orange|red|neutral|gradient|custom"
  },
  "contentStrategy": {
    "headlines": ["extract_from_user_request_or_infer_compelling_options"],
    "callsToAction": ["derive_from_context", "Contact Us", "Get Started"],
    "keyMessages": ["extract_main_value_propositions", "key_benefits", "unique_selling_points"]
  },
  "functionalRequirements": [
    "list_all_mentioned_functionality",
    "form_submission",
    "validation",
    "error_handling"
  ]
}

🚨 MANDATORY REQUIREMENTS CHECKLIST - Your response MUST include:
✅ "sections" array with at least 3-5 sections appropriate for the page type
✅ Each section must have type, name, priority, required, description, components  
✅ For e-commerce: include hero, features, pricing, testimonials, contact_form sections
✅ All other required fields: name, type, industry, complexity, description, styleGuide, formFields, requirements, designExpectations, contentStrategy, functionalRequirements

Generate the comprehensive JSON specification now (sections field is MANDATORY):`;
  }

  /**
   * Build implicit requirements based on detected elements
   */
  buildImplicitRequirements(inputValidation) {
    const requirements = [];
    const { formFields, sections, pageTypes, industries } = inputValidation.extractedElements;
    
    console.log('🧠 [SpecAgent] Building implicit requirements from:', {
      formFields: formFields.length,
      sections: sections.length,
      industries: industries.length
    });
    
    // Form-based requirements
    if (formFields.length > 0) {
      requirements.push('- Contact forms MUST include: proper validation, error handling, success feedback');
      requirements.push('- Email fields MUST include: email format validation');
      requirements.push('- Phone fields MUST include: phone number formatting and validation');
    }
    
    // Section-based requirements
    if (sections.includes('testimonial') || sections.includes('testimonials')) {
      requirements.push('- Testimonial sections MUST include: customer names, ratings, company info');
    }
    
    if (sections.includes('hero')) {
      requirements.push('- Hero sections MUST include: compelling headline, call-to-action, visual hierarchy');
    }
    
    // Industry-based requirements
    if (industries.includes('healthcare')) {
      requirements.push('- Healthcare sites MUST include: HIPAA compliance, accessibility standards');
    }
    
    if (industries.includes('finance') || industries.includes('fintech')) {
      requirements.push('- Financial sites MUST include: security badges, compliance statements');
    }
    
    console.log('📝 [SpecAgent] Generated', requirements.length, 'implicit requirements');
    return requirements.length > 0 ? requirements.join('\n') : '- Standard web accessibility and usability requirements';
  }
  
  /**
   * Enhanced specification validation with completeness checking
   */
  async validateSpecWithCompleteness(spec, originalPrompt, inputValidation) {
    console.log('🔬 [SpecAgent] Validating spec completeness...');
    
    if (!spec || typeof spec !== 'object') {
      console.error('❌ [SpecAgent] Invalid spec format');
      return null;
    }
    
    // Basic structural validation with graceful degradation
    const missingFields = [];
    if (!spec.name) missingFields.push('name');
    if (!spec.type) missingFields.push('type');
    
    if (missingFields.length > 0) {
      console.error('❌ [SpecAgent] Missing critical fields:', {
        hasName: !!spec.name,
        hasType: !!spec.type,
        hasSections: !!spec.sections,
        missingFields
      });
      return null;
    }
    
    // Graceful degradation: Add default sections if missing
    if (!spec.sections) {
      console.warn('⚠️ [SpecAgent] Missing sections field, adding default sections based on page type');
      spec.sections = this.generateDefaultSections(spec.type, spec.industry || 'general');
    }
    
    // Use output validator for comprehensive validation
    const { OutputValidator } = require('../validation/OutputValidator');
    const outputValidator = new OutputValidator();
    const validation = outputValidator.validateSpecOutput(spec, originalPrompt, inputValidation);
    
    console.log('📊 [SpecAgent] Basic validation:', {
      valid: validation.isValid,
      completeness: validation.completenessScore || 0,
      issues: validation.issues?.length || 0
    });
    
    // AI-powered completeness validation
    try {
      console.log('🤖 [SpecAgent] Starting AI completeness validation...');
      const aiValidationResult = await this.validateCompletenessWithAI(spec, originalPrompt);
      
      if (aiValidationResult.success && aiValidationResult.enhancedSpec) {
        console.log('✅ [SpecAgent] AI validation passed:', {
          completeness: aiValidationResult.completenessScore,
          issues: aiValidationResult.issues?.length || 0
        });
        
        // Add validation metadata to spec
        aiValidationResult.enhancedSpec._validation = {
          completenessScore: aiValidationResult.completenessScore,
          missingElements: validation.missingElements || [],
          issues: validation.issues || []
        };
        
        return aiValidationResult.enhancedSpec;
      } else {
        console.warn('⚠️ [SpecAgent] AI validation found gaps:', aiValidationResult.issues?.length || 0);
        
        // Add validation metadata to original spec
        spec._validation = {
          completenessScore: validation.completenessScore,
          missingElements: validation.missingElements || [],
          issues: validation.issues || []
        };
        
        return spec;
      }
    } catch (error) {
      console.warn('⚠️ [SpecAgent] AI validation error:', error.message);
      
      // Add basic validation metadata
      spec._validation = {
        completenessScore: validation.completenessScore,
        missingElements: validation.missingElements || [],
        issues: validation.issues || []
      };
      
      return spec;
    }
  }
  
  /**
   * Use AI to validate specification completeness against original prompt
   */
  async validateCompletenessWithAI(spec, originalPrompt) {
    const validationPrompt = `You are a quality assurance expert. Analyze this specification against the original user request to ensure completeness.

**ORIGINAL USER REQUEST:**
"${originalPrompt}"

**GENERATED SPECIFICATION:**
${JSON.stringify(spec, null, 2)}

**VALIDATION TASKS:**
1. Check if ALL mentioned form fields are captured in formFields.required
2. Check if ALL requested sections are included
3. Check if ALL functional requirements are captured
4. Identify any missing elements that the user explicitly requested
5. Suggest improvements for completeness

**RESPONSE FORMAT (JSON only):**
{
  "completenessScore": 0-100,
  "missingElements": ["list any elements from original request not captured"],
  "suggestions": ["specific improvements to make spec more complete"],
  "isComplete": true|false,
  "enhancedSpec": {
    ...enhanced_specification_with_missing_elements_added...
  },
  "issues": ["list of specific issues found"]
}

Analyze and respond with JSON:`;

    try {
      console.log('🤖 [SpecAgent] Calling AI validator...');
      const result = await runAgent('SpecAgent-Validator', validationPrompt, {}, {
        maxTokens: 4000,
        temperature: 0.3
      });
      
      console.log('📡 [SpecAgent] AI validator response:', {
        success: result.success,
        responseLength: result.response?.length || 0
      });
      
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      const parseResult = parseJSONResponse(result.response);
      console.log('🔍 [SpecAgent] AI validator parse:', { success: parseResult.success });
      
      if (!parseResult.success) {
        return { success: false, error: parseResult.error };
      }
      
      return {
        success: true,
        completenessScore: parseResult.data.completenessScore || 0,
        enhancedSpec: parseResult.data.enhancedSpec || spec,
        issues: parseResult.data.issues || [],
        missingElements: parseResult.data.missingElements || []
      };
      
    } catch (error) {
      console.error('❌ [SpecAgent] AI validation error:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Generate default sections based on page type and industry (fallback mechanism)
   */
  generateDefaultSections(pageType, industry) {
    console.log('🔧 [SpecAgent] Generating default sections for type:', pageType, 'industry:', industry);
    
    const defaultSections = {
      ecommerce: [
        { type: 'hero', name: 'Product Hero', priority: 'high', required: true, 
          description: 'Main product showcase with key information', 
          components: ['heading', 'product_image', 'price', 'add_to_cart_button'] },
        { type: 'features', name: 'Product Features', priority: 'high', required: true, 
          description: 'Key product features and specifications', 
          components: ['feature_list', 'icons', 'descriptions'] },
        { type: 'pricing', name: 'Pricing Information', priority: 'high', required: true, 
          description: 'Product pricing and purchase options', 
          components: ['price_display', 'discount_info', 'purchase_button'] },
        { type: 'testimonials', name: 'Customer Reviews', priority: 'medium', required: false, 
          description: 'Customer reviews and testimonials', 
          components: ['review_cards', 'ratings', 'customer_photos'] }
      ],
      landing: [
        { type: 'hero', name: 'Hero Section', priority: 'high', required: true, 
          description: 'Main landing section with value proposition', 
          components: ['headline', 'subheading', 'cta_button', 'hero_image'] },
        { type: 'features', name: 'Features Section', priority: 'high', required: true, 
          description: 'Key features and benefits', 
          components: ['feature_cards', 'icons', 'descriptions'] },
        { type: 'contact_form', name: 'Contact Form', priority: 'medium', required: false, 
          description: 'Contact or signup form', 
          components: ['form_fields', 'submit_button', 'validation'] }
      ],
      portfolio: [
        { type: 'hero', name: 'Introduction', priority: 'high', required: true, 
          description: 'Personal/professional introduction', 
          components: ['profile_image', 'bio', 'contact_info'] },
        { type: 'about', name: 'About Section', priority: 'high', required: true, 
          description: 'Detailed background and experience', 
          components: ['biography', 'skills', 'experience_timeline'] },
        { type: 'portfolio', name: 'Portfolio Gallery', priority: 'high', required: true, 
          description: 'Work samples and projects', 
          components: ['project_cards', 'images', 'descriptions', 'links'] }
      ]
    };
    
    return defaultSections[pageType] || defaultSections.landing;
  }

}

module.exports = { SpecAgent };