/**
 * @file backend/ai/validation/InputValidator.js
 * @description Input validation framework for agent inputs
 */

class InputValidator {
  /**
   * Validate SpecAgent input
   */
  validateSpecInput(userPrompt) {
    const validation = {
      isValid: true,
      issues: [],
      warnings: [],
      extractedElements: {
        formFields: this.extractFormFields(userPrompt),
        pageTypes: this.extractPageTypes(userPrompt),
        industries: this.extractIndustryContext(userPrompt),
        functionalRequirements: this.extractRequirements(userPrompt),
        sections: this.extractSections(userPrompt)
      }
    };
    
    // Validation rules
    if (!validation.extractedElements.formFields.length && this.shouldHaveForm(userPrompt)) {
      validation.warnings.push('No form fields detected - may need clarification');
    }
    
    if (!validation.extractedElements.pageTypes.length) {
      validation.warnings.push('Page type unclear - will infer from context');
    }
    
    if (userPrompt.length < 10) {
      validation.isValid = false;
      validation.issues.push('Prompt too short - need more details');
    }
    
    if (userPrompt.length > 2000) {
      validation.warnings.push('Very long prompt - may need summarization');
    }
    
    return validation;
  }
  
  /**
   * Extract form fields from prompt
   */
  extractFormFields(prompt) {
    const fieldPatterns = /\b(name|first.?name|last.?name|email|phone|company|message|address|subject|inquiry|description|title|position|department|website|budget|project|service|comment|feedback|question)\b/gi;
    const matches = [...prompt.matchAll(fieldPatterns)];
    return [...new Set(matches.map(match => match[0].toLowerCase()))];
  }
  
  /**
   * Extract page types from prompt
   */
  extractPageTypes(prompt) {
    const typePatterns = /\b(landing|contact|about|portfolio|blog|ecommerce|dashboard|pricing|service|product|home|signup|login|register)\b/gi;
    const matches = [...prompt.matchAll(typePatterns)];
    return [...new Set(matches.map(match => match[0].toLowerCase()))];
  }
  
  /**
   * Extract industry context
   */
  extractIndustryContext(prompt) {
    const industryPatterns = /\b(healthcare|finance|fintech|saas|software|technology|education|ecommerce|retail|consulting|legal|law|real.?estate|marketing|agency|nonprofit|restaurant|hospitality|fitness|medical|dental)\b/gi;
    const matches = [...prompt.matchAll(industryPatterns)];
    return [...new Set(matches.map(match => match[0].toLowerCase()))];
  }
  
  /**
   * Extract functional requirements
   */
  extractRequirements(prompt) {
    const reqPatterns = /\b(validation|submit|send|email|payment|checkout|search|filter|sort|responsive|mobile|accessible|secure|login|register|authentication|booking|scheduling|calendar|upload|download|share|print|export)\b/gi;
    const matches = [...prompt.matchAll(reqPatterns)];
    return [...new Set(matches.map(match => match[0].toLowerCase()))];
  }
  
  /**
   * Extract page sections
   */
  extractSections(prompt) {
    const sectionPatterns = /\b(hero|header|footer|nav|navigation|about|contact|testimonial|review|feature|pricing|service|portfolio|gallery|blog|news|team|faq|stats|metric|social.?proof|call.?to.?action|cta)\b/gi;
    const matches = [...prompt.matchAll(sectionPatterns)];
    return [...new Set(matches.map(match => match[0].toLowerCase()))];
  }
  
  /**
   * Determine if prompt should have form fields
   */
  shouldHaveForm(prompt) {
    const formIndicators = /\b(contact|form|submit|send|email|inquiry|message|register|signup|booking|appointment|quote|request)\b/gi;
    return formIndicators.test(prompt);
  }
}

module.exports = { InputValidator };