/**
 * @file backend/ai/agents/layoutAgent.js
 * @description Layout Agent - Creates structured layouts with Tailwind CSS based on page specs and design
 * @version 1.0 - New Architecture Implementation
 */

const { runAgent, parseJSONResponse } = require('./runAgent');

/**
 * LayoutAgent - Generates structured layouts with multiple options
 * Creates the foundational layout structure before detailed coding
 */
class LayoutAgent {
  constructor() {
    this.version = '1.0';
    this.agentType = 'LayoutAgent';
    this.layoutTemplates = this.initializeLayoutTemplates();
  }

  /**
   * Generate layout based on page spec and design
   * Can be called with separate parameters OR a single context object
   */
  async generateLayout(pageSpec, design, generationContext = {}) {
    // Handle both calling patterns: generateLayout(context) OR generateLayout(pageSpec, design, context)
    if (typeof pageSpec === 'object' && pageSpec.pageSpec && !design) {
      // Called with single context object: generateLayout(context)
      const context = pageSpec;
      pageSpec = context.pageSpec;
      design = context.design;
      generationContext = context;
    }
    
    console.log('[LayoutAgent] Generating structured layout...');
    
    try {
      // Analyze requirements for layout selection
      const analysisStartTime = Date.now();
      const layoutAnalysis = this.analyzeLayoutRequirements(pageSpec, design);
      const analysisEndTime = Date.now();
      console.log(`[LayoutAgent] Layout analysis completed in ${analysisEndTime - analysisStartTime}ms`);

      // Generate layout options
      const optionsStartTime = Date.now();
      const layoutOptions = this.generateLayoutOptions(layoutAnalysis);
      const optionsEndTime = Date.now();
      console.log(`[LayoutAgent] Layout options generated in ${optionsEndTime - optionsStartTime}ms`);

      // Select best layout and create structure
      const selectionStartTime = Date.now();
      const selectedLayout = this.selectOptimalLayout(layoutOptions, pageSpec, design);
      const selectionEndTime = Date.now();
      console.log(`[LayoutAgent] Layout selection completed in ${selectionEndTime - selectionStartTime}ms`);

      // Build detailed layout structure
      const structureStartTime = Date.now();
      const layoutStructure = await this.buildLayoutStructure(selectedLayout, pageSpec, design, generationContext);
      const structureEndTime = Date.now();
      console.log(`[LayoutAgent] Layout structure built in ${structureEndTime - structureStartTime}ms`);

      const result = {
        success: true,
        layout: {
          name: selectedLayout.name,
          type: selectedLayout.type,
          structure: layoutStructure,
          components: layoutStructure.components,
          sections: layoutStructure.sections,
          responsive: layoutStructure.responsive,
          tailwindClasses: layoutStructure.tailwindClasses,
          _metadata: {
            analysisUsed: layoutAnalysis,
            optionsConsidered: layoutOptions.length,
            selectionReason: selectedLayout.reason
          }
        },
        timestamp: new Date().toISOString()
      };

      console.log('[LayoutAgent] Layout generation completed successfully.');
      return result;

    } catch (error) {
      console.error('[LayoutAgent] Layout generation failed:', error.message);
      return {
        success: false,
        error: error.message,
        layout: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze page requirements to determine optimal layout approach
   */
  analyzeLayoutRequirements(pageSpec, design) {
    const analysis = {
      pageType: pageSpec.type || 'unknown',
      complexity: pageSpec.complexity || 5,
      industry: pageSpec.industry || 'general',
      sections: pageSpec.sections || [],
      designStyle: design.type || design.designType || 'modern',
      recommendedLayouts: []
    };

    // Determine recommended layouts based on page type
    switch (analysis.pageType.toLowerCase()) {
      case 'landing':
        analysis.recommendedLayouts = ['hero-focused', 'conversion-optimized', 'storytelling'];
        break;
      case 'dashboard':
        analysis.recommendedLayouts = ['sidebar-grid', 'card-grid', 'data-focused'];
        break;
      case 'ecommerce':
        analysis.recommendedLayouts = ['product-showcase', 'category-grid', 'sales-funnel'];
        break;
      case 'portfolio':
        analysis.recommendedLayouts = ['gallery-focused', 'project-showcase', 'creative-grid'];
        break;
      case 'blog':
        analysis.recommendedLayouts = ['content-focused', 'magazine-style', 'minimal-blog'];
        break;
      case 'contact':
        analysis.recommendedLayouts = ['form-focused', 'contact-centered', 'info-blocks'];
        break;
      case 'corporate':
        analysis.recommendedLayouts = ['professional-blocks', 'service-focused', 'trust-building'];
        break;
      default:
        analysis.recommendedLayouts = ['flexible-blocks', 'content-sections', 'modern-grid'];
    }

    // Adjust based on complexity
    if (analysis.complexity >= 8) {
      analysis.recommendedLayouts = analysis.recommendedLayouts.map(layout => layout + '-complex');
    } else if (analysis.complexity <= 3) {
      analysis.recommendedLayouts = analysis.recommendedLayouts.map(layout => layout + '-minimal');
    }

    return analysis;
  }

  /**
   * Generate multiple layout options based on analysis
   */
  generateLayoutOptions(analysis) {
    const options = [];

    analysis.recommendedLayouts.forEach(layoutType => {
      const template = this.getLayoutTemplate(layoutType);
      if (template) {
        options.push({
          name: template.name,
          type: layoutType,
          template: template,
          score: this.calculateLayoutScore(template, analysis),
          reason: template.description
        });
      }
    });

    // Sort by score (highest first)
    return options.sort((a, b) => b.score - a.score);
  }

  /**
   * Select the optimal layout based on requirements
   */
  selectOptimalLayout(options, pageSpec, design) {
    if (options.length === 0) {
      return this.getFallbackLayout();
    }

    // Return highest scored layout
    return options[0];
  }

  /**
   * Build detailed layout structure with Tailwind CSS
   */
  async buildLayoutStructure(selectedLayout, pageSpec, design, generationContext) {
    const prompt = this.buildLayoutPrompt(selectedLayout, pageSpec, design, generationContext);
    
    console.log('🤖 [LayoutAgent] Generating detailed layout structure...');
    const aiResult = await runAgent('LayoutAgent', prompt, generationContext, {
      temperature: 0.7,
      maxTokens: 3000
    });

    if (!aiResult.success) {
      throw new Error(`Layout structure generation failed: ${aiResult.error}`);
    }

    // Parse the AI response using robust parseJSONResponse
    let layoutStructure;
    console.log('🔍 [LayoutAgent] Parsing AI response using robust JSON parser...');
    
    const parseResult = parseJSONResponse(aiResult.response);
    
    if (parseResult.success && parseResult.data) {
      layoutStructure = parseResult.data;
      console.log('✅ [LayoutAgent] Successfully parsed AI response as JSON');
      
      if (parseResult.warning) {
        console.warn(`⚠️ [LayoutAgent] Parse warning: ${parseResult.warning}`);
      }
    } else {
      console.warn('⚠️ [LayoutAgent] Failed to parse AI response as JSON, using fallback structure');
      console.warn(`⚠️ [LayoutAgent] Parse error: ${parseResult.error || 'Unknown error'}`);
      layoutStructure = this.getFallbackStructure(selectedLayout, pageSpec);
    }

    // Ensure required structure
    return this.validateAndEnhanceStructure(layoutStructure, selectedLayout, pageSpec);
  }

  /**
   * Build AI prompt for layout structure generation
   */
  buildLayoutPrompt(selectedLayout, pageSpec, design, generationContext) {
    return `You are a Layout Architecture Specialist creating structured layouts with Tailwind CSS.

**TASK**: Create a detailed layout structure based on the selected layout template and requirements.

**SELECTED LAYOUT**: ${selectedLayout.name}
Template: ${JSON.stringify(selectedLayout.template, null, 2)}

**PAGE SPECIFICATIONS**:
- Type: ${pageSpec.type}
- Industry: ${pageSpec.industry}
- Complexity: ${pageSpec.complexity}/10
- Sections Required: ${pageSpec.sections ? pageSpec.sections.map(s => s.name).join(', ') : 'Not specified'}

**DESIGN CONTEXT**:
- Style: ${design.type || design.designType}
- Visual Style: ${design.visual?.style || 'modern'}

**REQUIREMENTS**:
1. Create responsive layout structure using Tailwind CSS
2. Define clear sections and components hierarchy
3. Include specific Tailwind classes for each section
4. Ensure mobile-first responsive design
5. Follow modern UI/UX patterns

**OUTPUT FORMAT** (JSON):
{
  "sections": [
    {
      "name": "header",
      "type": "navigation",
      "tailwindClasses": "bg-white shadow-sm border-b border-gray-200",
      "responsiveClasses": {
        "mobile": "px-4 py-3",
        "tablet": "px-6 py-4", 
        "desktop": "px-8 py-5"
      },
      "components": ["logo", "navigation", "cta-button"],
      "layout": "flex justify-between items-center"
    }
  ],
  "components": [
    {
      "name": "hero-section", 
      "section": "hero",
      "type": "content-block",
      "tailwindClasses": "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
      "responsiveClasses": {
        "mobile": "px-4 py-12 text-center",
        "tablet": "px-8 py-16",
        "desktop": "px-12 py-20"
      },
      "layout": "flex flex-col items-center justify-center min-h-screen"
    }
  ],
  "responsive": true,
  "tailwindClasses": {
    "container": "min-h-screen bg-gray-50",
    "wrapper": "max-w-7xl mx-auto",
    "section": "py-12 px-4 sm:px-6 lg:px-8"
  }
}

Generate the complete layout structure JSON:`;
  }

  /**
   * Initialize layout templates
   */
  initializeLayoutTemplates() {
    return {
      'hero-focused': {
        name: 'Hero-Focused Landing',
        description: 'Large hero section with conversion focus',
        sections: ['hero', 'features', 'testimonials', 'cta'],
        complexity: 6,
        responsive: true
      },
      'conversion-optimized': {
        name: 'Conversion-Optimized',
        description: 'Optimized for maximum conversions',
        sections: ['hero', 'benefits', 'social-proof', 'pricing', 'cta'],
        complexity: 7,
        responsive: true
      },
      'storytelling': {
        name: 'Storytelling Layout',
        description: 'Narrative-driven content flow',
        sections: ['intro', 'story', 'journey', 'outcome', 'cta'],
        complexity: 8,
        responsive: true
      },
      'sidebar-grid': {
        name: 'Sidebar Grid Dashboard',
        description: 'Side navigation with main content grid',
        sections: ['sidebar', 'header', 'main-grid', 'footer'],
        complexity: 8,
        responsive: true
      },
      'card-grid': {
        name: 'Card Grid Layout',
        description: 'Modern card-based grid system',
        sections: ['header', 'filters', 'card-grid', 'pagination'],
        complexity: 6,
        responsive: true
      },
      'product-showcase': {
        name: 'Product Showcase',
        description: 'E-commerce product display layout',
        sections: ['hero', 'categories', 'featured-products', 'testimonials'],
        complexity: 7,
        responsive: true
      },
      'flexible-blocks': {
        name: 'Flexible Content Blocks',
        description: 'Adaptable content block system',
        sections: ['header', 'content-blocks', 'sidebar', 'footer'],
        complexity: 5,
        responsive: true
      }
    };
  }

  /**
   * Get layout template by type
   */
  getLayoutTemplate(layoutType) {
    // Remove complexity suffixes for template lookup
    const baseType = layoutType.replace(/-complex$|-minimal$/, '');
    
    // Return exact match if exists
    if (this.layoutTemplates[baseType]) {
      return this.layoutTemplates[baseType];
    }
    
    // Provide distinct fallbacks based on layout type
    const fallbackMap = {
      'content-sections': {
        name: 'Content Sections Layout',
        type: 'content-focused',
        description: 'Multi-section content layout with clear hierarchy',
        complexity: 5,
        responsive: true
      },
      'modern-grid': {
        name: 'Modern Grid Layout',
        type: 'grid-based',
        description: 'CSS Grid-based modern layout with clean spacing',
        complexity: 6,
        responsive: true
      },
      'form-focused': {
        name: 'Form-Focused Layout',
        type: 'form-centric',
        description: 'Layout optimized for form interactions and contact',
        complexity: 4,
        responsive: true
      },
      'contact-centered': {
        name: 'Contact-Centered Layout',
        type: 'contact-optimized',
        description: 'Layout designed for contact and communication pages',
        complexity: 5,
        responsive: true
      },
      'info-blocks': {
        name: 'Info Blocks Layout',
        type: 'information-blocks',
        description: 'Block-based layout for information display',
        complexity: 4,
        responsive: true
      }
    };
    
    // Return specific fallback or default flexible-blocks
    return fallbackMap[baseType] || this.layoutTemplates['flexible-blocks'];
  }

  /**
   * Calculate layout suitability score
   */
  calculateLayoutScore(template, analysis) {
    let score = 50; // Base score

    // Page type match
    if (analysis.pageType === 'landing' && template.name.includes('Landing')) score += 30;
    if (analysis.pageType === 'dashboard' && template.name.includes('Dashboard')) score += 30;
    if (analysis.pageType === 'ecommerce' && template.name.includes('Product')) score += 30;

    // Complexity match
    const complexityDiff = Math.abs(template.complexity - analysis.complexity);
    score -= complexityDiff * 5;

    // Responsive requirement
    if (template.responsive) score += 20;

    return Math.max(0, score);
  }

  /**
   * Get fallback layout for error cases
   */
  getFallbackLayout() {
    return {
      name: 'Basic Flexible Layout',
      type: 'flexible-blocks',
      template: this.layoutTemplates['flexible-blocks'],
      score: 60,
      reason: 'Fallback layout for error recovery'
    };
  }

  /**
   * Get fallback structure for AI parsing failures
   */
  getFallbackStructure(selectedLayout, pageSpec) {
    return {
      sections: [
        {
          name: 'header',
          type: 'navigation',
          tailwindClasses: 'bg-white shadow-sm',
          responsiveClasses: {
            mobile: 'px-4 py-3',
            desktop: 'px-8 py-5'
          },
          components: ['logo', 'navigation'],
          layout: 'flex justify-between items-center'
        },
        {
          name: 'main',
          type: 'content',
          tailwindClasses: 'py-12',
          responsiveClasses: {
            mobile: 'px-4',
            desktop: 'px-8'
          },
          components: ['content-blocks'],
          layout: 'container mx-auto'
        }
      ],
      components: [
        {
          name: 'content-block',
          section: 'main',
          type: 'content',
          tailwindClasses: 'bg-white rounded-lg shadow-sm p-6',
          responsiveClasses: {
            mobile: 'mb-4',
            desktop: 'mb-8'
          },
          layout: 'flex flex-col'
        }
      ],
      responsive: true,
      tailwindClasses: {
        container: 'min-h-screen bg-gray-50',
        wrapper: 'max-w-7xl mx-auto',
        section: 'py-8 px-4'
      }
    };
  }

  /**
   * Validate and enhance the generated structure
   */
  validateAndEnhanceStructure(structure, selectedLayout, pageSpec) {
    // Ensure required fields
    if (!structure.sections) structure.sections = [];
    if (!structure.components) structure.components = [];
    if (!structure.responsive) structure.responsive = true;
    if (!structure.tailwindClasses) structure.tailwindClasses = {};

    // Ensure minimum sections for layout type
    if (structure.sections.length === 0) {
      structure.sections = this.getFallbackStructure(selectedLayout, pageSpec).sections;
    }

    // Ensure responsive classes exist
    structure.sections.forEach(section => {
      if (!section.responsiveClasses) {
        section.responsiveClasses = {
          mobile: 'px-4 py-3',
          tablet: 'px-6 py-4',
          desktop: 'px-8 py-5'
        };
      }
    });

    structure.components.forEach(component => {
      if (!component.responsiveClasses) {
        component.responsiveClasses = {
          mobile: 'mb-4',
          tablet: 'mb-6',
          desktop: 'mb-8'
        };
      }
    });

    return structure;
  }
}

module.exports = { LayoutAgent };