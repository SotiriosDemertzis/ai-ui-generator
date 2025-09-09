/**
 * @file backend/ai/agents/uiuxComplianceAgent.js
 * @description Modern UI/UX Compliance Agent - Enforces ModernUIUXRules.json standards
 * @version 1.0 - Comprehensive UI/UX validation and enhancement
 */

const { runAgent } = require('./runAgent');
const fs = require('fs').promises;
const path = require('path');

/**
 * Modern UI/UX Compliance Agent
 * Validates and enhances generated components against ModernUIUXRules.json standards
 */
class UIUXComplianceAgent {
  constructor() {
    this.agentType = 'UIUXComplianceAgent';
    this.version = '1.0';
    this.description = 'Enforces Modern UI/UX Rules compliance with 85%+ passing threshold';
    this.modernRules = null;
    this.mandatoryRules = null;
    this.passingThreshold = 85;
  }

  /**
   * Load Modern UI/UX Rules from ModernUIUXRules.json
   */
  async loadModernRules() {
    if (this.modernRules) return this.modernRules;
    
    try {
      const rulesPath = path.join(process.cwd(), '.claude', 'ModernUIUXRules.json');
      const rulesContent = await fs.readFile(rulesPath, 'utf8');
      this.modernRules = JSON.parse(rulesContent);
      this.mandatoryRules = this.modernRules.scoringSystem?.mandatoryRules || [];
      
      console.log('📋 [UIUXComplianceAgent] Loaded Modern UI/UX Rules:', {
        totalCategories: this.modernRules.rules?.length || 0,
        mandatoryRules: this.mandatoryRules.length,
        passingThreshold: this.modernRules.scoringSystem?.passingThreshold || '85%'
      });
      
      return this.modernRules;
    } catch (error) {
      console.error('❌ [UIUXComplianceAgent] Failed to load Modern UI/UX Rules:', error.message);
      throw error;
    }
  }

  /**
   * Validate component against Modern UI/UX Rules with enhanced debugging
   */
  async validateCompliance(reactCode, pageSpec, designSystem) {
    console.log('🔍 [UIUXComplianceAgent] Starting Modern UI/UX compliance validation...');
    console.log('🔍 [UIUXComplianceAgent-DEBUG] Input parameters:', {
      codeLength: reactCode ? reactCode.length : 0,
      pageSpecType: pageSpec?.type,
      designSystemType: designSystem?.type,
      hasModernRules: !!this.modernRules
    });
    
    await this.loadModernRules();
    
    const validationPrompt = this.buildComplianceValidationPrompt(reactCode, pageSpec, designSystem);
    
    try {
      const result = await runAgent(this.agentType, validationPrompt, {
        reactCode,
        pageSpec,
        designSystem,
        modernRules: this.modernRules
      }, {
        maxTokens: 8000,
        temperature: 0.1 // Very low temperature for consistent validation
      });
      
      if (!result.success) {
        console.error('❌ [UIUXComplianceAgent] Validation failed:', result.error);
        return {
          success: false,
          error: result.error,
          complianceScore: 0
        };
      }

      const validation = this.parseValidationResponse(result.response);
      
      // DEBUG: Enhanced validation logging
      console.log('🔍 [UIUXComplianceAgent-DEBUG] Validation result:', {
        complianceScore: validation.complianceScore,
        mandatoryRulesPassed: validation.mandatoryRulesPassed,
        criticalIssues: validation.criticalIssues?.length || 0,
        totalRules: validation.totalRules
      });
      
      console.log(`📊 [UIUXComplianceAgent] Compliance Score: ${validation.complianceScore}%`);
      console.log(`🎯 [UIUXComplianceAgent] Mandatory Rules Status: ${validation.mandatoryCompliance}`);
      
      if (validation.complianceScore < this.passingThreshold) {
        console.warn(`⚠️ [UIUXComplianceAgent] BELOW THRESHOLD: ${validation.complianceScore}% < ${this.passingThreshold}%`);
        console.warn(`❌ [UIUXComplianceAgent] FAILED RULES (${validation.failedRules?.length || 0}):`);
        if (validation.failedRules) {
          validation.failedRules.forEach((rule, index) => {
            console.warn(`   ${index + 1}. [${rule.category}] ${rule.id}: ${rule.text}${rule.mandatory ? ' (MANDATORY)' : ''}`);
            if (rule.reason) console.warn(`      Reason: ${rule.reason}`);
          });
        }
        console.warn(`✅ [UIUXComplianceAgent] PASSED RULES (${validation.passedRules?.length || 0}):`);
        if (validation.passedRules) {
          validation.passedRules.slice(0, 5).forEach((rule, index) => {
            console.warn(`   ${index + 1}. [${rule.category}] ${rule.id}: ${rule.text}`);
          });
          if (validation.passedRules.length > 5) {
            console.warn(`   ... and ${validation.passedRules.length - 5} more`);
          }
        }
      }
      
      return {
        success: true,
        complianceScore: validation.complianceScore,
        mandatoryCompliance: validation.mandatoryCompliance,
        passedRules: validation.passedRules,
        failedRules: validation.failedRules,
        recommendations: validation.recommendations,
        isCompliant: validation.complianceScore >= this.passingThreshold && validation.mandatoryCompliance === 'PASS'
      };
      
    } catch (error) {
      console.error('❌ [UIUXComplianceAgent] Validation error:', error.message);
      return {
        success: false,
        error: error.message,
        complianceScore: 0
      };
    }
  }

  /**
   * Generate compliance enhancement recommendations
   */
  async generateEnhancements(validationResult, reactCode) {
    console.log('💡 [UIUXComplianceAgent] Generating compliance enhancements...');
    
    if (!validationResult.failedRules || validationResult.failedRules.length === 0) {
      return {
        success: true,
        enhancements: [],
        message: 'Component already meets Modern UI/UX standards'
      };
    }
    
    const enhancementPrompt = this.buildEnhancementPrompt(validationResult, reactCode);
    
    try {
      const result = await runAgent(`${this.agentType}-Enhancer`, enhancementPrompt, {
        validationResult,
        reactCode,
        modernRules: this.modernRules
      }, {
        maxTokens: 12000,
        temperature: 0.3
      });
      
      if (!result.success) {
        console.error('❌ [UIUXComplianceAgent] Enhancement generation failed:', result.error);
        return {
          success: false,
          error: result.error
        };
      }

      const enhancements = this.parseEnhancementResponse(result.response);
      
      console.log(`✅ [UIUXComplianceAgent] Generated ${enhancements.codeChanges.length} enhancement recommendations`);
      
      return {
        success: true,
        enhancements: enhancements.codeChanges,
        priorityFixes: enhancements.priorityFixes,
        expectedScore: enhancements.expectedScore
      };
      
    } catch (error) {
      console.error('❌ [UIUXComplianceAgent] Enhancement error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build comprehensive compliance validation prompt
   */
  buildComplianceValidationPrompt(reactCode, pageSpec, designSystem) {
    return `You are a STRICT Modern UI/UX Compliance Auditor. You MUST enforce ALL Modern UI/UX Rules with ZERO TOLERANCE for missing implementations.

🚨 CRITICAL AUDIT REQUIREMENTS:
- MANDATORY RULES: If ANY mandatory rule = FAIL → Component is NON-COMPLIANT
- PASSING THRESHOLD: ≥85% score AND all mandatory rules = PASS
- ERROR HANDLING: Missing error styling = AUTOMATIC FAIL
- PAYMENT FEATURES: Missing secure payment processing = CRITICAL ISSUE  
- USER ACCOUNT: Missing account management = CRITICAL ISSUE

**MANDATORY RULES (MUST ALL PASS):**
1. responsiveDesign - MUST use Tailwind responsive breakpoints (sm:, md:, lg:, xl:, 2xl:)
2. accessibilityBaseline - MUST have focus:ring outlines on ALL interactive elements
3. clearNavigation - MUST have persistent navbar with proper flex/grid layout
4. interactionFeedback - MUST have hover:, focus:, active:, disabled: states
5. noBlockingErrors - MUST have proper error handling and user feedback

**CRITICAL FEATURES TO CHECK:**
- Secure Payment Processing: bg-green-50 border border-green-300 for payment sections
- User Account Management: Sign out buttons, account links, profile management
- Order Tracking: Order history, tracking capabilities, wishlist features
- Error Message Styling: text-sm text-red-600 mt-1 for error messages
- Form Validation: Proper error states and validation feedback

**MODERN UI/UX RULES TO VALIDATE:**
${JSON.stringify(this.modernRules, null, 2)}

**REACT COMPONENT TO AUDIT:**
\`\`\`jsx
${reactCode}
\`\`\`

**PAGE SPECIFICATION:**
${JSON.stringify(pageSpec, null, 2)}

**DESIGN SYSTEM:**
${JSON.stringify(designSystem, null, 2)}

**AUDIT REQUIREMENTS:**
1. Check each rule category: LayoutAndStructure, VisualDesign, NavigationAndInformationArchitecture, InteractionAndFeedback, AccessibilityAndInclusivity, FormsAndInputs, ModernPagePatterns, BrandingAndPersonalization, TrustAndEthicalDesign

2. For each rule, determine: PASS, PARTIAL, or FAIL
   - PASS: Rule fully implemented in the component
   - PARTIAL: Rule partially implemented or inconsistent
   - FAIL: Rule not implemented or missing

3. Calculate compliance score using: (PASS + 0.5 * PARTIAL) / totalRules * 100

4. Check mandatory rules: ${this.mandatoryRules.join(', ')}

**CRITICAL FOCUS AREAS:**
- **Forms**: Inline validation, error messages, success states
- **Interaction**: Hover/focus/active states, loading feedback
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Responsive Design**: Mobile-first, no horizontal scroll
- **Visual Hierarchy**: Clear typography scales, spacing consistency
- **Modern Patterns**: Cards, hero sections, microinteractions

**RESPONSE FORMAT (JSON only):**
{
  "complianceScore": 0-100,
  "mandatoryCompliance": "PASS" | "FAIL",
  "totalRules": 64,
  "passedRules": [
    {"id": "responsiveDesign", "category": "LayoutAndStructure", "evidence": "Uses responsive Grid system"}
  ],
  "failedRules": [
    {"id": "inlineValidation", "category": "FormsAndInputs", "reason": "No inline validation implemented", "severity": "mandatory"}
  ],
  "partialRules": [
    {"id": "colorContrast", "category": "VisualDesign", "reason": "Some elements may not meet 4.5:1 ratio"}
  ],
  "recommendations": [
    "Add Form.Item rules prop for inline validation",
    "Implement error/success message states",
    "Add ARIA labels to interactive elements"
  ],
  "criticalIssues": [
    "Missing inline form validation (mandatory rule violation)"
  ]
}

Perform the comprehensive audit now:`;
  }

  /**
   * Build enhancement recommendation prompt
   */
  buildEnhancementPrompt(validationResult, reactCode) {
    return `You are an expert React developer specializing in Modern UI/UX compliance. Generate specific code enhancements to fix the failed rules.

**CURRENT VALIDATION RESULT:**
${JSON.stringify(validationResult, null, 2)}

**CURRENT REACT CODE:**
\`\`\`jsx
${reactCode}
\`\`\`

**FAILED RULES TO FIX:**
${validationResult.failedRules.map(rule => `- ${rule.id}: ${rule.reason}`).join('\n')}

**ENHANCEMENT REQUIREMENTS:**
1. Provide specific code changes to fix each failed rule
2. Focus on mandatory rules first: ${this.mandatoryRules.join(', ')}
3. Use Ant Design components and best practices
4. Ensure changes integrate seamlessly with existing code
5. Add inline form validation with Form.Item rules
6. Implement proper error/success states
7. Add accessibility features (ARIA labels, semantic HTML)
8. Enhance responsive design and visual hierarchy

**RESPONSE FORMAT (JSON only):**
{
  "codeChanges": [
    {
      "ruleId": "inlineValidation",
      "priority": "mandatory",
      "description": "Add inline form validation",
      "oldCode": "existing code snippet to replace",
      "newCode": "enhanced code with validation",
      "explanation": "Why this fix improves compliance"
    }
  ],
  "priorityFixes": [
    "Fix mandatory rule violations first",
    "Add form validation and error states",
    "Improve accessibility compliance"
  ],
  "expectedScore": 90,
  "integrationNotes": [
    "Test form validation after implementation",
    "Verify responsive design on mobile"
  ]
}

Generate specific code enhancements now:`;
  }

  /**
   * Parse validation response from AI
   */
  parseValidationResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in validation response');
      }
      
      const validation = JSON.parse(jsonMatch[0]);
      
      // Validate required properties
      if (typeof validation.complianceScore !== 'number') {
        throw new Error('Invalid compliance score in response');
      }
      
      return {
        complianceScore: validation.complianceScore,
        mandatoryCompliance: validation.mandatoryCompliance || 'UNKNOWN',
        passedRules: validation.passedRules || [],
        failedRules: validation.failedRules || [],
        partialRules: validation.partialRules || [],
        recommendations: validation.recommendations || [],
        criticalIssues: validation.criticalIssues || []
      };
      
    } catch (error) {
      console.error('❌ [UIUXComplianceAgent] Failed to parse validation response:', error.message);
      return {
        complianceScore: 0,
        mandatoryCompliance: 'FAIL',
        passedRules: [],
        failedRules: [],
        partialRules: [],
        recommendations: ['Failed to parse validation response'],
        criticalIssues: ['Validation parsing error']
      };
    }
  }

  /**
   * Parse enhancement response from AI
   */
  parseEnhancementResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in enhancement response');
      }
      
      const enhancements = JSON.parse(jsonMatch[0]);
      
      return {
        codeChanges: enhancements.codeChanges || [],
        priorityFixes: enhancements.priorityFixes || [],
        expectedScore: enhancements.expectedScore || 85,
        integrationNotes: enhancements.integrationNotes || []
      };
      
    } catch (error) {
      console.error('❌ [UIUXComplianceAgent] Failed to parse enhancement response:', error.message);
      return {
        codeChanges: [],
        priorityFixes: ['Failed to parse enhancement response'],
        expectedScore: 70,
        integrationNotes: []
      };
    }
  }
}

module.exports = { UIUXComplianceAgent };