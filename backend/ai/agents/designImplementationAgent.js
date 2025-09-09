/**
 * @file backend/ai/agents/designImplementationAgent.js
 * @description Bridge between abstract design specs and concrete Tailwind implementations
 * @purpose Translate design specifications into executable Tailwind classes and custom CSS
 */

const { runAgent } = require('./runAgent');
const debugLogger = require('../shared/DebugLogger');

class DesignImplementationAgent {
  constructor() {
    this.name = 'DesignImplementationAgent';
  }

  /**
   * Main function to translate design specs to concrete Tailwind implementations
   */
  async translateDesignToTailwind(designSpec, pageSpec) {
    console.log(`🎨 [${this.name}] Starting design-to-code translation`);
    
    try {
      return {
        colorClasses: this.generateColorClasses(designSpec.colors),
        typographyClasses: this.generateTypographyClasses(designSpec.typography),
        layoutClasses: this.generateLayoutClasses(designSpec.layout),
        interactionClasses: this.generateInteractionClasses(designSpec.microInteractions),
        customCSS: this.generateCustomCSS(designSpec.effects)
      };
    } catch (error) {
      console.error(`❌ [${this.name}] Error in design translation:`, error);
      throw error;
    }
  }
  
  /**
   * Generate color classes for Tailwind implementation
   */
  generateColorClasses(colors) {
    if (!colors) return {};
    
    return {
      primary: `bg-[${colors.primary}] text-white`,
      secondary: `bg-[${colors.secondary}] text-white`,
      accent: `bg-[${colors.accent}] text-gray-900`,
      gradients: colors.primaryGradients?.map(gradient => 
        `bg-gradient-to-r from-[${gradient.from}] to-[${gradient.to}]`
      ) || []
    };
  }
  
  /**
   * Generate typography classes for Tailwind implementation
   */
  generateTypographyClasses(typography) {
    if (!typography) return {};
    
    return {
      heading: `font-['${typography.headingFont?.replace(/\s+/g, '_')}']`,
      body: `font-['${typography.bodyFont?.replace(/\s+/g, '_')}']`,
      mono: `font-['${typography.monoFont?.replace(/\s+/g, '_')}']`,
      dynamicSizing: typography.dynamicSizing ? 'text-[clamp(1rem,2.5vw,2rem)]' : '',
      fluidTypography: typography.fluidTypography ? 'text-responsive' : ''
    };
  }
  
  /**
   * Generate layout classes for Tailwind implementation
   */
  generateLayoutClasses(layout) {
    if (!layout) return {};
    
    return {
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      section: 'py-12 lg:py-16',
      hero: 'min-h-screen flex items-center justify-center'
    };
  }
  
  /**
   * Generate interaction classes for Tailwind implementation
   */
  generateInteractionClasses(microInteractions) {
    if (!microInteractions) return {};
    
    return {
      button: `transform transition-all ${microInteractions.transitionSpeed} ${microInteractions.easingFunction} ${microInteractions.buttonHover} active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50`,
      card: `transform transition-all ${microInteractions.transitionSpeed} ${microInteractions.easingFunction} ${microInteractions.cardHover} cursor-pointer group`,
      input: `transition-all ${microInteractions.transitionSpeed} ${microInteractions.easingFunction} ${microInteractions.inputFocus} focus:border-primary focus:ring-primary/20`
    };
  }
  
  /**
   * Generate custom CSS for effects that Tailwind can't handle
   */
  generateCustomCSS(effects) {
    if (!effects) return '';
    
    const css = [];
    
    if (effects.glassmorphism?.enabled) {
      css.push(`
        .glass-effect {
          background: ${effects.glassmorphism.background || 'rgba(255, 255, 255, 0.1)'};
          backdrop-filter: blur(${effects.glassmorphism.blur || 10}px);
          -webkit-backdrop-filter: blur(${effects.glassmorphism.blur || 10}px);
          border: 1px solid ${effects.glassmorphism.borderColor || 'rgba(255, 255, 255, 0.2)'};
          border-radius: ${effects.glassmorphism.borderRadius || '12px'};
          box-shadow: ${effects.glassmorphism.shadow || '0 8px 32px rgba(0, 0, 0, 0.1)'};
        }
        
        /* Fallback for browsers without backdrop-filter support */
        @supports not (backdrop-filter: blur(10px)) {
          .glass-effect {
            background: ${effects.glassmorphism.fallbackBackground || 'rgba(255, 255, 255, 0.8)'};
          }
        }
        
        /* Dark mode glassmorphism */
        .dark .glass-effect {
          background: ${effects.glassmorphism.darkBackground || 'rgba(0, 0, 0, 0.1)'};
          border-color: ${effects.glassmorphism.darkBorderColor || 'rgba(255, 255, 255, 0.1)'};
        }
      `);
    }
    
    // Responsive typography if enabled
    if (effects.fluidTypography) {
      css.push(`
        .text-responsive {
          font-size: clamp(1rem, 2.5vw, 2rem);
        }
        
        .text-responsive-lg {
          font-size: clamp(1.5rem, 4vw, 3rem);
        }
        
        .text-responsive-sm {
          font-size: clamp(0.875rem, 1.5vw, 1.125rem);
        }
      `);
    }
    
    return css.join('\n');
  }
  
  /**
   * Validate design implementation against specs
   */
  validateImplementation(implementationClasses, originalDesignSpec) {
    const validation = {
      colorCompliance: this.validateColorImplementation(implementationClasses.colorClasses, originalDesignSpec.colors),
      typographyCompliance: this.validateTypographyImplementation(implementationClasses.typographyClasses, originalDesignSpec.typography),
      interactionCompliance: this.validateInteractionImplementation(implementationClasses.interactionClasses, originalDesignSpec.microInteractions)
    };
    
    const overallScore = (
      validation.colorCompliance.score +
      validation.typographyCompliance.score +
      validation.interactionCompliance.score
    ) / 3;
    
    return {
      overallScore,
      validations: validation,
      recommendations: this.generateImplementationRecommendations(validation)
    };
  }
  
  validateColorImplementation(colorClasses, colorSpec) {
    if (!colorSpec || !colorClasses) return { score: 0, issues: ['Missing color specification'] };
    
    const issues = [];
    let score = 100;
    
    if (!colorClasses.primary.includes(colorSpec.primary)) {
      issues.push('Primary color not properly implemented');
      score -= 25;
    }
    
    if (!colorClasses.secondary.includes(colorSpec.secondary)) {
      issues.push('Secondary color not properly implemented');
      score -= 25;
    }
    
    return { score: Math.max(0, score), issues };
  }
  
  validateTypographyImplementation(typographyClasses, typographySpec) {
    if (!typographySpec || !typographyClasses) return { score: 0, issues: ['Missing typography specification'] };
    
    const issues = [];
    let score = 100;
    
    if (!typographyClasses.heading.includes(typographySpec.headingFont?.replace(/\s+/g, '_'))) {
      issues.push('Heading font not properly implemented');
      score -= 20;
    }
    
    if (!typographyClasses.body.includes(typographySpec.bodyFont?.replace(/\s+/g, '_'))) {
      issues.push('Body font not properly implemented');
      score -= 20;
    }
    
    return { score: Math.max(0, score), issues };
  }
  
  validateInteractionImplementation(interactionClasses, interactionSpec) {
    if (!interactionSpec || !interactionClasses) return { score: 0, issues: ['Missing interaction specification'] };
    
    const issues = [];
    let score = 100;
    
    if (!interactionClasses.button.includes(interactionSpec.buttonHover)) {
      issues.push('Button hover effect not properly implemented');
      score -= 15;
    }
    
    if (!interactionClasses.card.includes(interactionSpec.cardHover)) {
      issues.push('Card hover effect not properly implemented');
      score -= 15;
    }
    
    return { score: Math.max(0, score), issues };
  }
  
  generateImplementationRecommendations(validation) {
    const recommendations = [];
    
    Object.values(validation).forEach(v => {
      if (v.issues && v.issues.length > 0) {
        recommendations.push(...v.issues.map(issue => `Fix: ${issue}`));
      }
    });
    
    return recommendations;
  }
}

module.exports = DesignImplementationAgent;
