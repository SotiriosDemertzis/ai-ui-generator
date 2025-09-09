/**
 * @file backend/ai/validation/OutputValidator.js
 * @description Output validation framework for agent outputs
 */

class OutputValidator {
  /**
   * Validate SpecAgent output
   */
  validateSpecOutput(pageSpec, originalPrompt, inputValidation) {
    const validation = {
      isValid: true,
      issues: [],
      completenessScore: 0,
      missingElements: []
    };
    
    // Required fields validation
    const requiredFields = ['name', 'type', 'industry', 'complexity', 'sections'];
    for (const field of requiredFields) {
      if (!pageSpec[field]) {
        validation.issues.push(`Missing required field: ${field}`);
        validation.isValid = false;
      }
    }
    
    // Form fields completeness check
    if (inputValidation?.extractedElements?.formFields?.length > 0) {
      const detectedFields = inputValidation.extractedElements.formFields;
      const specFields = pageSpec.formFields?.required || [];
      
      for (const field of detectedFields) {
        if (!specFields.includes(field) && !this.isFieldVariation(field, specFields)) {
          validation.missingElements.push(`Form field: ${field}`);
        }
      }
    }
    
    // Sections completeness check  
    if (inputValidation?.extractedElements?.sections?.length > 0) {
      const detectedSections = inputValidation.extractedElements.sections;
      const specSections = pageSpec.sections?.map(s => s.name?.toLowerCase()) || [];
      
      for (const section of detectedSections) {
        if (!specSections.includes(section) && !this.isSectionVariation(section, specSections)) {
          validation.missingElements.push(`Section: ${section}`);
        }
      }
    }
    
    // Calculate completeness score
    validation.completenessScore = this.calculateCompleteness(pageSpec, inputValidation);
    
    return validation;
  }
  
  /**
   * Validate ContentAgent output
   */
  validateContentOutput(content) {
    const validation = {
      isValid: true,
      issues: [],
      authenticityScore: 0,
      placeholderContent: []
    };
    
    const schema = {
      required: ['hero', 'features', 'messaging', 'socialProof'],
      optional: ['testimonials', 'stats', 'faqs', 'pricing'],
      quality: {
        minFeatures: 3,
        minTestimonials: 2,
        minStats: 3,
        authenticityCheck: true
      }
    };
    
    // Required sections check
    for (const section of schema.required) {
      if (!content[section]) {
        validation.issues.push(`Missing required section: ${section}`);
        validation.isValid = false;
      }
    }
    
    // Content authenticity check
    const authenticityResult = this.checkContentAuthenticity(content);
    validation.authenticityScore = authenticityResult.score;
    validation.placeholderContent = authenticityResult.placeholders;
    
    if (validation.placeholderContent.length > 0) {
      validation.issues.push(`Placeholder content detected: ${validation.placeholderContent.join(', ')}`);
    }
    
    // Quality requirements check
    if (content.features && content.features.length < schema.quality.minFeatures) {
      validation.issues.push(`Insufficient features: ${content.features.length} < ${schema.quality.minFeatures}`);
    }
    
    if (content.testimonials && content.testimonials.length < schema.quality.minTestimonials) {
      validation.issues.push(`Insufficient testimonials: ${content.testimonials.length} < ${schema.quality.minTestimonials}`);
    }
    
    return validation;
  }
  
  /**
   * Validate CodeAgent output
   */
  validateCodeOutput(code, content, pageSpec) {
    const validation = {
      isValid: true,
      issues: [],
      contentUtilization: 0,
      missingContent: [],
      syntaxValid: true
    };
    
    // Basic syntax validation
    if (!code.reactCode || typeof code.reactCode !== 'string') {
      validation.issues.push('Invalid or missing React code');
      validation.isValid = false;
      return validation;
    }
    
    // Import/Export validation
    if (!code.reactCode.includes('import') || !code.reactCode.includes('export')) {
      validation.issues.push('Missing proper import/export statements');
      validation.syntaxValid = false;
    }
    
    // Content utilization validation
    if (content) {
      const utilizationResult = this.calculateContentUtilization(code.reactCode, content);
      validation.contentUtilization = utilizationResult.percentage;
      validation.missingContent = utilizationResult.missing;
      
      if (validation.contentUtilization < 80) {
        validation.issues.push(`Low content utilization: ${validation.contentUtilization}%`);
      }
    }
    
    // Form fields validation
    if (pageSpec?.formFields?.required) {
      for (const field of pageSpec.formFields.required) {
        if (!this.hasFormField(code.reactCode, field)) {
          validation.issues.push(`Missing required form field: ${field}`);
        }
      }
    }
    
    return validation;
  }
  
  /**
   * Check content authenticity
   */
  checkContentAuthenticity(content) {
    // Enhanced placeholder detection with context awareness
    const criticalPlaceholderPatterns = [
      { pattern: /lorem ipsum/gi, name: 'lorem ipsum', severity: 'high' },
      { pattern: /consectetur adipiscing/gi, name: 'lorem ipsum variants', severity: 'high' },
      { pattern: /dolor sit amet/gi, name: 'lorem ipsum variants', severity: 'high' },
      { pattern: /\{\{.*?\}\}/g, name: 'template placeholders', severity: 'high' },
      // Very specific placeholder patterns that are definitely placeholders
      { pattern: /\[(?:insert\s+|add\s+|todo\s*:|placeholder\s*:).*?\]/gi, name: 'explicit placeholders', severity: 'high' },
      { pattern: /\[your\s+(?:company|name|business|product)\]/gi, name: 'template company placeholders', severity: 'high' },
    ];

    const mediumPlaceholderPatterns = [
      { pattern: /john doe/gi, name: 'john doe', severity: 'medium' },
      { pattern: /jane doe/gi, name: 'jane doe', severity: 'medium' },
      { pattern: /acme(?:\s+corp|corporation)?\b/gi, name: 'acme', severity: 'medium' },
      { pattern: /example(?:\s+inc|company)?\b/gi, name: 'example', severity: 'medium' }
    ];

    const lowPlaceholderPatterns = [
      { pattern: /\bplaceholder\b/gi, name: 'placeholder', severity: 'low' },
      { pattern: /\bsample\b/gi, name: 'sample', severity: 'low' },
      { pattern: /your\s+(?:name|company|business)\b/gi, name: 'generic placeholders', severity: 'low' }
    ];

    const allPatterns = [...criticalPlaceholderPatterns, ...mediumPlaceholderPatterns, ...lowPlaceholderPatterns];
    
    const contentText = JSON.stringify(content).toLowerCase();
    const placeholders = [];
    const detectedPatterns = [];
    let totalSeverityScore = 0;
    
    for (const { pattern, name, severity } of allPatterns) {
      const matches = contentText.match(pattern);
      if (matches && matches.length > 0) {
        // Only report high and medium severity issues as actual problems
        if (severity === 'high' || severity === 'medium') {
          placeholders.push(name);
          detectedPatterns.push({ name, severity, matches: matches.slice(0, 2) });
        }
        
        // Weight severity for scoring
        const severityWeight = severity === 'high' ? 25 : severity === 'medium' ? 15 : 5;
        totalSeverityScore += severityWeight * matches.length;
      }
    }
    
    // Enhanced debugging - only log if high/medium severity issues detected
    if (detectedPatterns.length > 0) {
      console.log('🔍 [OutputValidator] Detected placeholder patterns:', JSON.stringify(detectedPatterns, null, 2));
      console.log('🔍 [OutputValidator] Content text (first 300 chars):', contentText.substring(0, 300));
      console.log(`🔍 [OutputValidator] Severity analysis: ${detectedPatterns.length} issues, total severity score: ${totalSeverityScore}`);
    }
    
    // Enhanced authenticity score calculation based on severity
    const score = Math.max(0, 100 - Math.min(totalSeverityScore, 85));
    
    return { score, placeholders, detectedPatterns };
  }
  
  /**
   * Calculate content utilization percentage
   */
  calculateContentUtilization(reactCode, content) {
    const utilization = {
      total: 0,
      used: 0,
      missing: [],
      percentage: 0
    };
    
    if (!content) return utilization;
    
    const codeText = reactCode.toLowerCase();
    
    // Check hero content
    if (content.hero) {
      utilization.total++;
      if (content.hero.headline && codeText.includes(content.hero.headline.toLowerCase())) {
        utilization.used++;
      } else {
        utilization.missing.push('Hero headline');
      }
    }
    
    // Check features
    if (content.features && Array.isArray(content.features)) {
      content.features.forEach((feature, index) => {
        utilization.total++;
        const featureTitle = feature.title || feature.name;
        if (featureTitle && codeText.includes(featureTitle.toLowerCase())) {
          utilization.used++;
        } else {
          utilization.missing.push(`Feature: ${featureTitle || `#${index + 1}`}`);
        }
      });
    }
    
    // Check testimonials
    if (content.testimonials && Array.isArray(content.testimonials)) {
      content.testimonials.forEach((testimonial, index) => {
        utilization.total++;
        const author = testimonial.author || testimonial.name;
        if (author && codeText.includes(author.toLowerCase())) {
          utilization.used++;
        } else {
          utilization.missing.push(`Testimonial: ${author || `#${index + 1}`}`);
        }
      });
    }
    
    // Check stats
    if (content.stats && Array.isArray(content.stats)) {
      content.stats.forEach((stat, index) => {
        utilization.total++;
        const statValue = stat.value || stat.metric;
        if (statValue && codeText.includes(String(statValue))) {
          utilization.used++;
        } else {
          utilization.missing.push(`Stat: ${statValue || `#${index + 1}`}`);
        }
      });
    }
    
    // Calculate percentage
    utilization.percentage = utilization.total > 0 ? 
      Math.round((utilization.used / utilization.total) * 100) : 0;
    
    return utilization;
  }
  
  /**
   * Calculate specification completeness
   */
  calculateCompleteness(pageSpec, inputValidation) {
    let score = 0;
    let maxScore = 0;
    
    // Basic structure completeness (40 points)
    const basicFields = ['name', 'type', 'industry', 'complexity', 'sections'];
    for (const field of basicFields) {
      maxScore += 8;
      if (pageSpec[field]) score += 8;
    }
    
    // Form fields completeness (30 points)
    if (inputValidation?.extractedElements?.formFields?.length > 0) {
      maxScore += 30;
      const detectedFields = inputValidation.extractedElements.formFields;
      const specFields = pageSpec.formFields?.required || [];
      const matchedFields = detectedFields.filter(field => 
        specFields.includes(field) || this.isFieldVariation(field, specFields)
      );
      score += Math.min(30, (matchedFields.length / detectedFields.length) * 30);
    }
    
    // Sections completeness (30 points)
    if (inputValidation?.extractedElements?.sections?.length > 0) {
      maxScore += 30;
      const detectedSections = inputValidation.extractedElements.sections;
      const specSections = pageSpec.sections?.map(s => s.name?.toLowerCase()) || [];
      const matchedSections = detectedSections.filter(section => 
        specSections.includes(section) || this.isSectionVariation(section, specSections)
      );
      score += Math.min(30, (matchedSections.length / detectedSections.length) * 30);
    }
    
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }
  
  /**
   * Check if field is a variation of existing fields
   */
  isFieldVariation(field, specFields) {
    const fieldVariations = {
      'name': ['first_name', 'last_name', 'full_name'],
      'phone': ['telephone', 'mobile', 'cell'],
      'message': ['comment', 'description', 'inquiry'],
      'company': ['organization', 'business']
    };
    
    for (const [base, variations] of Object.entries(fieldVariations)) {
      if (field === base && variations.some(v => specFields.includes(v))) return true;
      if (variations.includes(field) && specFields.includes(base)) return true;
    }
    
    return false;
  }
  
  /**
   * Check if section is a variation of existing sections
   */
  isSectionVariation(section, specSections) {
    const sectionVariations = {
      'testimonial': ['testimonials', 'review', 'reviews'],
      'feature': ['features', 'service', 'services'],
      'contact': ['contact_form', 'form'],
      'about': ['about_us', 'company']
    };
    
    for (const [base, variations] of Object.entries(sectionVariations)) {
      if (section === base && variations.some(v => specSections.includes(v))) return true;
      if (variations.includes(section) && specSections.includes(base)) return true;
    }
    
    return false;
  }
  
  /**
   * Check if form field exists in code
   */
  hasFormField(code, field) {
    const fieldPatterns = [
      new RegExp(`name=['"]${field}['"]`, 'i'),
      new RegExp(`id=['"]${field}['"]`, 'i'),
      new RegExp(`placeholder.*${field}`, 'i'),
      new RegExp(`label.*${field}`, 'i')
    ];
    
    return fieldPatterns.some(pattern => pattern.test(code));
  }
}

module.exports = { OutputValidator };