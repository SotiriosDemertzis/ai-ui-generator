/**
 * @file backend/ai/agents/validatorAgent.js
 * @description Professional Quality Assurance Agent with Requirement Cross-Referencing
 * @version 3.0 - Enhanced with cross-referential validation and requirement traceability
 */

const { runAgent, parseJSONResponse } = require('./runAgent');
const { OutputValidator } = require('../validation/OutputValidator');
const { UIUXRulesValidator } = require('../validation/UIUXRulesValidator');
const { ContentCodeBridge } = require('../shared/contentCodeBridge');
// Removed UIUXComplianceAgent - using only UIUXRulesValidator as single source of truth

/**
 * Professional Quality Assurance Agent
 * Role: Senior QA Engineer specializing in requirement cross-referencing and comprehensive validation
 * Mission: Ensure production-ready code quality with 100% requirement traceability
 */
class ValidatorAgent {
  constructor() {
    this.agentType = 'ValidatorAgent';
    this.version = '3.2';
    this.expertise = 'Quality Assurance, Requirement Cross-Referencing, Code Review, Performance Optimization, Accessibility, UI/UX Rules Compliance, Template Pattern Detection, Industry Specificity Validation';
    this.objectives = [
      'Cross-reference final code against original requirements',
      'Validate 90%+ content utilization rates',
      'Ensure production-ready code quality',
      'Guarantee accessibility compliance (WCAG 2.1)',
      'Validate comprehensive UI/UX rules compliance',
      'Detect and prevent generic template patterns',
      'Enforce industry-specific design authenticity',
      'Validate creative uniqueness and avoid repetitive patterns',
      'Provide harsh but fair validation scoring'
    ];
    this.outputValidator = new OutputValidator();
    this.uiuxValidator = new UIUXRulesValidator();
    this.contentBridge = new ContentCodeBridge(); // CRITICAL FIX: Use same bridge as CodeAgent
    // Removed UIUXComplianceAgent - UIUXRulesValidator is the single source of truth
  }

  /**
   * Alias for validate method - used by tests and other agents
   */
  async validateGeneration(context) {
    return this.validate(context);
  }

  /**
   * Simplified validation using only UIUXRulesValidator as single source of truth
   * Input: Complete generation context (pageSpec, design, code, content)
   * Output: Validation result with 75% threshold
   */
  async validate(context) {
    console.log('\n🔍 [ValidatorAgent] ================================');
    console.log('🔍 [ValidatorAgent] Running simplified single-method validation...');
    console.log('� [ValidatorAgent] Input context analysis:', {
      hasPageSpec: !!context.pageSpec,
      hasDesign: !!context.design,
      hasCode: !!context.code,
      hasContent: !!context.content,
      pageSpecType: context.pageSpec?.type || 'unknown',
      designType: context.design?.visual?.style || 'unknown',
      codeLength: context.code?.reactCode?.length || 0,
      contentSections: context.content ? Object.keys(context.content).length : 0
    });
    
    const { pageSpec, design, code, content } = context;
    
    if (!code?.reactCode) {
      console.error('❌ [ValidatorAgent] No React code found in context!');
      return {
        success: false,
        error: 'No React code found in validation context',
        validation: null
      };
    }
    
    console.log('📋 [ValidatorAgent] Code analysis:', {
      codeLength: code.reactCode.length,
      hasJSXElements: code.reactCode.includes('<') && code.reactCode.includes('>'),
      hasReactImport: code.reactCode.includes('React'),
      componentName: code.componentName || 'unknown'
    });
    
    // Enhanced validation method: UI/UX Rules validation with Phase 6 improvements
    console.log('🔍 [ValidatorAgent] Phase 1: Performing enhanced UI/UX validation...');
    const uiuxStartTime = Date.now();
    const uiuxValidation = await this.uiuxValidator.validateComponent(code.reactCode, pageSpec, design);
    
    // Phase 6: Enhanced validation - Template pattern detection and industry specificity
    console.log('🔍 [ValidatorAgent] Phase 1b: Validating industry specificity and template avoidance...');
    const industryValidation = this.uiuxValidator.validateIndustrySpecificity(code.reactCode, pageSpec, design, content);
    const templateValidation = this.uiuxValidator.validateTemplateAvoidance(code.reactCode, pageSpec);
    const uiuxEndTime = Date.now();
    
    console.log('✅ [ValidatorAgent] UI/UX validation completed:', {
      executionTime: `${uiuxEndTime - uiuxStartTime}ms`,
      overallScore: uiuxValidation.overallScore,
      compliance: uiuxValidation.compliance,
      passedRules: uiuxValidation.summary?.passedRules || 0,
      totalRules: uiuxValidation.summary?.totalRules || 0,
      criticalIssuesCount: uiuxValidation.criticalIssues?.length || 0,
      industrySpecificityScore: industryValidation.score,
      templateAvoidanceScore: templateValidation.score,
      industryViolations: industryValidation.violations?.length || 0,
      templatePatternDetections: templateValidation.detectedPatterns?.length || 0
    });
    
    if (uiuxValidation.criticalIssues?.length > 0) {
      console.log('⚠️ [ValidatorAgent] UI/UX critical issues found:', uiuxValidation.criticalIssues);
    }
    
    // Content utilization check using ContentCodeBridge
    console.log('🔍 [ValidatorAgent] Phase 2: Analyzing content utilization...');
    const contentStartTime = Date.now();
    const contentUtilization = this.contentBridge.analyzeContentUtilization(content, code.reactCode);
    const contentEndTime = Date.now();
    
    const utilizationPercentage = Math.round(contentUtilization.utilizationRate * 100);
    console.log('✅ [ValidatorAgent] Content utilization analysis completed:', {
      executionTime: `${contentEndTime - contentStartTime}ms`,
      utilizationPercentage: utilizationPercentage,
      usedElements: contentUtilization.usedElements || 0,
      totalElements: contentUtilization.totalElements || 0,
      hasUtilizationData: !!contentUtilization
    });
    
    // CRITICAL FIX #1: Enhanced validation result with specific actionable feedback
    console.log('🔍 [ValidatorAgent] Phase 3: Compiling enhanced validation results with actionable feedback...');
    const passThreshold = 75;
    const contentThreshold = 70;
    const industryThreshold = 70; // Industry specificity requirement
    const templateThreshold = 80; // Template avoidance requirement
    
    // Calculate adjusted score based on Phase 6 validations
    let adjustedScore = uiuxValidation.overallScore;
    
    // Apply penalties for template patterns and lack of industry specificity
    if (templateValidation.score < templateThreshold) {
      const templatePenalty = (templateThreshold - templateValidation.score) * 0.3; // 30% weight
      adjustedScore -= templatePenalty;
      console.log(`⚠️ [ValidatorAgent] Template pattern penalty applied: -${templatePenalty.toFixed(1)} points`);
    }
    
    if (industryValidation.score < industryThreshold) {
      const industryPenalty = (industryThreshold - industryValidation.score) * 0.2; // 20% weight
      adjustedScore -= industryPenalty;
      console.log(`⚠️ [ValidatorAgent] Industry specificity penalty applied: -${industryPenalty.toFixed(1)} points`);
    }
    
    // Ensure score doesn't go below 0
    adjustedScore = Math.max(0, adjustedScore);
    
    // CRITICAL FIX #1: Generate specific, actionable tailwind-focused guidance
    const specificGuidance = this.generateSpecificTailwindGuidance(uiuxValidation, templateValidation, industryValidation, code.reactCode, pageSpec);
    
    const validation = {
      overallScore: Math.round(adjustedScore),
      passed: adjustedScore >= passThreshold && utilizationPercentage >= contentThreshold && 
              templateValidation.score >= templateThreshold && industryValidation.score >= industryThreshold,
      compliance: uiuxValidation.compliance,
      contentUtilization: utilizationPercentage,
      criticalIssues: [...(uiuxValidation.criticalIssues || [])],
      summary: uiuxValidation.summary,
      recommendations: uiuxValidation.recommendations || [],
      // CRITICAL FIX #1: Enhanced actionable guidance for TailwindStylistAgent
      specificGuidance: specificGuidance,
      actionableFixes: this.generateActionableFixes(uiuxValidation, code.reactCode, pageSpec),
      // Phase 6: Enhanced validation data
      industrySpecificity: {
        score: industryValidation.score,
        violations: industryValidation.violations || [],
        recommendations: industryValidation.recommendations || []
      },
      templateAvoidance: {
        score: templateValidation.score,
        detectedPatterns: templateValidation.detectedPatterns || [],
        recommendations: templateValidation.recommendations || []
      }
    };
    
    // Add content utilization penalty if too low
    if (utilizationPercentage < contentThreshold) {
      const contentIssue = `Low content utilization: ${utilizationPercentage}% (required: ${contentThreshold}%+)`;
      validation.criticalIssues.push(contentIssue);
      validation.overallScore = Math.min(70, validation.overallScore);
      console.log(`⚠️ [ValidatorAgent] Content utilization penalty applied: ${contentIssue}`);
    }
    
    // Add Phase 6 validation issues to critical issues
    if (templateValidation.detectedPatterns && templateValidation.detectedPatterns.length > 0) {
      const templateIssues = templateValidation.detectedPatterns.map(pattern => 
        `Template pattern detected: ${pattern.type} - ${pattern.description}`
      );
      validation.criticalIssues.push(...templateIssues);
      console.log(`⚠️ [ValidatorAgent] Template patterns detected: ${templateValidation.detectedPatterns.length} patterns`);
    }
    
    if (industryValidation.violations && industryValidation.violations.length > 0) {
      const industryIssues = industryValidation.violations.map(violation => 
        `Industry specificity violation: ${violation.type} - ${violation.description}`
      );
      validation.criticalIssues.push(...industryIssues);
      console.log(`⚠️ [ValidatorAgent] Industry violations detected: ${industryValidation.violations.length} violations`);
    }
    
    console.log('✅ [ValidatorAgent] SUCCESS! Enhanced validation completed');
    console.log('📊 [ValidatorAgent] Final validation summary:', {
      finalScore: validation.overallScore,
      originalScore: uiuxValidation.overallScore,
      passed: validation.passed,
      passThreshold: passThreshold,
      contentUtilization: utilizationPercentage,
      contentThreshold: contentThreshold,
      industrySpecificityScore: industryValidation.score,
      industryThreshold: industryThreshold,
      templateAvoidanceScore: templateValidation.score,
      templateThreshold: templateThreshold,
      criticalIssuesCount: validation.criticalIssues.length,
      uiuxCompliance: validation.compliance
    });
    
    if (validation.criticalIssues.length > 0) {
      console.log('⚠️ [ValidatorAgent] Critical issues summary:', validation.criticalIssues);
    }
    
    console.log('🔍 [ValidatorAgent] ================================\n');
    
    return {
      success: true,
      validation: validation,
      metadata: {
        validationMethod: 'enhanced-uiux-rules-with-phase6',
        contentUtilization: utilizationPercentage,
        uiuxCompliance: uiuxValidation.compliance,
        industrySpecificityScore: industryValidation.score,
        templateAvoidanceScore: templateValidation.score,
        threshold: 75,
        industryThreshold: industryThreshold,
        templateThreshold: templateThreshold,
        validationTimestamp: new Date().toISOString(),
        phase6Enhanced: true
      }
    };
  }

  /**
   * Build cross-referenced validation prompt with requirement traceability
   */
  buildCrossReferencedValidationPrompt(pageSpec, design, code, content, outputValidation, uiuxValidation) {
    const componentName = code.componentName;
    
    return `You are 'ValidationMaster AI', the industry's most rigorous QA validation system with expertise in requirement traceability and harsh but fair quality assessment.

# 🚨 REQUIREMENT CROSS-REFERENCE VALIDATION PROTOCOL

## PHASE 1: ORIGINAL REQUIREMENT TRACEABILITY
Original user requirements from SpecAgent:
- Page Type: ${pageSpec.type}
- Industry: ${pageSpec.industry}
- Required Sections: ${pageSpec.sections?.map(s => s.name).join(', ') || 'None specified'}
- Required Form Fields: ${pageSpec.formFields?.required?.join(', ') || 'None specified'}
- Functional Requirements: ${pageSpec.functionalRequirements?.join(', ') || 'Standard web requirements'}

## PHASE 2: CONTENT UTILIZATION AUDIT (CRITICAL)
Content utilization analysis (from validation framework):
- Current Utilization Rate: ${outputValidation.contentUtilization}%
- Missing Content Elements: ${outputValidation.missingContent.join(', ') || 'None'}
- Content Utilization Status: ${outputValidation.contentUtilization >= 80 ? 'ACCEPTABLE' : 'FAILED - BELOW THRESHOLD'}

**CRITICAL RULE**: If content utilization < 80%, overall score is automatically capped at 70%.

## PHASE 3: UI/UX RULES COMPLIANCE ANALYSIS (COMPREHENSIVE)
UI/UX validation analysis (from comprehensive rule engine):
- Overall UI/UX Score: ${uiuxValidation.overallScore}/100
- Compliance Status: ${uiuxValidation.compliance}
- Total Rules Evaluated: ${uiuxValidation.summary.totalRules}
- Rules Passed: ${uiuxValidation.summary.passedRules} (${Math.round((uiuxValidation.summary.passedRules / uiuxValidation.summary.totalRules) * 100)}%)
- Mandatory Rule Failures: ${uiuxValidation.summary.mandatoryFailures.length}
${uiuxValidation.summary.mandatoryFailures.length > 0 ? `- CRITICAL MANDATORY FAILURES: ${uiuxValidation.summary.mandatoryFailures.map(f => f.rule).join(', ')}` : ''}

**UI/UX CATEGORY BREAKDOWN:**
${Object.entries(uiuxValidation.categories).map(([category, data]) => 
  `- ${category}: ${data.scorePercentage}% (${data.score}/${data.maxScore} rules passed)`
).join('\n')}

**CRITICAL UI/UX RULE**: If UI/UX compliance is NON-COMPLIANT or mandatory rules failed, cap overall score at 75%.

## PHASE 4: REQUIREMENT COMPLIANCE CHECK
Verify final code implements:
1. Every form field listed: ${pageSpec.formFields?.required?.join(', ') || 'name, email, message'}
2. Every section requested: ${pageSpec.sections?.map(s => s.name).join(', ') || 'hero, contact'}  
3. Every functional requirement: ${pageSpec.functionalRequirements?.join(', ') || 'form validation, responsive design'}

## PHASE 5: MODERN DESIGN IMPLEMENTATION AUDIT
Required modern patterns (2024-2025):
- Gradient backgrounds: ${code.reactCode.includes('gradient') ? 'IMPLEMENTED' : '❌ MISSING'}
- Glassmorphism effects: ${code.reactCode.includes('backdrop-blur') ? 'IMPLEMENTED' : '❌ MISSING'}  
- Hover animations: ${code.reactCode.includes('hover:scale') ? 'IMPLEMENTED' : '❌ MISSING'}
- Premium typography: ${code.reactCode.includes('text-5xl') || code.reactCode.includes('text-6xl') ? 'IMPLEMENTED' : '❌ MISSING'}

**PENALTY SYSTEM**: Subtract 15 points for each missing modern pattern.

## PHASE 6: HARSH VALIDATION SCORING WITH PENALTIES
Base scoring system with strict penalties:
- Start at 100 points
- Content utilization penalty: ${outputValidation.contentUtilization < 80 ? '30 points deducted' : '0 points deducted'}
- UI/UX compliance penalty: ${uiuxValidation.compliance === 'NON-COMPLIANT' ? '25 points deducted' : '0 points deducted'}
- Mandatory UI/UX rule failures: ${uiuxValidation.summary.mandatoryFailures.length} × 10 points each
- Missing form fields: ${this.calculateMissingFields(pageSpec, code)} × 20 points each
- Missing sections: ${this.calculateMissingSections(pageSpec, code)} × 15 points each
- Missing modern patterns: Count × 15 points each
- Code quality issues: Variable deduction based on severity

**Target Score**: ≥85/100 for acceptable quality, ≥90/100 for production-ready

## COMPONENT UNDER VALIDATION
Component Name: ${componentName}
Code Length: ${code.reactCode.length} characters
Content Integration: ${outputValidation.contentUtilization}%

## GENERATED CODE TO VALIDATE
\`\`\`javascript
${code.reactCode}
\`\`\`

## DESIGN SYSTEM CONTEXT  
${JSON.stringify(design, null, 2)}

## CONTENT INTEGRATION DATA
Available content: ${content ? Object.keys(content).join(', ') : 'None'}
${content ? JSON.stringify(content, null, 2) : 'No content provided'}

# ENHANCED VALIDATION OUTPUT (JSON ONLY)

You MUST respond with ONLY this JSON structure with harsh but fair scoring:

{
  "overallScore": [0-100],
  "passed": [true/false for ≥85],
  "contentUtilization": {
    "percentage": ${outputValidation.contentUtilization},
    "status": "${outputValidation.contentUtilization >= 80 ? 'acceptable' : 'failed'}",
    "penalty": ${outputValidation.contentUtilization < 80 ? 30 : 0}
  },
  "uiuxCompliance": {
    "overallScore": ${uiuxValidation.overallScore},
    "compliance": "${uiuxValidation.compliance}",
    "passedRules": ${uiuxValidation.summary.passedRules},
    "totalRules": ${uiuxValidation.summary.totalRules},
    "mandatoryFailures": ${uiuxValidation.summary.mandatoryFailures.length},
    "penalty": ${uiuxValidation.compliance === 'NON-COMPLIANT' ? 25 : 0}
  },
  "requirementTraceability": {
    "formFieldsImplemented": [0-100],
    "sectionsImplemented": [0-100], 
    "functionalRequirementsImplemented": [0-100],
    "missingRequirements": ["list specific missing requirements"]
  },
  "modernDesignCompliance": {
    "score": [0-25],
    "implementedPatterns": ["list implemented modern patterns"],
    "missingPatterns": ["list missing modern patterns"],
    "penalty": [points deducted for missing patterns]
  },
  "codeQuality": {
    "score": [0-25],
    "issues": ["specific code quality issues"],
    "strengths": ["code quality strengths"],
    "recommendations": ["actionable improvements"]
  },
  "accessibility": {
    "score": [0-20], 
    "issues": ["accessibility problems"],
    "wcagCompliance": "AA|A|None",
    "recommendations": ["accessibility improvements needed"]
  },
  "criticalIssues": ["ONLY critical issues that prevent production deployment"],
  "summary": "Harsh but fair assessment of component quality and requirement compliance"
}

## VALIDATION METHODOLOGY (STRICT ENFORCEMENT)
1. Cross-reference every original requirement against final implementation
2. Apply harsh penalties for missing content utilization
3. Validate modern design pattern implementation strictly
4. Assess code quality with production standards
5. Provide actionable, specific feedback for improvements

Generate the comprehensive harsh validation assessment:`;
  }

  /**
   * Build expert-level validation prompt using advanced prompt engineering (LEGACY)
   * Implements: Role anchoring, structured assessment, comprehensive quality criteria
   */
  buildExpertValidationPrompt(pageSpec, design, code, content) {
    const componentName = code.componentName;
    
    return `# ROLE & IDENTITY ANCHORING
You are a Senior QA Engineer and React Code Reviewer with 15+ years of experience in production-grade applications. You specialize in comprehensive code quality assessment, accessibility compliance, performance optimization, and industry best practices.

# INSTRUCTION HIERARCHY

## 🚨 NON-NEGOTIABLE RULES (CRITICAL)
1. MUST provide ONLY a structured JSON validation report
2. MUST assess all quality dimensions comprehensively  
3. MUST be objective and thorough in evaluation
4. MUST follow the exact JSON structure specified
5. MUST assign accurate numerical scores (0-100)

## 🔶 STRONG GUIDELINES (HIGH PRIORITY)  
6. SHOULD provide actionable, specific recommendations
7. SHOULD identify critical issues that prevent production deployment
8. SHOULD validate WCAG 2.1 AA compliance rigorously
9. SHOULD assess mobile responsiveness and cross-device compatibility
10. SHOULD evaluate content authenticity and user experience quality

## 💡 CREATIVE ENHANCEMENTS (OPTIONAL)
11. MAY suggest innovative optimization approaches
12. MAY identify opportunities for performance improvements beyond basics  
13. MAY recommend modern React patterns for enhanced maintainability
14. MAY suggest industry-specific UX improvements for competitive advantage

# MISSION-CRITICAL OBJECTIVES
Conduct a comprehensive quality assessment covering:
- Code Quality & Best Practices (industry standards)
- React Patterns & Performance (modern 2024 standards)
- Accessibility Compliance (WCAG 2.1 AA minimum)
- Industry-Specific Requirements (${pageSpec.industry} standards)
- LocalPreview Compatibility (technical requirements)
- Content Integration Quality (authenticity and completeness)

# INPUT ANALYSIS
Component Under Review:
- Component Name: ${componentName}
- Page Type: ${pageSpec.type}
- Industry: ${pageSpec.industry}
- Complexity Level: ${pageSpec.complexity}/10
- Target Audience: ${pageSpec.targetAudience || 'General users'}

Generated Code to Validate:
\`\`\`javascript
${code.reactCode}
\`\`\`

Design System Used:
${JSON.stringify(design, null, 2)}

Content Integration:
${content ? `Content provided and integrated: ${Object.keys(content).join(', ')}` : 'No content integration'}

# ENHANCED VALIDATION SYSTEM - PHASE 3 (2024-2025)

## 🎯 WEIGHTED SCORING SYSTEM (TOTAL: 100 POINTS)

### 1. CONTENT RICHNESS ASSESSMENT (30 points) - PRIMARY FOCUS
**Content utilization and completeness evaluation:**
- **Content Integration (10 points)**: All major sections present (hero, features, testimonials, stats, form, company info)
- **Content Authenticity (10 points)**: Realistic, non-placeholder content that matches provided content specifications
- **Content Completeness (10 points)**: ≥80% utilization of available content elements from ContentAgent

**Content Validation Checklist:**
- [ ] Hero section with compelling headline and CTA (2 points)
- [ ] Features section with ≥3 features, icons, descriptions (2 points)  
- [ ] Testimonials section with ≥2 testimonials, ratings, avatars (2 points)
- [ ] Stats/metrics section with ≥3 metrics and trend indicators (2 points)
- [ ] Contact form with all specified fields (2 points)
- [ ] Company information section with realistic details (2 points)
- [ ] Realistic content (no "Lorem ipsum" or "John Doe" placeholders) (10 points)
- [ ] Content utilization ≥80% (tracked via ContentAgent analysis) (8 points)

### 2. MODERN UI/UX EXCELLENCE (25 points) - VISUAL SOPHISTICATION  
**State-of-the-art 2024-2025 design pattern implementation:**
- **Advanced Visual Effects (8 points)**: Gradient backgrounds, glassmorphism, advanced shadows
- **Modern Interactions (8 points)**: Hover animations, micro-interactions, smooth transitions
- **Premium Layout Design (9 points)**: Asymmetric layouts, sophisticated spacing, visual hierarchy

**Modern UI/UX Validation Checklist:**
- [ ] Gradient mesh hero backgrounds or advanced visual effects (3 points)
- [ ] Glassmorphism cards with backdrop-blur and transparency (3 points)
- [ ] Hover animations (hover:scale-105, transitions) on interactive elements (3 points)
- [ ] Advanced shadow systems with multiple elevation levels (2 points)
- [ ] Premium typography scale (text-5xl, text-6xl) with proper weight variation (3 points)
- [ ] Modern spacing patterns (py-20, p-8, mb-16) throughout (3 points)
- [ ] Asymmetric layouts with overlapping elements where appropriate (3 points)
- [ ] Professional color schemes with high contrast ratios (3 points)
- [ ] Mobile-responsive design with advanced breakpoints (2 points)

### 3. ACCESSIBILITY COMPLIANCE (20 points) - WCAG 2.1 AA STANDARDS
**Comprehensive accessibility evaluation:**
- **ARIA & Semantic Structure (7 points)**: ARIA labels, semantic HTML, heading hierarchy
- **Keyboard & Focus Management (7 points)**: Full keyboard navigation, focus indicators
- **Visual Accessibility (6 points)**: Color contrast, touch targets, readable typography

**Accessibility Validation Checklist:**
- [ ] ARIA labels on ≥80% of interactive elements (4 points)
- [ ] Semantic HTML structure (nav, main, section, article) (2 points)
- [ ] Proper heading hierarchy (h1, h2, h3) (1 point)
- [ ] Full keyboard navigation with logical tab order (4 points)
- [ ] Clear focus indicators (2px visible focus ring) (3 points)
- [ ] Minimum 4.5:1 color contrast ratio (WCAG AA) (3 points)
- [ ] Touch targets ≥44px for mobile interaction (2 points)
- [ ] No reliance on color alone to convey meaning (1 point)

### 4. CODE QUALITY & BEST PRACTICES (25 points) - TECHNICAL EXCELLENCE
**Production-ready React implementation:**
- **React Patterns (10 points)**: Modern hooks, optimization, functional components
- **Code Structure (8 points)**: Clean organization, naming, maintainability  
- **Technical Compliance (7 points)**: Ant Design usage, imports, LocalPreview compatibility

**Code Quality Validation Checklist:**
- [ ] Functional components with memo optimization (3 points)
- [ ] useState and useCallback hooks properly implemented (3 points)
- [ ] Clean, readable code structure with consistent naming (2 points)
- [ ] Proper error handling and edge cases (2 points)
- [ ] Correct Ant Design component usage (3 points)
- [ ] Proper import/export structure (2 points)
- [ ] LocalPreview/Sandpack compatibility (3 points)
- [ ] No syntax errors or warnings (2 points)
- [ ] Efficient re-rendering patterns (2 points)
- [ ] Proper responsive design implementation (3 points)

# ENHANCED PHASE 3 VALIDATION OUTPUT

You MUST respond with ONLY this JSON structure following the new weighted scoring system:

{
  "overallScore": [0-100],
  "passed": [true/false for ≥90],
  "weightedScores": {
    "contentRichness": [0-30],
    "modernUIUX": [0-25], 
    "accessibility": [0-20],
    "codeQuality": [0-25]
  },
  "categories": {
    "contentRichness": {
      "score": [0-30],
      "breakdown": {
        "contentIntegration": [0-10],
        "contentAuthenticity": [0-10], 
        "contentCompleteness": [0-10]
      },
      "issues": ["missing testimonials section", "placeholder content detected"],
      "strengths": ["comprehensive hero section", "realistic company info"],
      "recommendations": ["add testimonials section", "replace placeholder content with realistic data"],
      "utilizationRate": [0-100] percentage
    },
    "modernUIUX": {
      "score": [0-25],
      "breakdown": {
        "visualEffects": [0-8],
        "modernInteractions": [0-8],
        "premiumLayout": [0-9]
      },
      "issues": ["missing glassmorphism effects", "no hover animations"],
      "strengths": ["gradient backgrounds implemented", "premium typography"],
      "recommendations": ["add glassmorphism to cards", "implement hover:scale-105 animations"]
    },
    "accessibility": {
      "score": [0-20],
      "breakdown": {
        "ariaAndSemantic": [0-7],
        "keyboardAndFocus": [0-7],
        "visualAccessibility": [0-6]
      },
      "issues": ["missing ARIA labels", "insufficient color contrast"],
      "strengths": ["semantic HTML structure", "proper heading hierarchy"],
      "recommendations": ["add aria-label attributes", "increase contrast ratios to 4.5:1"]
    },
    "codeQuality": {
      "score": [0-25],
      "breakdown": {
        "reactPatterns": [0-10],
        "codeStructure": [0-8],
        "technicalCompliance": [0-7]
      },
      "issues": ["missing useCallback optimization", "inconsistent naming"],
      "strengths": ["functional components", "clean import structure"],
      "recommendations": ["optimize hooks usage", "implement consistent naming conventions"]
    }
  },
  "criticalIssues": ["List any critical issues that prevent production deployment"],
  "optimizations": ["Specific optimization opportunities for better performance"],
  "summary": "Brief overall assessment based on Phase 3 enhanced validation criteria"
}

# ENHANCED VALIDATION METHODOLOGY (PHASE 3)
1. **Content Richness Analysis**: Evaluate all major sections, content authenticity, and utilization percentage
2. **Modern UI/UX Assessment**: Check gradient backgrounds, glassmorphism, hover animations, and 2024-2025 design trends
3. **Accessibility Compliance**: Verify WCAG 2.1 AA standards, ARIA labels, keyboard navigation, contrast ratios
4. **Code Quality Review**: Analyze React patterns, hooks optimization, code structure, and technical compliance
5. **Critical Issue Identification**: Flag any issues preventing production deployment
6. **Actionable Recommendations**: Provide specific, implementable improvements

# ENHANCED SCORING GUIDELINES (PHASE 3)
- **90-100 points**: State-of-the-art quality, exceeds all Phase 3 requirements, production-ready
- **80-89 points**: Good quality, meets most Phase 3 requirements, minor improvements needed
- **70-79 points**: Acceptable quality, meets some requirements, several improvements needed  
- **60-69 points**: Below Phase 3 standards, significant improvements required
- **Below 60**: Major issues, extensive rework needed to meet requirements

**Target Score for Phase 3**: ≥90/100 (Requirements specify 90-95/100 for good pages)

# COMPREHENSIVE VALIDATION CHECK
Before responding, ensure you have thoroughly evaluated:
- [ ] Content richness: All sections present, realistic content, ≥80% utilization
- [ ] Modern UI/UX: Gradient backgrounds, glassmorphism, hover animations implemented
- [ ] Accessibility: ARIA labels, contrast ratios, keyboard navigation
- [ ] Code quality: React best practices, hooks optimization, technical compliance
- [ ] Overall assessment aligns with Phase 3 enhanced requirements

Generate the comprehensive validation report now:`;
  }

  /**
   * Parse structured validation response from AI
   */
  parseValidationResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ [ValidatorAgent] No JSON found in response');
        return null;
      }

      const validationData = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!this.validateResponseStructure(validationData)) {
        console.error('❌ [ValidatorAgent] Invalid validation response structure');
        return null;
      }

      return validationData;
    } catch (error) {
      console.error('❌ [ValidatorAgent] JSON parsing error:', error.message);
      return null;
    }
  }

  /**
   * Validate the structure of AI validation response (Phase 3 Enhanced)
   */
  validateResponseStructure(data) {
    // Check for alternative response format (cross-referenced validation)
    const alternativeRequiredFields = [
      'overallScore',
      'passed',
      'contentUtilization',
      'requirementTraceability',
      'modernDesignCompliance',
      'codeQuality',
      'accessibility',
      'criticalIssues',
      'summary'
    ];
    
    const hasAlternativeFormat = alternativeRequiredFields.every(field => field in data);
    if (hasAlternativeFormat) {
      return true; // Accept alternative format
    }
    
    // Check for standard format (Phase 3 Enhanced)
    const requiredFields = [
      'overallScore',
      'passed', 
      'weightedScores',
      'categories',
      'criticalIssues',
      'optimizations',
      'summary'
    ];

    const requiredWeightedScores = [
      'contentRichness',
      'modernUIUX',
      'accessibility', 
      'codeQuality'
    ];

    const requiredCategories = [
      'contentRichness',
      'modernUIUX',
      'accessibility',
      'codeQuality'
    ];

    // Check main fields
    for (const field of requiredFields) {
      if (!(field in data)) {
        console.error(`❌ [ValidatorAgent] Missing required field: ${field}`);
        return false;
      }
    }

    // Check weightedScores
    if (!data.weightedScores || typeof data.weightedScores !== 'object') {
      console.error('❌ [ValidatorAgent] Invalid weightedScores structure');
      return false;
    }

    for (const score of requiredWeightedScores) {
      if (!(score in data.weightedScores)) {
        console.error(`❌ [ValidatorAgent] Missing weighted score: ${score}`);
        return false;
      }
    }

    // Check categories
    if (!data.categories || typeof data.categories !== 'object') {
      console.error('❌ [ValidatorAgent] Invalid categories structure');
      return false;
    }

    for (const category of requiredCategories) {
      if (!(category in data.categories)) {
        console.error(`❌ [ValidatorAgent] Missing category: ${category}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate missing form fields for validation
   */
  calculateMissingFields(pageSpec, code) {
    const requiredFields = pageSpec.formFields?.required || ['name', 'email', 'message'];
    const codeText = code.reactCode.toLowerCase();
    let missingCount = 0;
    
    for (const field of requiredFields) {
      if (!codeText.includes(field.toLowerCase()) && !codeText.includes(`name="${field}"`)) {
        missingCount++;
      }
    }
    
    return missingCount;
  }

  /**
   * Calculate missing sections for validation
   */
  calculateMissingSections(pageSpec, code) {
    const requiredSections = pageSpec.sections?.filter(s => s.required).map(s => s.name.toLowerCase()) || [];
    const codeText = code.reactCode.toLowerCase();
    let missingCount = 0;
    
    for (const section of requiredSections) {
      // Check for section-related keywords in the code
      const sectionKeywords = this.getSectionKeywords(section);
      const hasSection = sectionKeywords.some(keyword => codeText.includes(keyword));
      
      if (!hasSection) {
        missingCount++;
      }
    }
    
    return missingCount;
  }

  /**
   * Get keywords that indicate presence of a section
   */
  getSectionKeywords(sectionName) {
    const keywords = {
      'hero': ['hero', 'banner', 'jumbotron', 'main-banner'],
      'contact': ['contact', 'form', 'input', 'message'],
      'about': ['about', 'company', 'mission', 'story'],
      'testimonials': ['testimonial', 'review', 'rating', 'feedback'],
      'features': ['feature', 'service', 'benefit', 'offering'],
      'pricing': ['price', 'plan', 'package', 'tier'],
      'stats': ['statistic', 'metric', 'number', 'achievement']
    };
    
    return keywords[sectionName] || [sectionName];
  }

  /**
   * CRITICAL FIX #1: Generate specific, actionable Tailwind-focused guidance
   * Provides concrete class additions and modifications for TailwindStylistAgent
   */
  generateSpecificTailwindGuidance(uiuxValidation, templateValidation, industryValidation, reactCode, pageSpec) {
    const guidance = {
      interactionStates: [],
      responsiveDesign: [],
      colorContrast: [],
      glassmorphism: [],
      modernPatterns: [],
      industrySpecific: [],
      templateFixes: []
    };

    // Analyze failed rules and provide specific Tailwind class recommendations
    if (uiuxValidation.detailedResults) {
      Object.entries(uiuxValidation.detailedResults).forEach(([ruleId, result]) => {
        if (result.status === 'FAIL') {
          switch (ruleId) {
            case 'interactionStates':
              guidance.interactionStates.push({
                issue: 'Missing hover/focus states on interactive elements',
                fix: 'Add hover:bg-blue-600 hover:scale-105 focus:ring-2 focus:ring-blue-500 to buttons',
                targetElements: ['button', 'a', 'input'],
                specificClasses: 'hover:bg-blue-600 hover:scale-105 focus:ring-2 focus:ring-blue-500 transition-all duration-200'
              });
              break;
            case 'responsiveDesign':
              guidance.responsiveDesign.push({
                issue: 'Insufficient responsive breakpoints',
                fix: 'Add responsive classes: text-sm sm:text-base md:text-lg, px-4 md:px-8, py-2 md:py-4',
                targetElements: ['text elements', 'containers'],
                specificClasses: 'text-sm sm:text-base md:text-lg px-4 md:px-8 py-2 md:py-4'
              });
              break;
            case 'colorContrast':
              guidance.colorContrast.push({
                issue: 'Low color contrast ratios detected',
                fix: 'Replace text-gray-400 with text-gray-700, text-blue-300 with text-blue-600',
                targetElements: ['text elements'],
                specificClasses: 'text-gray-700 dark:text-gray-300 text-blue-600 dark:text-blue-400'
              });
              break;
            case 'glassmorphism':
              guidance.glassmorphism.push({
                issue: 'Missing modern glassmorphism effects',
                fix: 'Add backdrop-blur-sm bg-white/20 border border-white/30 to cards',
                targetElements: ['cards', 'modals', 'overlays'],
                specificClasses: 'backdrop-blur-sm bg-white/20 dark:bg-gray-900/20 border border-white/30 dark:border-gray-700/30'
              });
              break;
          }
        }
      });
    }

    // Add industry-specific guidance
    if (industryValidation.violations && industryValidation.violations.length > 0) {
      industryValidation.violations.forEach(violation => {
        guidance.industrySpecific.push({
          issue: `Industry violation: ${violation.description}`,
          fix: this.getIndustrySpecificFix(violation, pageSpec.industry),
          targetElements: [violation.element || 'general'],
          specificClasses: this.getIndustryTailwindClasses(pageSpec.industry)
        });
      });
    }

    // Add template pattern fixes
    if (templateValidation.detectedPatterns && templateValidation.detectedPatterns.length > 0) {
      templateValidation.detectedPatterns.forEach(pattern => {
        guidance.templateFixes.push({
          issue: `Generic template pattern: ${pattern.description}`,
          fix: this.getUniquePatternAlternative(pattern),
          targetElements: [pattern.element || 'general'],
          specificClasses: this.getUniquePatternClasses(pattern.type)
        });
      });
    }

    return guidance;
  }

  /**
   * CRITICAL FIX #1: Generate actionable fixes with before/after examples
   * Provides exact code transformations for TailwindStylistAgent
   */
  generateActionableFixes(uiuxValidation, reactCode, pageSpec) {
    const fixes = [];

    // Analyze code for specific issues and provide exact fixes
    const codeLines = reactCode.split('\n');
    
    // Fix 1: Missing hover states on buttons
    codeLines.forEach((line, index) => {
      if (line.includes('<button') && !line.includes('hover:')) {
        fixes.push({
          type: 'interactionStates',
          lineNumber: index + 1,
          currentCode: line.trim(),
          fixedCode: line.replace(
            /className="([^"]*)"/, 
            'className="$1 hover:bg-blue-600 hover:scale-105 transition-all duration-200"'
          ).trim(),
          explanation: 'Added hover states and transitions for better user feedback'
        });
      }
    });

    // Fix 2: Missing responsive classes
    codeLines.forEach((line, index) => {
      if ((line.includes('text-') && !line.includes('sm:')) || 
          (line.includes('px-') && !line.includes('md:'))) {
        fixes.push({
          type: 'responsiveDesign',
          lineNumber: index + 1,
          currentCode: line.trim(),
          fixedCode: this.addResponsiveClasses(line),
          explanation: 'Added responsive breakpoints for mobile-first design'
        });
      }
    });

    // Fix 3: Low contrast colors
    codeLines.forEach((line, index) => {
      if (line.includes('text-gray-400') || line.includes('text-blue-300')) {
        fixes.push({
          type: 'colorContrast',
          lineNumber: index + 1,
          currentCode: line.trim(),
          fixedCode: line
            .replace('text-gray-400', 'text-gray-700 dark:text-gray-300')
            .replace('text-blue-300', 'text-blue-600 dark:text-blue-400'),
          explanation: 'Improved color contrast for WCAG 2.1 AA compliance'
        });
      }
    });

    // Fix 4: Missing glassmorphism effects
    codeLines.forEach((line, index) => {
      if (line.includes('bg-white') && !line.includes('backdrop-blur')) {
        fixes.push({
          type: 'glassmorphism',
          lineNumber: index + 1,
          currentCode: line.trim(),
          fixedCode: line.replace(
            'bg-white',
            'backdrop-blur-sm bg-white/90 dark:bg-gray-900/90'
          ),
          explanation: 'Added modern glassmorphism effect for contemporary look'
        });
      }
    });

    return fixes.slice(0, 10); // Limit to top 10 most critical fixes
  }

  /**
   * Helper: Get industry-specific fix recommendations
   */
  getIndustrySpecificFix(violation, industry) {
    const fixes = {
      healthcare: 'Use medical-appropriate colors: bg-green-50 text-green-800, emphasize trust and professionalism',
      finance: 'Use financial-appropriate colors: bg-blue-50 text-blue-900, emphasize security and stability',
      technology: 'Use tech-appropriate colors: bg-indigo-50 text-indigo-900, emphasize innovation and modernity',
      education: 'Use education-appropriate colors: bg-purple-50 text-purple-900, emphasize learning and growth',
      ecommerce: 'Use commerce-appropriate colors: bg-orange-50 text-orange-900, emphasize conversion and trust',
      default: 'Use industry-neutral professional colors: bg-gray-50 text-gray-900'
    };
    
    return fixes[industry] || fixes.default;
  }

  /**
   * Helper: Get industry-specific Tailwind classes
   */
  getIndustryTailwindClasses(industry) {
    const classes = {
      healthcare: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100',
      finance: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100',
      technology: 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100',
      education: 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100',
      ecommerce: 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100',
      default: 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100'
    };
    
    return classes[industry] || classes.default;
  }

  /**
   * Helper: Get unique pattern alternatives to avoid templates
   */
  getUniquePatternAlternative(pattern) {
    const alternatives = {
      gradient: 'Use asymmetric gradient: from-blue-400 via-purple-500 to-pink-500 at custom angles',
      glassmorphism: 'Use layered transparency: backdrop-blur-md bg-gradient-to-r from-white/30 to-blue-100/40',
      spacing: 'Use unconventional spacing: pt-12 pb-16 px-6 md:pt-20 md:pb-24 md:px-12',
      typography: 'Use varied font weights: font-light text-4xl + font-bold text-lg mix',
      default: 'Create unique visual patterns specific to this industry and content'
    };
    
    return alternatives[pattern.type] || alternatives.default;
  }

  /**
   * Helper: Get unique pattern-specific classes
   */
  getUniquePatternClasses(patternType) {
    const uniqueClasses = {
      gradient: 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500',
      glassmorphism: 'backdrop-blur-md bg-gradient-to-r from-white/30 to-blue-100/40 border border-white/40',
      spacing: 'pt-12 pb-16 px-6 md:pt-20 md:pb-24 md:px-12',
      typography: 'font-light text-4xl leading-tight tracking-wide',
      default: 'bg-gradient-to-r from-indigo-500 to-purple-600'
    };
    
    return uniqueClasses[patternType] || uniqueClasses.default;
  }

  /**
   * Helper: Add responsive classes to existing line
   */
  addResponsiveClasses(line) {
    let fixed = line;
    
    // Add responsive text sizes
    fixed = fixed.replace(/text-(xs|sm|base|lg|xl|2xl)/, 'text-sm sm:text-base md:text-lg');
    
    // Add responsive padding
    fixed = fixed.replace(/px-(\d+)/, 'px-4 md:px-8');
    fixed = fixed.replace(/py-(\d+)/, 'py-2 md:py-4');
    
    // Add responsive margins
    fixed = fixed.replace(/mb-(\d+)/, 'mb-4 md:mb-8');
    fixed = fixed.replace(/mt-(\d+)/, 'mt-4 md:mt-8');
    
    return fixed;
  }

  /**
   * Merge output validation, UI/UX validation, and AI validation results
   */
  // Removed complex mergeValidationResults - using single validation method now
}

module.exports = { ValidatorAgent };
