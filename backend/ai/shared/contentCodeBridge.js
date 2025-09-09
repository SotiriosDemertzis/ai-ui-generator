/**
 * ContentCodeBridge - Ensures maximum content utilization between agents
 * 
 * Core Functions:
 * - Track content element usage
 * - Generate content-to-code mapping
 * - Validate content integration
 * - Provide specific content injection guidance
 */

class ContentCodeBridge {
  constructor() {
    this.contentMapping = new Map();
    this.utilizationThreshold = 0.80; // 80% minimum utilization
    this.debugMode = true;
    this.version = '2.1'; // Add version property
  }

  /**
   * Analyzes content utilization in generated code
   * @param {Object} contentData - Output from ContentAgent
   * @param {string} generatedCode - Output from CodeAgent
   * @returns {Object} Analysis results with utilization metrics
   */
  analyzeContentUtilization(contentData, generatedCode) {
    const analysis = {
      totalElements: 0,
      usedElements: 0,
      missingElements: [],
      utilizationRate: 0,
      criticalMissing: [],
      recommendations: []
    };

    // Extract all content elements
    const contentElements = this.extractContentElements(contentData);
    analysis.totalElements = contentElements.length;

    // Check each element in generated code
    contentElements.forEach(element => {
      const isUsed = this.checkElementUsage(element, generatedCode);
      if (isUsed) {
        analysis.usedElements++;
      } else {
        analysis.missingElements.push(element);
        
        // Mark critical elements (hero, primary CTAs, key features)
        if (this.isCriticalElement(element)) {
          analysis.criticalMissing.push(element);
        }
      }
    });

    analysis.utilizationRate = analysis.usedElements / analysis.totalElements;
    
    // Generate specific recommendations
    analysis.recommendations = this.generateUtilizationRecommendations(analysis);

    if (this.debugMode) {
      console.log(`🔍 [ContentCodeBridge] Utilization Analysis:`);
      console.log(`   📊 Total Elements: ${analysis.totalElements}`);
      console.log(`   ✅ Used Elements: ${analysis.usedElements}`);
      console.log(`   📈 Utilization Rate: ${(analysis.utilizationRate * 100).toFixed(1)}%`);
      console.log(`   ⚠️ Critical Missing: ${analysis.criticalMissing ? analysis.criticalMissing.length : 0}`);
    }

    return analysis;
  }

  /**
   * Extracts all content elements from ContentAgent output
   * @param {Object} contentData - Structured content from ContentAgent
   * @returns {Array} Array of content elements with metadata
   */
  extractContentElements(contentData) {
    const elements = [];
    
    // Hero section elements
    if (contentData.hero) {
      if (contentData.hero.title) {
        elements.push({
          type: 'hero_title',
          content: contentData.hero.title,
          priority: 'critical',
          section: 'hero'
        });
      }
      if (contentData.hero.subtitle) {
        elements.push({
          type: 'hero_subtitle',
          content: contentData.hero.subtitle,
          priority: 'high',
          section: 'hero'
        });
      }
      if (contentData.hero.ctaButtons) {
        contentData.hero.ctaButtons.forEach((cta, index) => {
          if (cta && (cta.text || typeof cta === 'string')) { // Only add if CTA text exists
            elements.push({
              type: `hero_cta_${index}`,
              content: typeof cta === 'string' ? cta : cta.text, // Extract text from object or use string directly
              priority: 'critical',
              section: 'hero'
            });
          }
        });
      }
    }

    // Features section
    if (contentData.features) {
      contentData.features.forEach((feature, index) => {
        if (feature.title) {
          elements.push({
            type: `feature_title_${index}`,
            content: feature.title,
            priority: 'high',
            section: 'features'
          });
        }
        if (feature.description) {
          elements.push({
            type: `feature_description_${index}`,
            content: feature.description,
            priority: 'medium',
            section: 'features'
          });
        }
      });
    }

    // Testimonials
    if (contentData.testimonials) {
      contentData.testimonials.forEach((testimonial, index) => {
        if (testimonial.quote) {
          elements.push({
            type: `testimonial_quote_${index}`,
            content: testimonial.quote,
            priority: 'high',
            section: 'testimonials'
          });
        }
        if (testimonial.author) {
          elements.push({
            type: `testimonial_author_${index}`,
            content: testimonial.author,
            priority: 'medium',
            section: 'testimonials'
          });
        }
      });
    }

    // Statistics
    if (contentData.stats) {
      contentData.stats.forEach((stat, index) => {
        if (stat.value) {
          elements.push({
            type: `stat_value_${index}`,
            content: stat.value,
            priority: 'high',
            section: 'stats'
          });
        }
        if (stat.label) {
          elements.push({
            type: `stat_label_${index}`,
            content: stat.label,
            priority: 'high',
            section: 'stats'
          });
        }
      });
    }

    return elements;
  }

  /**
   * Checks if a content element is used in generated code
   * @param {Object} element - Content element to check
   * @param {string} code - Generated code to search
   * @returns {boolean} True if element is used
   */
  checkElementUsage(element, code) {
    // Safety check for element.content
    if (!element || !element.content || typeof element.content !== 'string') {
      console.warn('⚠️ [ContentCodeBridge] Invalid element content:', element);
      return false;
    }
    
    // Only debug when explicitly enabled and not in production
    if (process.env.DEBUG_CONTENT_BRIDGE && process.env.NODE_ENV !== 'production') {
      console.log(`🔍 [ContentCodeBridge-DEBUG] Checking ${element.type}: "${element.content?.substring(0, 50)}..."`);
    }
    
    // Simplified placeholder detection  
    const originalContent = (typeof element.content === 'string' ? element.content : JSON.stringify(element.content)).trim();
    
    // Exception for valid statistical values (numbers with %, +, /, etc.)
    const isValidStatValue = (
      element.type.includes('stat_value') && 
      this.isValidStatisticalValue(originalContent)
    );
    
    // Simple placeholder patterns that are definitely invalid
    const commonPlaceholders = [
      'Lorem ipsum', 'John Doe', 'Jane Doe', 'Acme Corp', 'Example Inc',
      '[PLACEHOLDER]', '[TODO]', '[CONTENT]', '[Your Company]', '[Company Name]'
    ];
    
    const hasPlaceholderMarkers = (
      !isValidStatValue && (
        originalContent.length < 2 || // Too short content
        commonPlaceholders.some(placeholder => originalContent.includes(placeholder)) ||
        /^\[.*\]$/.test(originalContent) || // Entirely bracketed content
        /^(placeholder|sample|example)/i.test(originalContent) // Common placeholder prefixes
      )
    );
    
    if (hasPlaceholderMarkers) {
      if (this.debugMode) {
        console.log(`🔍 [ContentCodeBridge] Detected placeholder: ${element.type}`);
      }
      return false; // Treat placeholder content as unused
    }
    
    // Remove placeholder markers and normalize content
    const normalizedContent = originalContent
      .replace(/\/\*.*?\*\//g, '') // Remove comment blocks
      .replace(/\[.*?\]/g, '') // Remove bracket placeholders
      .trim();
    
    if (normalizedContent.length < 3) return false;

    // Enhanced content matching with flexible patterns
    let isUsed = false;
    
    // 1. Direct exact match (case-insensitive)
    const searchPattern = normalizedContent
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s+/g, '\\s*');
    const exactRegex = new RegExp(searchPattern, 'i');
    isUsed = exactRegex.test(code);
    
    // 2. Enhanced matching for statistical values (numbers with symbols)
    if (!isUsed && element.type.includes('stat_value')) {
      // For stat values, try more flexible matching
      const statPatterns = [
        // Exact match with word boundaries
        new RegExp(`\\b${normalizedContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
        // Match within quotes or property values
        new RegExp(`["']${normalizedContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'gi'),
        // Match in JSX prop values
        new RegExp(`value\\s*=\\s*["']${normalizedContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'gi'),
        // Match in template literals
        new RegExp('`[^`]*' + normalizedContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^`]*`', 'gi')
      ];
      
      for (const pattern of statPatterns) {
        if (pattern.test(code)) {
          isUsed = true;
          if (this.debugMode) {
            console.log(`🔍 [ContentCodeBridge] Statistical value matched via pattern for ${element.type}: "${normalizedContent}"`);
          }
          break;
        }
      }
    }
    
    // 3. If not found, try partial matching for longer content
    if (!isUsed && normalizedContent.length > 20) {
      // Try matching key words from the content
      const keyWords = normalizedContent.split(/\s+/).filter(word => word.length > 3);
      const keyWordMatches = keyWords.filter(word => {
        const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return wordRegex.test(code);
      });
      
      // If we find most of the key words, consider it used
      if (keyWordMatches.length >= Math.ceil(keyWords.length * 0.6)) {
        isUsed = true;
        if (this.debugMode) {
          console.log(`🔍 [ContentCodeBridge] Partial match for ${element.type}: ${keyWordMatches.length}/${keyWords.length} key words found`);
        }
      }
    }
    
    // 3. Special handling for stats - check if the value is used even if label isn't
    if (!isUsed && element.type.includes('stat_label')) {
      const statIndex = element.type.replace('stat_label_', '');
      const valueRegex = new RegExp(`stat_value_${statIndex}|statistic.*value|value.*${statIndex}`, 'i');
      if (valueRegex.test(code)) {
        isUsed = true;
        if (this.debugMode) {
          console.log(`🔍 [ContentCodeBridge] Stat label linked to value usage: ${element.type}`);
        }
      }
    }
    
    if (this.debugMode && process.env.DEBUG_CONTENT_BRIDGE && process.env.NODE_ENV !== 'production') {
      console.log(`🔍 [ContentCodeBridge] ${element.type}: ${isUsed ? '✅ USED' : '❌ UNUSED'}`);
    }
    
    return isUsed;
  }

  /**
   * Determines if an element is critical for the page
   * @param {Object} element - Content element to check
   * @returns {boolean} True if critical
   */
  isCriticalElement(element) {
    const criticalTypes = [
      'hero_title', 'hero_subtitle', 'hero_cta_0',
      'feature_title_0', 'feature_title_1', 'feature_title_2',
      'stat_value_0', 'testimonial_quote_0'
    ];
    
    return criticalTypes.includes(element.type) || 
           element.priority === 'critical';
  }

  /**
   * Generates specific recommendations for improving content utilization
   * @param {Object} analysis - Utilization analysis results
   * @returns {Array} Array of actionable recommendations
   */
  generateUtilizationRecommendations(analysis) {
    const recommendations = [];

    if (analysis.utilizationRate < this.utilizationThreshold) {
      recommendations.push({
        type: 'critical',
        message: `Content utilization is ${(analysis.utilizationRate * 100).toFixed(1)}%, target is ${this.utilizationThreshold * 100}%`,
        action: 'Review CodeAgent prompt to emphasize content integration'
      });
    }

    // Critical missing elements
    if (analysis.criticalMissing && analysis.criticalMissing.length > 0) {
      analysis.criticalMissing.forEach(element => {
        const contentPreview = element.content ? (typeof element.content === 'string' ? element.content.substring(0, 50) : JSON.stringify(element.content).substring(0, 50)) : '[undefined content]';
        recommendations.push({
          type: 'critical',
          message: `Missing critical ${element.type}: "${contentPreview}..."`,
          action: `Add ${element.type} to ${element.section} section of generated component`
        });
      });
    }

    // Section-specific recommendations
    const sectionsWithMissing = this.groupMissingBySection(analysis.missingElements);
    Object.keys(sectionsWithMissing).forEach(section => {
      const count = sectionsWithMissing[section].length;
      if (count > 2) {
        recommendations.push({
          type: 'high',
          message: `${section} section is missing ${count} content elements`,
          action: `Enhance ${section} section with provided content elements`
        });
      }
    });

    return recommendations;
  }

  /**
   * Groups missing elements by section for analysis
   */
  groupMissingBySection(missingElements) {
    return missingElements.reduce((groups, element) => {
      const section = element.section || 'unknown';
      if (!groups[section]) groups[section] = [];
      groups[section].push(element);
      return groups;
    }, {});
  }

  /**
   * Generates content mapping for CodeAgent to use
   * @param {Object} contentData - Content from ContentAgent
   * @returns {Object} Structured mapping for code generation
   */
  generateContentMapping(contentData) {
    const mapping = {
      hero: {
        title: contentData.hero?.title || "Default Title",
        subtitle: contentData.hero?.subtitle || "Default Subtitle",
        primaryCTA: contentData.hero?.ctaButtons?.[0] || "Get Started",
        secondaryCTA: contentData.hero?.ctaButtons?.[1] || "Learn More"
      },
      features: (contentData.features || []).map(feature => ({
        title: feature.title,
        description: feature.description,
        icon: feature.icon || "default"
      })),
      testimonials: (contentData.testimonials || []).map(testimonial => ({
        quote: testimonial.quote,
        author: testimonial.author,
        company: testimonial.company,
        rating: testimonial.rating || 5
      })),
      stats: (contentData.stats || []).map(stat => ({
        value: stat.value,
        label: stat.label,
        trend: stat.trend
      })),
      socialProof: contentData.socialProof || [],
      companyInfo: contentData.companyInfo || {}
    };

    return mapping;
  }

  /**
   * Validates content integration and provides detailed feedback
   * @param {Object} contentData - Original content
   * @param {string} generatedCode - Generated React code
   * @returns {Object} Validation results with pass/fail and specific issues
   */
  validateContentIntegration(contentData, generatedCode) {
    const analysis = this.analyzeContentUtilization(contentData, generatedCode);
    const mapping = this.generateContentMapping(contentData);
    
    const validation = {
      passed: analysis.utilizationRate >= this.utilizationThreshold,
      score: Math.round(analysis.utilizationRate * 100),
      issues: [],
      criticalIssues: [],
      recommendations: analysis.recommendations,
      detailedReport: {
        totalElements: analysis.totalElements,
        usedElements: analysis.usedElements,
        missingElements: analysis.missingElements.length,
        utilizationRate: analysis.utilizationRate
      }
    };

    // Categorize issues
    analysis.criticalMissing.forEach(element => {
      validation.criticalIssues.push({
        type: 'missing_critical_content',
        element: element.type,
        content: element.content ? (typeof element.content === 'string' ? element.content.substring(0, 100) : JSON.stringify(element.content).substring(0, 100)) : '[undefined content]',
        section: element.section
      });
    });

    analysis.missingElements.forEach(element => {
      if (!validation.criticalIssues.find(issue => issue.element === element.type)) {
        validation.issues.push({
          type: 'missing_content',
          element: element.type,
          content: element.content ? (typeof element.content === 'string' ? element.content.substring(0, 100) : JSON.stringify(element.content).substring(0, 100)) : '[undefined content]',
          section: element.section,
          priority: element.priority
        });
      }
    });

    return validation;
  }

  // Keep legacy methods for backward compatibility
  /**
   * Create integration mapping between content strategy and code structure
   * Legacy method - redirects to new implementation
   */
  async createContentCodeMapping(contentStrategy, pageSpec, designSystem) {
    console.log('🌉 [ContentCodeBridge] Creating content mapping with improved utilization tracking...');
    
    try {
      const mapping = this.generateContentMapping(contentStrategy);
      console.log('✅ [ContentCodeBridge] Created content-code mapping');
      return mapping;
    } catch (error) {
      console.error('❌ [ContentCodeBridge] Error creating mapping:', error.message);
      return this.createFallbackMapping(contentStrategy, pageSpec);
    }
  }
  
  /**
   * Build AI prompt for intelligent content-code mapping
   */
  buildContentMappingPrompt(contentStrategy, pageSpec, designSystem) {
    return `You are an expert frontend architect specializing in content integration. Create an intelligent mapping between content strategy and React components.

**CONTENT STRATEGY:**
${JSON.stringify(contentStrategy, null, 2)}

**PAGE SPECIFICATION:**
${JSON.stringify(pageSpec, null, 2)}

**DESIGN SYSTEM:**
${JSON.stringify(designSystem, null, 2)}

**YOUR TASK:**
Create a comprehensive mapping that ensures ALL content from the content strategy is actually used in the final React components. Map each piece of content to specific component implementations.

**MAPPING REQUIREMENTS:**
1. Map hero content to compelling hero components with backgrounds and CTAs
2. Map features to feature grids/sections with icons and descriptions  
3. Map testimonials to testimonial carousels or sections
4. Map stats to animated counter components
5. Map FAQ content to accordion or grid components
6. Map products/services to card layouts
7. Ensure form content uses appropriate labels and placeholders
8. Map social proof to trust indicator components

**RESPONSE FORMAT (JSON only):**
{
  "heroMapping": {
    "content": {
      "headline": "from contentStrategy.hero.headline",
      "subheadline": "from contentStrategy.hero.subheadline", 
      "ctaPrimary": "from contentStrategy.hero.ctaPrimary",
      "ctaSecondary": "from contentStrategy.hero.ctaSecondary"
    },
    "implementation": {
      "component": "HeroSection",
      "layout": "full-width-gradient-background",
      "styling": "modern glassmorphism with animated elements",
      "tailwindComponents": ["Custom headings", "Custom buttons", "Grid layout with divs"],
      "customElements": ["gradient background", "floating elements"]
    }
  },
  "featuresMapping": {
    "content": "contentStrategy.features array",
    "implementation": {
      "component": "FeatureGrid", 
      "layout": "3-column responsive grid",
      "styling": "cards with hover effects and icons",
      "tailwindComponents": ["Card divs", "Grid layout", "Custom typography"],
      "iconIntegration": "lucide-react icons for each feature"
    }
  },
  "testimonialsMapping": {
    "content": "contentStrategy.testimonials array",
    "implementation": {
      "component": "TestimonialCarousel",
      "layout": "sliding carousel with avatars",
      "styling": "glassmorphism cards with ratings",
      "tailwindComponents": ["Custom carousel", "Card divs", "Star ratings", "Avatar images"]
    }
  },
  "statsMapping": {
    "content": "contentStrategy.stats array", 
    "implementation": {
      "component": "StatsSection",
      "layout": "horizontal stats bar",
      "styling": "animated counters with trend indicators",
      "tailwindComponents": ["Custom statistics", "Grid layout with divs"],
      "animations": "count-up animation on scroll"
    }
  },
  "formMapping": {
    "content": {
      "fields": "from pageSpec.formFields",
      "validation": "from pageSpec.formFields.validation",
      "labels": "user-friendly labels for each field"
    },
    "implementation": {
      "component": "EnhancedContactForm",
      "layout": "vertical form with floating labels", 
      "styling": "modern inputs with validation feedback",
      "tailwindComponents": ["HTML forms", "HTML inputs", "Custom buttons", "Alert divs"],
      "validation": "real-time validation with error messages"
    }
  },
  "companyInfoMapping": {
    "content": {
      "address": "infer from context or use placeholder",
      "phone": "contact phone number",
      "email": "contact email",
      "socialLinks": "social media profiles"
    },
    "implementation": {
      "component": "CompanyInfoSection",
      "layout": "contact details with map integration",
      "styling": "clean layout with icons",
      "tailwindComponents": ["Custom description lists", "Flexbox spacing", "Custom typography"]
    }
  },
  "contentUtilization": {
    "totalContentElements": 0,
    "mappedElements": 0,
    "utilizationPercentage": 0,
    "unmappedContent": []
  },
  "integrationInstructions": [
    "specific instructions for CodeAgent on how to implement each mapped section",
    "ensure all mapped content appears in final component",
    "use appropriate Ant Design components for each section",
    "implement responsive design for all mapped components"
  ]
}

Create the comprehensive content-code mapping now:`;
  }
  
  /**
   * Generate enhanced code instructions for CodeAgent
   */
  async generateCodeIntegrationInstructions(contentMapping, pageSpec) {
    console.log('📋 [ContentCodeBridge] Generating code integration instructions...');
    
    try {
      const instructionsPrompt = `You are a senior React developer. Based on this content-code mapping, create detailed implementation instructions for the CodeAgent.

**CONTENT MAPPING:**
${JSON.stringify(contentMapping, null, 2)}

**PAGE SPECIFICATION:**
${JSON.stringify(pageSpec, null, 2)}

**GENERATE DETAILED INSTRUCTIONS:**
Create step-by-step implementation instructions that ensure the CodeAgent will:
1. Use ALL mapped content in the final component
2. Implement each section with appropriate Ant Design components
3. Apply modern styling and interactions
4. Ensure responsive design
5. Include proper accessibility features

**RESPONSE FORMAT (JSON only):**
{
  "componentStructure": "detailed component hierarchy",
  "sectionInstructions": {
    "hero": "specific implementation steps for hero section",
    "features": "specific implementation steps for features",
    "testimonials": "specific implementation steps for testimonials", 
    "stats": "specific implementation steps for stats",
    "form": "specific implementation steps for form",
    "companyInfo": "specific implementation steps for company info"
  },
  "stylingInstructions": "modern styling approach with Ant Design and Tailwind",
  "contentIntegration": "ensure all content from mapping is used",
  "responsiveDesign": "mobile-first responsive implementation",
  "accessibilityFeatures": "ARIA labels and semantic HTML instructions"
}

Generate implementation instructions:`;

      const result = await runAgent('ContentCodeBridge-Instructions', instructionsPrompt, {}, {
        maxTokens: 10000, // Sufficient for detailed code integration instructions
        temperature: 0.3
      });
      
      if (result.success) {
        const parseResult = parseJSONResponse(result.response);
        if (parseResult.success) {
          console.log('✅ [ContentCodeBridge] Generated code integration instructions');
          return parseResult.data;
        }
      }
      
      console.warn('⚠️ [ContentCodeBridge] Using fallback instructions');
      return this.createFallbackInstructions(contentMapping, pageSpec);
      
    } catch (error) {
      console.error('❌ [ContentCodeBridge] Error generating instructions:', error.message);
      return this.createFallbackInstructions(contentMapping, pageSpec);
    }
  }
  
  /**
   * Validate content usage in generated code
   */
  async validateContentUsage(generatedCode, contentMapping, originalContent) {
    console.log('🔍 [ContentCodeBridge] Validating content usage in generated code...');
    
    try {
      const validationPrompt = `You are a QA engineer. Analyze this generated React code to verify that content from the mapping is actually used.

**GENERATED CODE:**
\`\`\`jsx
${generatedCode}
\`\`\`

**CONTENT MAPPING:**
${JSON.stringify(contentMapping, null, 2)}

**ORIGINAL CONTENT STRATEGY:**
${JSON.stringify(originalContent, null, 2)}

**VALIDATION TASKS:**
1. Check if hero content (headlines, CTAs) appears in the code
2. Check if features from content strategy are implemented
3. Check if testimonials are included in the component
4. Check if stats/numbers are displayed
5. Check if form fields match the specification
6. Calculate overall content utilization percentage

**RESPONSE FORMAT (JSON only):**
{
  "contentUsageScore": 0-100,
  "usedContent": {
    "hero": true|false,
    "features": true|false, 
    "testimonials": true|false,
    "stats": true|false,
    "formFields": true|false,
    "companyInfo": true|false
  },
  "missingContent": ["list of content elements not found in code"],
  "suggestions": ["specific improvements to increase content usage"],
  "isContentRich": true|false
}

Analyze and respond:`;

      const result = await runAgent('ContentCodeBridge-Validator', validationPrompt, {}, {
        maxTokens: 6000, // Sufficient for comprehensive validation analysis
        temperature: 0.2
      });
      
      if (result.success) {
        const parseResult = parseJSONResponse(result.response);
        if (parseResult.success) {
          console.log(`✅ [ContentCodeBridge] Content usage validation: ${parseResult.data.contentUsageScore}% utilized`);
          return parseResult.data;
        }
      }
      
      return { contentUsageScore: 0, error: 'Validation failed' };
      
    } catch (error) {
      console.error('❌ [ContentCodeBridge] Content validation error:', error.message);
      return { contentUsageScore: 0, error: error.message };
    }
  }
  
  /**
   * Create fallback mapping when AI fails
   */
  createFallbackMapping(contentStrategy, pageSpec) {
    console.warn('⚠️ [ContentCodeBridge] Using fallback content mapping');
    
    return {
      heroMapping: {
        content: {
          headline: contentStrategy?.hero?.headline || 'Welcome to Our Platform',
          subheadline: contentStrategy?.hero?.subheadline || 'Discover amazing solutions',
          ctaPrimary: contentStrategy?.hero?.ctaPrimary || 'Get Started'
        },
        implementation: {
          component: 'HeroSection',
          layout: 'centered-with-background'
        }
      },
      formMapping: {
        content: {
          fields: pageSpec?.formFields?.required || ['name', 'email', 'message']
        },
        implementation: {
          component: 'ContactForm',
          layout: 'vertical-form'
        }
      },
      contentUtilization: {
        utilizationPercentage: 50,
        note: 'Fallback mapping - limited content integration'
      }
    };
  }
  
  /**
   * Create fallback instructions when AI fails
   */
  createFallbackInstructions(contentMapping, pageSpec) {
    return {
      componentStructure: 'Layout with Header, Content, and Footer',
      sectionInstructions: {
        form: 'Create form with all specified fields and validation',
        hero: 'Add hero section with compelling headline',
        companyInfo: 'Include basic company contact information'
      },
      stylingInstructions: 'Use Ant Design components with modern styling',
      contentIntegration: 'Integrate available content from mapping',
      note: 'Fallback instructions - basic implementation'
    };
  }

  /**
   * Validates if a string represents a valid statistical value
   * @param {string} value - Value to validate
   * @returns {boolean} True if valid statistical value
   */
  isValidStatisticalValue(value) {
    if (!value || typeof value !== 'string') return false;
    
    const trimmed = value.trim();
    
    // Common statistical value patterns
    const validPatterns = [
      /^\d+%$/,                          // 95%
      /^\d+\.\d+%$/,                     // 95.5%
      /^\d+\+$/,                         // 20+
      /^\d+k\+?$/i,                      // 50k, 50k+
      /^\d+(\.\d+)?\/\d+$/,             // 4.8/5, 9/10
      /^\d{1,3}(,\d{3})*\+?$/,          // 50,000, 50,000+
      /^\$\d+(\.\d+)?[kmb]?$/i,         // $5m, $100k, $25.5b
      /^[<>≥≤]\s*\d+(\.\d+)?[%kmb]?$/i, // >95%, <100k
      /^\d+(\.\d+)?[x×]$/i,             // 10x, 2.5×
      /^\d+(\.\d+)?[kmb]$/i,            // 5m, 100k, 2.5b
      /^#\d+$/,                         // #1
      /^\d+:\d+$/,                      // 24:7, 10:1
      /^\d+-\d+$/,                      // 18-24, 2020-2025
      /^top\s*\d+%?$/i,                 // Top 10, Top 5%
      /^\d+(\.\d+)?\s*(years?|months?|days?|hours?)\+?$/i // 20+ years, 5.5 years
    ];
    
    // Check if it matches any valid pattern
    const matchesPattern = validPatterns.some(pattern => pattern.test(trimmed));
    
    // Additional check: ensure it's not a placeholder term
    const placeholderTerms = [
      'lorem', 'ipsum', 'placeholder', 'example', 'sample', 
      'todo', 'insert', 'john doe', 'jane doe', 'acme'
    ];
    const hasPlaceholderTerms = placeholderTerms.some(term => 
      trimmed.toLowerCase().includes(term)
    );
    
    // Additional check: ensure it doesn't contain bracket patterns
    const hasBrackets = /\[.*\]/.test(trimmed);
    
    return matchesPattern && !hasPlaceholderTerms && !hasBrackets;
  }
}

module.exports = { ContentCodeBridge };