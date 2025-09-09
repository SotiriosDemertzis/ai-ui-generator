/**
 * @file backend/ai/validation/UIUXRulesValidator.js
 * @description UI/UX Rules Validator for comprehensive design compliance checking
 * @version 1.0 - Phase 2 Implementation from MULTIAGENT_SYSTEM_IMPROVEMENT_PLAN.md
 */

const fs = require('fs');
const path = require('path');

/**
 * UIUXRulesValidator - Comprehensive UI/UX compliance validation system
 * Implements Modern UI/UX Rules validation based on .claude/ModernUIUXRules.json
 */
class UIUXRulesValidator {
  constructor() {
    this.version = '1.1';
    this.validatorType = 'UIUXRulesValidator';
    this.rulesCache = null;
    this.loadUIUXRules();
    
    // Initialize template pattern detection (Phase 6.2)
    this.templatePatterns = this.initializeTemplatePatterns();
    this.industryRequirements = this.initializeIndustryRequirements();
  }

  /**
   * Load UI/UX rules from ModernUIUXRules.json
   */
  loadUIUXRules() {
    try {
      const rulesPath = path.join(__dirname, '../../../.claude/ModernUIUXRules.json');
      const rulesData = fs.readFileSync(rulesPath, 'utf8');
      this.rulesCache = JSON.parse(rulesData);
      console.log(`📋 [UIUXRulesValidator] Loaded ${this.rulesCache.rules.length} rule categories with ${this.getTotalRulesCount()} total rules`);
    } catch (error) {
      console.error('❌ [UIUXRulesValidator] Failed to load UI/UX rules:', error.message);
      // Fallback to basic rules structure
      this.rulesCache = this.getFallbackRules();
    }
  }

  /**
   * Get total count of all rules across categories
   */
  getTotalRulesCount() {
    if (!this.rulesCache || !this.rulesCache.rules) return 0;
    return this.rulesCache.rules.reduce((total, category) => {
      return total + (category.rules ? category.rules.length : 0);
    }, 0);
  }

  /**
   * Validate React component code against UI/UX rules
   */
  async validateComponent(componentCode, pageSpec = {}, design = {}) {
    console.log('🔍 [UIUXRulesValidator] Starting comprehensive UI/UX validation...');
    
    const validation = {
      overallScore: 0,
      passed: false,
      compliance: 'NON-COMPLIANT',
      mandatoryRulesPassed: false,
      categories: {},
      summary: {
        totalRules: 0,
        passedRules: 0,
        partialRules: 0,
        failedRules: 0,
        mandatoryFailures: []
      },
      recommendations: [],
      criticalIssues: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Validate each rule category
      for (const category of this.rulesCache.rules) {
        const categoryResult = await this.validateCategory(componentCode, category, pageSpec, design);
        validation.categories[category.category] = categoryResult;
        
        // Track mandatory rule failures
        categoryResult.mandatoryFailures.forEach(failure => {
          validation.summary.mandatoryFailures.push(failure);
        });
      }

      // Calculate overall results
      this.calculateOverallResults(validation);
      
      console.log(`📊 [UIUXRulesValidator] Validation complete: ${validation.overallScore}% (${validation.compliance})`);
      console.log(`📋 [UIUXRulesValidator] Rules: ${validation.summary.passedRules}/${validation.summary.totalRules} passed`);
      
      if (!validation.passed) {
        console.log(`⚠️ [UIUXRulesValidator] Critical Issues: ${validation.criticalIssues.length}`);
        validation.criticalIssues.forEach(issue => console.log(`   - ${issue}`));
      }

      return validation;
      
    } catch (error) {
      console.error('❌ [UIUXRulesValidator] Validation failed:', error.message);
      return {
        ...validation,
        error: error.message,
        passed: false,
        overallScore: 0
      };
    }
  }

  /**
   * Validate a specific rule category
   */
  async validateCategory(componentCode, category, pageSpec, design) {
    const result = {
      category: category.category,
      score: 0,
      maxScore: category.rules.length,
      rules: [],
      mandatoryFailures: [],
      recommendations: [],
      issues: []
    };

    for (const rule of category.rules) {
      const ruleResult = await this.validateRule(componentCode, rule, pageSpec, design);
      result.rules.push(ruleResult);
      
      // Score calculation
      if (ruleResult.status === 'PASS') {
        result.score += 1;
      } else if (ruleResult.status === 'PARTIAL') {
        result.score += 0.5;
      }
      
      // Track mandatory rule failures
      if (rule.mandatory && ruleResult.status === 'FAIL') {
        result.mandatoryFailures.push({
          rule: rule.id,
          text: rule.text,
          issue: ruleResult.reason
        });
      }
      
      // Collect issues and recommendations
      if (ruleResult.issue) {
        result.issues.push(ruleResult.issue);
      }
      
      if (ruleResult.recommendation) {
        result.recommendations.push(ruleResult.recommendation);
      }
    }

    result.scorePercentage = Math.round((result.score / result.maxScore) * 100);
    return result;
  }

  /**
   * Validate individual UI/UX rule
   */
  async validateRule(componentCode, rule, pageSpec, design) {
    const ruleResult = {
      id: rule.id,
      text: rule.text,
      mandatory: rule.mandatory,
      status: 'FAIL',
      reason: '',
      issue: null,
      recommendation: null,
      evidence: []
    };

    try {
      const codeAnalysis = this.analyzeCode(componentCode);
      
      switch (rule.id) {
        case 'responsiveDesign':
          return this.validateResponsiveDesign(componentCode, codeAnalysis, ruleResult);
          
        case 'noHorizontalScroll':
          return this.validateNoHorizontalScroll(componentCode, codeAnalysis, ruleResult);
          
        case 'spacingSystem':
          return this.validateSpacingSystem(componentCode, codeAnalysis, ruleResult);
          
        case 'whiteSpace':
          return this.validateWhiteSpace(componentCode, codeAnalysis, ruleResult);
          
        case 'visualHierarchy':
          return this.validateVisualHierarchy(componentCode, codeAnalysis, ruleResult);
          
        case 'typographyConsistency':
          return this.validateTypographyConsistency(componentCode, codeAnalysis, ruleResult);
          
        case 'actionEmphasis':
          return this.validateActionEmphasis(componentCode, codeAnalysis, ruleResult);
          
        case 'progressiveDisclosure':
          return this.validateProgressiveDisclosure(componentCode, codeAnalysis, ruleResult);
          
        case 'colorContrast':
          return this.validateColorContrast(componentCode, codeAnalysis, ruleResult);
          
        case 'brandColors':
          return this.validateBrandColors(componentCode, codeAnalysis, ruleResult, design);
          
        case 'avoidPureBlackWhite':
          return this.validateAvoidPureBlackWhite(componentCode, codeAnalysis, ruleResult);
          
        case 'typography':
          return this.validateTypography(componentCode, codeAnalysis, ruleResult);
          
        case 'lineHeight':
          return this.validateLineHeight(componentCode, codeAnalysis, ruleResult);
          
        case 'fontSize':
          return this.validateFontSize(componentCode, codeAnalysis, ruleResult);
          
        case 'darkMode':
          return this.validateDarkMode(componentCode, codeAnalysis, ruleResult);
          
        case 'roundedCorners':
          return this.validateRoundedCorners(componentCode, codeAnalysis, ruleResult);
          
        case 'depth':
          return this.validateDepth(componentCode, codeAnalysis, ruleResult);
          
        case 'animations':
          return this.validateAnimations(componentCode, codeAnalysis, ruleResult);
          
        case 'designSystemConsistency':
          return this.validateDesignSystemConsistency(componentCode, codeAnalysis, ruleResult);
          
        case 'clearNavigation':
          return this.validateClearNavigation(componentCode, codeAnalysis, ruleResult);
          
        case 'desktopMobileNav':
          return this.validateDesktopMobileNav(componentCode, codeAnalysis, ruleResult);
          
        case 'breadcrumbs':
          return this.validateBreadcrumbs(componentCode, codeAnalysis, ruleResult);
          
        case 'coreNavigationVisible':
          return this.validateCoreNavigationVisible(componentCode, codeAnalysis, ruleResult);
          
        case 'menuLabels':
          return this.validateMenuLabels(componentCode, codeAnalysis, ruleResult);
          
        case 'searchProminence':
          return this.validateSearchProminence(componentCode, codeAnalysis, ruleResult);
          
        case 'activePageIndicator':
          return this.validateActivePageIndicator(componentCode, codeAnalysis, ruleResult);
          
        case 'noDeadEnds':
          return this.validateNoDeadEnds(componentCode, codeAnalysis, ruleResult);
          
        case 'interactionStates':
          return this.validateInteractionStates(componentCode, codeAnalysis, ruleResult);
          
        case 'touchFeedback':
          return this.validateTouchFeedback(componentCode, codeAnalysis, ruleResult);
          
        case 'loadingStates':
          return this.validateLoadingStates(componentCode, codeAnalysis, ruleResult);
          
        case 'stateDistinction':
          return this.validateStateDistinction(componentCode, codeAnalysis, ruleResult);
          
        case 'optimisticUI':
          return this.validateOptimisticUI(componentCode, codeAnalysis, ruleResult);
          
        case 'gestureSupport':
          return this.validateGestureSupport(componentCode, codeAnalysis, ruleResult);
          
        case 'keyboardShortcuts':
          return this.validateKeyboardShortcuts(componentCode, codeAnalysis, ruleResult);
          
        case 'focusKeyboard':
          return this.validateFocusKeyboard(componentCode, codeAnalysis, ruleResult);
          
        case 'skipToContent':
          return this.validateSkipToContent(componentCode, codeAnalysis, ruleResult);
          
        case 'semanticHTML':
          return this.validateSemanticHTML(componentCode, codeAnalysis, ruleResult);
          
        case 'iconLabels':
          return this.validateIconLabels(componentCode, codeAnalysis, ruleResult);
          
        case 'reducedMotion':
          return this.validateReducedMotion(componentCode, codeAnalysis, ruleResult);
          
        case 'noFlashing':
          return this.validateNoFlashing(componentCode, codeAnalysis, ruleResult);
          
        case 'inclusiveCopy':
          return this.validateInclusiveCopy(componentCode, codeAnalysis, ruleResult);
          
        default:
          // Generic validation for rules without specific implementation
          return this.validateGenericRule(componentCode, rule, ruleResult);
      }
      
    } catch (error) {
      ruleResult.reason = `Validation error: ${error.message}`;
      ruleResult.status = 'FAIL';
      return ruleResult;
    }
  }

  /**
   * Analyze React component code structure
   */
  analyzeCode(componentCode) {
    const analysis = {
      hasResponsive: false,
      hasSpacing: false,
      hasTypography: false,
      hasInteractiveElements: false,
      hasAccessibility: false,
      hasAnimations: false,
      hasNavigation: false,
      tailwindClasses: [],
      // antdComponents: [],  // REMOVED - NO ANT DESIGN
      imports: [],
      jsxElements: []
    };

    // Extract imports
    const importMatches = componentCode.match(/import.*?from.*?['"][^'"]+['"]/g) || [];
    analysis.imports = importMatches;

    // Extract Tailwind classes
    const classNameMatches = componentCode.match(/className\s*=\s*["']([^"']+)["']/g) || [];
    classNameMatches.forEach(match => {
      const classes = match.match(/["']([^"']+)["']/)[1].split(/\s+/);
      analysis.tailwindClasses = analysis.tailwindClasses.concat(classes);
    });

    // Enhanced responsive design detection with Ant Design patterns
    analysis.hasResponsive = /\b(xs|sm|md|lg|xl|xxl)\s*=\s*\{?\d+|\b(xs|sm|md|lg|xl)\:|responsive|Row|Col|gutter|Grid\.Row|Grid\.Col/.test(componentCode);

    // Enhanced spacing system detection with Ant Design Space component
    analysis.hasSpacing = /\b(p-|m-|px-|py-|mx-|my-|pt-|pb-|pl-|pr-|mt-|mb-|ml-|mr-|space-|gap-)\d+|Space\b|gutter|margin|padding/.test(componentCode);

    // Enhanced typography detection with Ant Design Typography components
    analysis.hasTypography = /\b(text-|font-|leading-|tracking-|Typography|Title|Text|Paragraph|h[1-6]|\.Title|\.Text|\.Paragraph)\b/.test(componentCode);

    // Enhanced interactive elements detection with modern React patterns
    analysis.hasInteractiveElements = /\b(Button|onClick|onHover|hover\:|focus\:|active\:|transition|Form|Input|Checkbox|Radio|Card|Carousel|Rate|Statistic)/.test(componentCode);

    // Enhanced accessibility features detection with React patterns
    analysis.hasAccessibility = /\b(aria-|role=|alt=|tabIndex|semantic|header|main|section|footer|nav\b|<nav|<main|<section|<article|Layout\.Header|Layout\.Footer|Layout\.Content)/.test(componentCode);

    // Enhanced animations detection with Tailwind and CSS transitions
    analysis.hasAnimations = /\b(transition|animation|transform|duration|ease|hover\:(scale|translate|shadow)|motion|Carousel|fade|slide)/.test(componentCode);

    // Enhanced navigation detection with Ant Design Layout
    analysis.hasNavigation = /\b(Menu|Navigation|nav|breadcrumb|Link|Router|<nav|navbar|header|Layout|Header|Sider|Layout\.Header)/.test(componentCode);

    // Extract Ant Design components
    // NO ANT DESIGN IMPORTS - REMOVED
    // ANT DESIGN REMOVED - NO COMPONENTS TO ANALYZE

    return analysis;
  }

  // Specific rule validation methods

  validateResponsiveDesign(code, analysis, result) {
    // CRITICAL FIX #4: Enhanced responsive detection for modern Tailwind patterns
    const responsivePatterns = [
      // Tailwind breakpoint classes
      /(sm|md|lg|xl|2xl):([\w-]+)/g,
      // Responsive sizing
      /(w-full|w-1\/2|w-1\/3|w-2\/3|w-1\/4|w-3\/4)/g,
      // Grid responsive patterns
      /(grid-cols-1|grid-cols-2|grid-cols-3|grid-cols-4|grid-cols-6|grid-cols-12)/g,
      // Responsive spacing
      /(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-(1|2|4|6|8|12|16|20|24|32)/g,
      // Responsive text
      /(text-xs|text-sm|text-base|text-lg|text-xl|text-2xl|text-3xl|text-4xl|text-5xl|text-6xl)/g,
      // Responsive flex/grid
      /(flex-col|flex-row|grid|flex)/g
    ];
    
    // Count matches for each pattern type
    const breakpointMatches = (code.match(/(sm|md|lg|xl|2xl):/g) || []).length;
    const responsiveGrids = (code.match(/grid-cols-(\d+|none)/g) || []).length;
    const responsiveText = (code.match(/(sm|md|lg|xl|2xl):text-/g) || []).length;
    const responsiveSpacing = (code.match(/(sm|md|lg|xl|2xl):(p|m)/g) || []).length;
    const responsiveLayout = (code.match(/(sm|md|lg|xl|2xl):(flex|grid|block|hidden)/g) || []).length;
    
    // CRITICAL FIX #4: Container and wrapper patterns
    const hasContainers = /\b(container|max-w-(sm|md|lg|xl|2xl|full|screen))/g.test(code);
    const hasResponsiveWidths = /\b(w-full|w-screen|min-w-|max-w-)/g.test(code);
    
    const totalResponsivePatterns = breakpointMatches + responsiveGrids + responsiveText + responsiveSpacing + responsiveLayout;
    const responsiveTypes = [breakpointMatches, responsiveGrids, responsiveText, responsiveSpacing, responsiveLayout].filter(count => count > 0).length;
    
    // Debug logging
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 [UIUXRulesValidator-DEBUG] ENHANCED ResponsiveDesign Detection:', {
        breakpointMatches,
        responsiveGrids,
        responsiveText,
        responsiveSpacing,
        responsiveLayout,
        hasContainers,
        hasResponsiveWidths,
        totalResponsivePatterns,
        responsiveTypes
      });
    }
    
    if (totalResponsivePatterns >= 5 && responsiveTypes >= 3) {
      result.status = 'PASS';
      result.reason = 'Component implements comprehensive responsive design';
      result.evidence = [`Breakpoint classes: ${breakpointMatches}`, `Responsive grids: ${responsiveGrids}`, `Responsive text: ${responsiveText}`, `Responsive spacing: ${responsiveSpacing}`, `Layout patterns: ${responsiveLayout}`];
    } else if (totalResponsivePatterns >= 3 && responsiveTypes >= 2) {
      result.status = 'PARTIAL';
      result.reason = 'Good responsive patterns present but could be more comprehensive';
      result.recommendation = 'Add more responsive breakpoints across text, spacing, and layout: sm:text-lg md:text-xl lg:text-2xl, sm:p-4 md:p-6 lg:p-8';
    } else if (totalResponsivePatterns > 0) {
      result.status = 'PARTIAL';
      result.reason = 'Basic responsive patterns detected but insufficient';
      result.recommendation = 'Add responsive classes for multiple screen sizes: sm:, md:, lg:, xl: for text, spacing, grids, and layout';
    } else {
      result.status = 'FAIL';
      result.reason = 'No responsive design patterns detected';
      result.issue = 'Component will not adapt properly to different screen sizes';
      result.recommendation = 'Add responsive breakpoint classes: sm:text-base md:text-lg lg:text-xl, sm:p-4 md:p-6, grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
    return result;
  }

  validateNoHorizontalScroll(code, analysis, result) {
    // Check for potential horizontal scroll issues
    const hasFixedWidths = /width:\s*\d+px|w-\d{3,}/.test(code);
    const hasOverflow = /overflow-x:\s*scroll|overflow:\s*scroll/.test(code);
    
    if (hasFixedWidths || hasOverflow) {
      result.status = 'PARTIAL';
      result.reason = 'Potential horizontal scroll detected';
      result.recommendation = 'Use relative units and avoid fixed widths that may cause overflow';
    } else {
      result.status = 'PASS';
      result.reason = 'No obvious horizontal scroll issues';
    }
    return result;
  }

  validateSpacingSystem(code, analysis, result) {
    if (analysis.hasSpacing) {
      // Check for consistent spacing (4px/8px system)
      const spacingClasses = analysis.tailwindClasses.filter(cls => /\b[pm][xytrbl]?-\d+/.test(cls));
      const consistentSpacing = spacingClasses.every(cls => {
        const value = cls.match(/\d+$/)?.[0];
        return value && (parseInt(value) % 2 === 0 || ['1', '3', '5', '7'].includes(value));
      });
      
      if (consistentSpacing) {
        result.status = 'PASS';
        result.reason = 'Consistent spacing system detected';
      } else {
        result.status = 'PARTIAL';
        result.reason = 'Spacing used but may lack consistency';
        result.recommendation = 'Use consistent 4px/8px spacing scale (p-2, p-4, p-8, etc.)';
      }
    } else {
      result.status = 'FAIL';
      result.reason = 'No systematic spacing detected';
      result.issue = 'Component lacks consistent spacing patterns';
      result.recommendation = 'Implement systematic spacing using Tailwind spacing scale';
    }
    return result;
  }

  validateWhiteSpace(code, analysis, result) {
    // Check for intentional white space usage
    const hasSpacing = /\b(p-|m-|space-|gap-)/.test(code);
    const hasLayout = /\b(Grid|Row|Col|Space|Layout)/.test(code);
    
    if (hasSpacing && hasLayout) {
      result.status = 'PASS';
      result.reason = 'Intentional white space usage detected';
    } else if (hasSpacing || hasLayout) {
      result.status = 'PARTIAL';
      result.reason = 'Some white space management present';
      result.recommendation = 'Enhance white space usage for better readability and visual breathing room';
    } else {
      result.status = 'FAIL';
      result.reason = 'Insufficient white space management';
      result.issue = 'Component may appear cramped without proper spacing';
      result.recommendation = 'Add intentional spacing using padding, margins, and layout components';
    }
    return result;
  }

  validateVisualHierarchy(code, analysis, result) {
    // Check for typography hierarchy
    const hasHeadings = /\b(Title|h[1-6]|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl))/.test(code);
    const hasVariedSizes = /text-\w+/.test(code);
    
    if (hasHeadings && hasVariedSizes) {
      result.status = 'PASS';
      result.reason = 'Clear visual hierarchy with varied typography sizes';
    } else if (hasHeadings || hasVariedSizes) {
      result.status = 'PARTIAL';
      result.reason = 'Some visual hierarchy present but could be improved';
      result.recommendation = 'Implement clear heading hierarchy (h1-h6 or Title components) with varied text sizes';
    } else {
      result.status = 'FAIL';
      result.reason = 'No clear visual hierarchy detected';
      result.issue = 'Content lacks clear primary, secondary, and tertiary organization';
      result.recommendation = 'Add clear typography hierarchy using headings and varied text sizes';
    }
    return result;
  }

  validateTypographyConsistency(code, analysis, result) {
    if (analysis.hasTypography) {
      // Check for consistent typography usage
      const hasTypographyComponents = /\b(Typography|Title|Text|Paragraph)/.test(code);
      const hasTailwindTypography = /\btext-\w+/.test(code);
      
      if (hasTypographyComponents || hasTailwindTypography) {
        result.status = 'PASS';
        result.reason = 'Consistent typography components or classes used';
      } else {
        result.status = 'PARTIAL';
        result.reason = 'Typography present but consistency unclear';
        result.recommendation = 'Use consistent typography components (Ant Design Typography) or Tailwind text classes';
      }
    } else {
      result.status = 'FAIL';
      result.reason = 'No systematic typography detected';
      result.issue = 'Component lacks consistent text styling';
      result.recommendation = 'Implement consistent typography using Typography components or Tailwind text classes';
    }
    return result;
  }

  validateActionEmphasis(code, analysis, result) {
    // Check for emphasized actions (buttons, CTAs)
    const hasButtons = /\bButton/.test(code);
    const hasEmphasis = /\b(primary|secondary|ghost|danger|bg-\w+|text-\w+|font-bold)/.test(code);
    
    if (hasButtons && hasEmphasis) {
      result.status = 'PASS';
      result.reason = 'Important actions are visually emphasized';
    } else if (hasButtons) {
      result.status = 'PARTIAL';
      result.reason = 'Buttons present but emphasis could be improved';
      result.recommendation = 'Use button types (primary, secondary) and visual emphasis for important actions';
    } else {
      result.status = 'FAIL';
      result.reason = 'No clear action emphasis detected';
      result.issue = 'Important actions may not stand out to users';
      result.recommendation = 'Add emphasized buttons and CTAs with clear visual hierarchy';
    }
    return result;
  }

  validateProgressiveDisclosure(code, analysis, result) {
    // Check for progressive disclosure patterns
    const hasDisclosure = /\b(Collapse|Accordion|Drawer|Modal|Tabs|dropdown|show|hide)/.test(code);
    
    if (hasDisclosure) {
      result.status = 'PASS';
      result.reason = 'Progressive disclosure patterns implemented';
    } else {
      result.status = 'PARTIAL';
      result.reason = 'May benefit from progressive disclosure for complex content';
      result.recommendation = 'Consider using Collapse, Tabs, or Drawer components for complex information';
    }
    return result;
  }

  validateClearNavigation(code, analysis, result) {
    // CRITICAL FIX: Context-aware navigation validation with enhanced detection
    const isLandingPage = /landing|hero|cta|conversion|store/i.test(code);
    const hasBasicNav = analysis.hasNavigation || /Header|Navbar|Menu|nav\s*>|Layout\.Header|Sider/i.test(code);
    const hasCallToActions = /Button|onClick|href|Link/i.test(code);
    // const hasAntdLayout = /Layout|Header|Sider|Menu/i.test(code); // ANT DESIGN REMOVED
    
    if (hasBasicNav) {
      result.status = 'PASS';
      result.reason = 'Navigation elements or layout structure present';
      result.evidence = ['Basic navigation detected'];
    } else if (isLandingPage && hasCallToActions) {
      // Landing pages focus on conversion, not complex navigation
      result.status = 'PASS'; 
      result.reason = 'Landing page with conversion focus - simplified navigation appropriate';
      result.evidence = ['Landing page pattern detected', 'Call-to-action elements present'];
    } else {
      result.status = 'PARTIAL';
      result.reason = 'Basic interactive elements present but dedicated navigation could be enhanced';
      result.recommendation = 'Consider adding Header with Menu or Breadcrumb components for better navigation';
    }
    return result;
  }

  validateInteractionStates(code, analysis, result) {
    // CRITICAL FIX #4: Enhanced detection for modern Tailwind interaction patterns
    const hasButtons = /\b(Button\b|<button)/i.test(code);
    
    // CRITICAL FIX #4: More sophisticated pattern detection
    const hoverPatterns = [
      /hover:(bg-[\w-]+|text-[\w-]+|border-[\w-]+)/g,
      /hover:(scale-\d+|translate-[\w-]+|shadow-[\w-]+)/g,
      /hover:(opacity-\d+|brightness-\d+)/g
    ];
    
    const focusPatterns = [
      /focus:(ring-\d+|ring-[\w-]+|outline-[\w-]+)/g,
      /focus:(bg-[\w-]+|text-[\w-]+|border-[\w-]+)/g
    ];
    
    const activePatterns = [
      /active:(scale-\d+|translate-[\w-]+)/g,
      /active:(bg-[\w-]+|text-[\w-]+)/g
    ];
    
    const transitionPatterns = [
      /transition(-all|-colors|-opacity|-shadow|-transform)?/g,
      /duration-\d+/g,
      /ease-(in|out|in-out|linear)/g
    ];
    
    // Count matches for each pattern type
    const hoverMatches = hoverPatterns.reduce((count, pattern) => count + (code.match(pattern) || []).length, 0);
    const focusMatches = focusPatterns.reduce((count, pattern) => count + (code.match(pattern) || []).length, 0);
    const activeMatches = activePatterns.reduce((count, pattern) => count + (code.match(pattern) || []).length, 0);
    const transitionMatches = transitionPatterns.reduce((count, pattern) => count + (code.match(pattern) || []).length, 0);
    
    // CRITICAL FIX #4: Interactive elements detection
    const interactiveElements = [
      /\<button\b[^>]*>/g,
      /\<a\b[^>]*>/g,
      /\<input\b[^>]*>/g,
      /\<select\b[^>]*>/g,
      /onClick\s*=/g,
      /cursor-pointer/g
    ];
    
    const interactiveCount = interactiveElements.reduce((count, pattern) => count + (code.match(pattern) || []).length, 0);
    
    // Debug logging for better understanding
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 [UIUXRulesValidator-DEBUG] ENHANCED InteractionStates Detection:', {
        hasButtons,
        hoverMatches,
        focusMatches,
        activeMatches,
        transitionMatches,
        interactiveCount,
        totalInteractionPatterns: hoverMatches + focusMatches + activeMatches
      });
    }
    
    const totalInteractionPatterns = hoverMatches + focusMatches + activeMatches;
    
    // CRITICAL FIX #4: Enhanced scoring logic based on sophisticated pattern detection
    if (interactiveCount > 0 && totalInteractionPatterns >= interactiveCount * 2) {
      // Comprehensive interaction states (2+ states per interactive element)
      result.status = 'PASS';
      result.reason = 'Interactive elements have comprehensive state feedback';
      result.evidence = [`Interactive elements: ${interactiveCount}`, `Hover patterns: ${hoverMatches}`, `Focus patterns: ${focusMatches}`, `Active patterns: ${activeMatches}`, `Transitions: ${transitionMatches}`];
    } else if (interactiveCount > 0 && totalInteractionPatterns >= interactiveCount) {
      // Basic interaction states (1+ state per interactive element)
      result.status = 'PARTIAL';
      result.reason = 'Interactive elements present with basic state feedback';
      result.recommendation = 'Add more comprehensive interaction states: hover:scale-105, focus:ring-2, active:scale-95, transition-all duration-200';
    } else if (interactiveCount > 0 && totalInteractionPatterns > 0) {
      // Some interaction states but insufficient
      result.status = 'PARTIAL';
      result.reason = 'Some interactive elements lack proper state feedback';
      result.recommendation = 'Ensure ALL interactive elements have hover:, focus:, and active: states with transitions';
    } else if (interactiveCount > 0) {
      // Interactive elements but no states
      result.status = 'FAIL';
      result.reason = `Interactive elements found (${interactiveCount}) but no interaction states detected`;
      result.issue = 'Users will not receive visual feedback from interactive elements';
      result.recommendation = 'Add interaction states: hover:bg-blue-600 hover:scale-105 focus:ring-2 focus:ring-blue-500 transition-all duration-200';
    } else {
      // No interactive elements
      result.status = 'FAIL';
      result.reason = 'No interactive elements detected in the component';
      result.issue = 'Component appears to be non-interactive';
      result.recommendation = 'Add buttons, links, or other interactive elements with proper hover and focus states';
    }
    return result;
  }

  validateFocusKeyboard(code, analysis, result) {
    // CRITICAL FIX: More lenient keyboard accessibility validation
    const hasExplicitFocus = /\b(tabIndex|focus:|onKeyDown|keyboard)/i.test(code);
    // const hasAntdComponents = ... // ANT DESIGN REMOVED
    const hasSemanticElements = /\b(button|input|select|textarea|a\s+href)/i.test(code);
    const hasAriaSupport = /\b(aria-|role=)/i.test(code);
    
    if (hasExplicitFocus || hasAriaSupport) {
      result.status = 'PASS';
      result.reason = 'Explicit keyboard accessibility features detected';
      result.evidence = hasExplicitFocus ? ['Explicit focus management'] : ['ARIA support'];
    } else if (hasSemanticElements) {
      // Semantic HTML provides basic keyboard accessibility
      result.status = 'PASS';
      result.reason = 'Semantic HTML elements provide inherent keyboard accessibility';
      result.evidence = ['Semantic HTML elements detected'];
    } else if (analysis.hasInteractiveElements) {
      result.status = 'PARTIAL';
      result.reason = 'Interactive elements present but keyboard accessibility unclear';
      result.recommendation = 'Ensure all interactive elements are keyboard accessible with proper focus management';
    } else {
      result.status = 'FAIL';
      result.reason = 'No keyboard accessibility features detected';
      result.issue = 'Interactive elements may not be accessible via keyboard';
      result.recommendation = 'Add tabIndex, focus states, and keyboard event handlers for accessibility';
    }
    return result;
  }

  // Additional validation methods for other rules...
  validateGenericRule(code, rule, result) {
    // STRICT validation - only pass if clear evidence exists
    const ruleKeywords = this.extractRuleKeywords(rule.text);
    const hasSpecificKeywords = ruleKeywords.some(keyword => 
      new RegExp(keyword, 'i').test(code)
    );
    
    // Very strict - require actual implementation evidence
    if (hasSpecificKeywords && ruleKeywords.length > 0) {
      const foundKeywords = ruleKeywords.filter(k => new RegExp(k, 'i').test(code));
      if (foundKeywords.length >= Math.ceil(ruleKeywords.length / 2)) {
        result.status = 'PASS';
        result.reason = `Specific implementation found: ${foundKeywords.join(', ')}`;
      } else {
        result.status = 'PARTIAL';
        result.reason = `Partial implementation: ${foundKeywords.join(', ')} (${foundKeywords.length}/${ruleKeywords.length})`;
        result.recommendation = `Complete implementation for: ${rule.text}`;
      }
    } else {
      // Default to FAIL - forces proper implementation
      result.status = 'FAIL';
      result.reason = `No evidence of "${rule.text}" implementation`;
      result.issue = `Rule not implemented: ${rule.text}`;
      result.recommendation = `Implement specific requirements: ${ruleKeywords.length > 0 ? ruleKeywords.join(', ') : rule.text}`;
    }
    
    return result;
  }

  // Placeholder methods for remaining rules (to be implemented based on specific requirements)
  validateColorContrast(code, analysis, result) { return this.validateGenericRule(code, { text: 'Color contrast compliance' }, result); }
  validateBrandColors(code, analysis, result, design) { return this.validateGenericRule(code, { text: 'Brand colors consistency' }, result); }
  validateAvoidPureBlackWhite(code, analysis, result) { return this.validateGenericRule(code, { text: 'Avoid pure black and white colors' }, result); }
  validateTypography(code, analysis, result) { return this.validateGenericRule(code, { text: 'Modern typography implementation' }, result); }
  validateLineHeight(code, analysis, result) { return this.validateGenericRule(code, { text: 'Proper line height (≥1.4)' }, result); }
  validateFontSize(code, analysis, result) { return this.validateGenericRule(code, { text: 'Minimum font size compliance' }, result); }
  validateDarkMode(code, analysis, result) { return this.validateGenericRule(code, { text: 'Dark mode support' }, result); }
  validateRoundedCorners(code, analysis, result) { return this.validateGenericRule(code, { text: 'Consistent rounded corners' }, result); }
  validateDepth(code, analysis, result) { return this.validateGenericRule(code, { text: 'Depth indication via shadows' }, result); }
  validateAnimations(code, analysis, result) { return this.validateGenericRule(code, { text: 'Purposeful animations' }, result); }
  validateDesignSystemConsistency(code, analysis, result) { return this.validateGenericRule(code, { text: 'Design system consistency' }, result); }
  validateDesktopMobileNav(code, analysis, result) { return this.validateGenericRule(code, { text: 'Desktop/mobile navigation patterns' }, result); }
  validateBreadcrumbs(code, analysis, result) { return this.validateGenericRule(code, { text: 'Breadcrumb navigation' }, result); }
  validateCoreNavigationVisible(code, analysis, result) { return this.validateGenericRule(code, { text: 'Core navigation visibility' }, result); }
  validateMenuLabels(code, analysis, result) { return this.validateGenericRule(code, { text: 'Clear menu labels' }, result); }
  validateSearchProminence(code, analysis, result) { return this.validateGenericRule(code, { text: 'Prominent search functionality' }, result); }
  validateActivePageIndicator(code, analysis, result) { return this.validateGenericRule(code, { text: 'Active page indication' }, result); }
  validateNoDeadEnds(code, analysis, result) { return this.validateGenericRule(code, { text: 'No navigation dead ends' }, result); }
  validateTouchFeedback(code, analysis, result) { return this.validateGenericRule(code, { text: 'Mobile touch feedback' }, result); }
  validateLoadingStates(code, analysis, result) { return this.validateGenericRule(code, { text: 'Loading states for async actions' }, result); }
  validateStateDistinction(code, analysis, result) { return this.validateGenericRule(code, { text: 'Distinct success/warning/error states' }, result); }
  validateOptimisticUI(code, analysis, result) { return this.validateGenericRule(code, { text: 'Optimistic UI patterns' }, result); }
  validateGestureSupport(code, analysis, result) { return this.validateGenericRule(code, { text: 'Gesture support' }, result); }
  validateKeyboardShortcuts(code, analysis, result) { return this.validateGenericRule(code, { text: 'Keyboard shortcuts' }, result); }
  validateSkipToContent(code, analysis, result) { return this.validateGenericRule(code, { text: 'Skip-to-content link' }, result); }
  validateSemanticHTML(code, analysis, result) { return this.validateGenericRule(code, { text: 'Semantic HTML and ARIA' }, result); }
  validateIconLabels(code, analysis, result) { return this.validateGenericRule(code, { text: 'Accessible icon labels' }, result); }
  validateReducedMotion(code, analysis, result) { return this.validateGenericRule(code, { text: 'Reduced motion respect' }, result); }
  validateNoFlashing(code, analysis, result) { return this.validateGenericRule(code, { text: 'No flashing content' }, result); }
  validateInclusiveCopy(code, analysis, result) { return this.validateGenericRule(code, { text: 'Inclusive language and copy' }, result); }

  /**
   * Extract keywords from rule text for generic validation
   */
  extractRuleKeywords(ruleText) {
    const keywords = [];
    const text = ruleText.toLowerCase();
    
    // Enhanced keyword extraction for modern React/Ant Design patterns
    if (text.includes('responsive')) keywords.push('responsive', 'sm:', 'md:', 'lg:', 'xl:', 'Row', 'Col', 'gutter');
    if (text.includes('color') || text.includes('contrast')) keywords.push('color', 'bg-', 'text-', 'theme', 'primary', 'secondary');
    if (text.includes('typography') || text.includes('font')) keywords.push('Typography', 'Title', 'Text', 'Paragraph', 'font-', 'text-');
    if (text.includes('navigation') || text.includes('menu')) keywords.push('Menu', 'nav', 'breadcrumb', 'Link', 'Header', 'Layout');
    if (text.includes('accessibility') || text.includes('keyboard') || text.includes('focus')) keywords.push('aria-', 'role=', 'alt=', 'tabIndex', 'Button', 'Input');
    if (text.includes('animation') || text.includes('motion') || text.includes('transition')) keywords.push('transition', 'animation', 'duration', 'Carousel', 'hover');
    if (text.includes('spacing') || text.includes('margin') || text.includes('padding')) keywords.push('p-', 'm-', 'space-', 'gap-', 'Space', 'gutter');
    if (text.includes('form') || text.includes('input') || text.includes('validation')) keywords.push('Form', 'Input', 'Button', 'validation', 'error');
    if (text.includes('interaction') || text.includes('button') || text.includes('click')) keywords.push('Button', 'onClick', 'hover:', 'focus:', 'active:');
    if (text.includes('card') || text.includes('container')) keywords.push('Card', 'Layout', 'Container');
    if (text.includes('loading') || text.includes('state')) keywords.push('useState', 'loading', 'Spin', 'Skeleton');
    if (text.includes('dark mode') || text.includes('theme')) keywords.push('theme', 'dark', 'mode', 'ConfigProvider');
    if (text.includes('shadow') || text.includes('depth')) keywords.push('shadow', 'Card', 'elevation');
    if (text.includes('hierarchy') || text.includes('heading')) keywords.push('Title', 'h1', 'h2', 'h3', 'Typography');
    if (text.includes('rounded') || text.includes('corner')) keywords.push('rounded', 'border-radius', 'Card');
    
    return keywords;
  }

  /**
   * Calculate overall validation results
   */
  calculateOverallResults(validation) {
    let totalRules = 0;
    let passedRules = 0;
    let partialRules = 0;
    let failedRules = 0;

    // Count rules across all categories
    Object.values(validation.categories).forEach(category => {
      category.rules.forEach(rule => {
        totalRules++;
        if (rule.status === 'PASS') {
          passedRules++;
        } else if (rule.status === 'PARTIAL') {
          partialRules++;
        } else {
          failedRules++;
        }
      });
    });

    validation.summary.totalRules = totalRules;
    validation.summary.passedRules = passedRules;
    validation.summary.partialRules = partialRules;
    validation.summary.failedRules = failedRules;

    // Calculate score using the formula from ModernUIUXRules.json
    validation.overallScore = totalRules > 0 ? 
      Math.round(((passedRules + 0.5 * partialRules) / totalRules) * 100) : 0;

    // Check mandatory rules
    validation.mandatoryRulesPassed = validation.summary.mandatoryFailures.length === 0;

    // Determine compliance with realistic thresholds for modern development
    const basePassing = this.rulesCache?.scoringSystem?.passingThreshold || 85;
    
    // STRICT threshold system - use original 85% standard as intended
    let effectiveThreshold = basePassing; // Use original 85%
    let complianceLevel;
    
    if (!validation.mandatoryRulesPassed) {
      // Mandatory rules failed - immediate NON-COMPLIANT
      complianceLevel = 'NON-COMPLIANT';
    } else if (validation.overallScore >= effectiveThreshold) {
      // Only COMPLIANT if meets original 85% threshold AND mandatory rules pass
      complianceLevel = 'COMPLIANT';
    } else if (validation.overallScore >= 60) {
      // Partial compliance for scores 60-84%
      complianceLevel = 'NEEDS_IMPROVEMENT';
    } else {
      // Below 60% is NON-COMPLIANT even if mandatory rules pass
      complianceLevel = 'NON-COMPLIANT';
    }
    
    validation.passed = validation.overallScore >= effectiveThreshold && validation.mandatoryRulesPassed;
    validation.compliance = complianceLevel;
    
    // Generate critical issues only for serious problems
    if (!validation.mandatoryRulesPassed) {
      validation.criticalIssues.push(`CRITICAL: Mandatory rules failed: ${validation.summary.mandatoryFailures.map(f => f.rule).join(', ')}`);
    }
    
    if (validation.overallScore < 60) {
      validation.criticalIssues.push(`CRITICAL: Overall score ${validation.overallScore}% indicates significant UI/UX issues`);
    } else if (validation.overallScore < effectiveThreshold) {
      validation.criticalIssues.push(`WARNING: Score ${validation.overallScore}% below required ${effectiveThreshold}% threshold for compliance`);
    }
    
    // Add threshold info to validation
    validation.thresholdInfo = {
      originalThreshold: basePassing,
      effectiveThreshold: effectiveThreshold,
      complianceLevel: complianceLevel,
      mandatoryRulesPassed: validation.mandatoryRulesPassed,
      adjustmentReason: validation.mandatoryRulesPassed ? 
        'Mandatory rules passed - using progressive threshold system' : 
        'Mandatory rules failed - using strict validation'
    };

    // Generate recommendations
    Object.values(validation.categories).forEach(category => {
      validation.recommendations = validation.recommendations.concat(category.recommendations);
    });
  }

  /**
   * Validate design compliance against specifications
   * Enhanced validation for pure AI generation system
   */
  validateDesignCompliance(componentCode, designSpec) {
    const compliance = {
      colorUsage: this.validateColorUsage(componentCode, designSpec.colors),
      typographyConsistency: this.validateTypography(componentCode, designSpec.typography),
      interactionPatterns: this.validateInteractions(componentCode, designSpec.microInteractions),
      layoutAdherence: this.validateLayout(componentCode, designSpec.layout)
    };
    
    return {
      overallScore: this.calculateDesignScore(compliance),
      issues: this.identifyDesignIssues(compliance),
      recommendations: this.generateDesignRecommendations(compliance)
    };
  }

  validateColorUsage(code, colorSpec) {
    if (!colorSpec) return { score: 0, issues: ['No color specification provided'] };
    
    const primaryUsage = code.includes(colorSpec.primary) || 
                        code.includes(`bg-[${colorSpec.primary}]`);
    const gradientUsage = colorSpec.primaryGradients?.some(gradient =>
      code.includes(`from-[${gradient.from}]`) && code.includes(`to-[${gradient.to}]`)
    ) || false;
    
    return {
      primaryColorUsed: primaryUsage,
      gradientsImplemented: gradientUsage,
      colorConsistency: this.checkColorConsistency(code, colorSpec),
      score: (primaryUsage ? 40 : 0) + (gradientUsage ? 30 : 0) + 30
    };
  }

  validateTypography(code, typographySpec) {
    if (!typographySpec) return { score: 0, issues: ['No typography specification provided'] };
    
    const headingFontUsed = code.includes(typographySpec.headingFont?.replace(/\s+/g, '_')) ||
                           code.includes(`font-['${typographySpec.headingFont?.replace(/\s+/g, '_')}']`);
    const bodyFontUsed = code.includes(typographySpec.bodyFont?.replace(/\s+/g, '_')) ||
                        code.includes(`font-['${typographySpec.bodyFont?.replace(/\s+/g, '_')}']`);
    const dynamicSizing = typographySpec.dynamicSizing ? 
                         code.includes('clamp(') || code.includes('text-responsive') : true;
    
    return {
      headingFontImplemented: headingFontUsed,
      bodyFontImplemented: bodyFontUsed,
      dynamicSizingImplemented: dynamicSizing,
      score: (headingFontUsed ? 35 : 0) + (bodyFontUsed ? 35 : 0) + (dynamicSizing ? 30 : 0)
    };
  }

  validateInteractions(code, interactionSpec) {
    if (!interactionSpec) return { score: 0, issues: ['No interaction specification provided'] };
    
    const buttonHover = code.includes(interactionSpec.buttonHover) ||
                       code.includes('hover:scale-105') ||
                       code.includes('hover:shadow-xl');
    const cardHover = code.includes(interactionSpec.cardHover) ||
                     code.includes('hover:shadow-2xl') ||
                     code.includes('hover:-translate-y-1');
    const inputFocus = code.includes(interactionSpec.inputFocus) ||
                      code.includes('focus:ring-2') ||
                      code.includes('focus:ring-primary/20');
    const transitions = code.includes(interactionSpec.transitionSpeed) ||
                       code.includes('duration-300') ||
                       code.includes('transition-all');
    
    return {
      buttonHoverImplemented: buttonHover,
      cardHoverImplemented: cardHover,
      inputFocusImplemented: inputFocus,
      transitionsImplemented: transitions,
      score: (buttonHover ? 25 : 0) + (cardHover ? 25 : 0) + (inputFocus ? 25 : 0) + (transitions ? 25 : 0)
    };
  }

  validateLayout(code, layoutSpec) {
    if (!layoutSpec) return { score: 100, issues: [] }; // Layout is less critical
    
    const responsive = code.includes('sm:') || code.includes('md:') || code.includes('lg:');
    const grid = code.includes('grid') || code.includes('flex');
    const spacing = code.includes('space-y-') || code.includes('gap-') || code.includes('py-');
    
    return {
      responsiveImplemented: responsive,
      gridSystemImplemented: grid,
      spacingSystemImplemented: spacing,
      score: (responsive ? 40 : 0) + (grid ? 30 : 0) + (spacing ? 30 : 0)
    };
  }

  checkColorConsistency(code, colorSpec) {
    // Check if colors are consistently used throughout the component
    const primaryCount = (code.match(new RegExp(colorSpec.primary, 'g')) || []).length;
    const secondaryCount = (code.match(new RegExp(colorSpec.secondary, 'g')) || []).length;
    
    return {
      primaryUsageCount: primaryCount,
      secondaryUsageCount: secondaryCount,
      isConsistent: primaryCount >= 1 && secondaryCount >= 1
    };
  }

  calculateDesignScore(compliance) {
    const scores = Object.values(compliance).map(c => c.score || 0);
    return Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length);
  }

  identifyDesignIssues(compliance) {
    const issues = [];
    
    if (!compliance.colorUsage.primaryColorUsed) {
      issues.push('Primary color from design spec not used in component');
    }
    
    if (!compliance.typographyConsistency.headingFontImplemented) {
      issues.push('Specified heading font not implemented');
    }
    
    if (!compliance.typographyConsistency.bodyFontImplemented) {
      issues.push('Specified body font not implemented');
    }
    
    if (!compliance.interactionPatterns.buttonHoverImplemented) {
      issues.push('Button hover effects from design spec not implemented');
    }
    
    if (!compliance.layoutAdherence.responsiveImplemented) {
      issues.push('Responsive design patterns not properly implemented');
    }
    
    return issues;
  }

  generateDesignRecommendations(compliance) {
    const recommendations = [];
    
    if (compliance.colorUsage.score < 80) {
      recommendations.push('Improve color usage by implementing primary and secondary colors from design spec');
    }
    
    if (compliance.typographyConsistency.score < 80) {
      recommendations.push('Implement specified typography fonts and dynamic sizing');
    }
    
    if (compliance.interactionPatterns.score < 80) {
      recommendations.push('Add micro-interactions as specified in design (hover effects, focus states)');
    }
    
    if (compliance.layoutAdherence.score < 80) {
      recommendations.push('Improve responsive layout implementation with proper breakpoints');
    }
    
    return recommendations;
  }

  /**
   * Get fallback rules if ModernUIUXRules.json cannot be loaded
   */
  getFallbackRules() {
    return {
      scoringSystem: {
        PASS: "rule fully met",
        PARTIAL: "rule partially met or inconsistent", 
        FAIL: "rule not met or missing",
        mandatoryRules: ["responsiveDesign", "accessibilityBaseline", "clearNavigation", "interactionFeedback", "noBlockingErrors"],
        compliance: "If any mandatory rule = FAIL → page NON-COMPLIANT",
        finalScoreFormula: "(#PASS + 0.5 * #PARTIAL) / totalRules * 100",
        passingThreshold: 85
      },
      rules: [
        {
          category: "LayoutAndStructure",
          rules: [
            { id: "responsiveDesign", text: "Pages must be fully responsive", mandatory: true },
            { id: "spacingSystem", text: "Consistent spacing system", mandatory: false },
            { id: "visualHierarchy", text: "Clear visual hierarchy", mandatory: false }
          ]
        }
      ]
    };
  }
  
  /**
   * Initialize template pattern detection (Phase 6.2)
   */
  initializeTemplatePatterns() {
    return {
      // Hardcoded gradient patterns
      gradientPatterns: [
        /from-violet-600\s+via-purple-600\s+to-indigo-600/g,
        /from-violet-500\s+to-purple-600/g,
        /from-blue-600\s+via-purple-600\s+to-indigo-600/g,
        /from-indigo-500\s+to-purple-600/g
      ],
      
      // Generic glassmorphism patterns
      glassmorphismPatterns: [
        /backdrop-blur-xl\s+bg-white\/10/g,
        /bg-white\/80\s+backdrop-blur-sm/g
      ],
      
      // Cookie-cutter hover effects
      hoverPatterns: [
        /hover:scale-105(?!\s+hover:scale-110)/g, // Exact scale without variation
        /hover:-translate-y-1(?!\s+hover:-translate-y-2)/g // Exact translate without variation
      ],
      
      // Template typography scales
      typographyPatterns: [
        /text-6xl\s+lg:text-7xl/g,
        /text-5xl\s+md:text-6xl/g
      ],
      
      // Generic spacing patterns
      spacingPatterns: [
        /py-20\s+px-8(?!\s)/g, // Exact spacing without variation
        /p-8\s+py-20/g
      ]
    };
  }
  
  /**
   * Initialize industry-specific requirements (Phase 6.1)
   */
  initializeIndustryRequirements() {
    return {
      'Healthcare': {
        requiredColors: ['green', 'teal', 'blue', 'cyan'],
        forbiddenColors: ['red', 'orange'], // No aggressive colors
        requiredSections: ['services', 'team', 'contact'],
        trustFactors: ['certifications', 'credentials', 'insurance'],
        tone: 'professional-caring'
      },
      'E-commerce': {
        requiredColors: ['red', 'orange', 'yellow', 'purple'],
        forbiddenColors: ['gray', 'muted'], // No boring colors
        requiredSections: ['products', 'reviews', 'checkout'],
        trustFactors: ['reviews', 'security', 'returns'],
        tone: 'energetic-conversion'
      },
      'Technology': {
        requiredColors: ['blue', 'purple', 'cyan', 'indigo'],
        forbiddenColors: ['brown', 'beige'], // No earthy tones
        requiredSections: ['solutions', 'features', 'pricing'],
        trustFactors: ['security', 'uptime', 'compliance'],
        tone: 'innovative-intelligent'
      },
      'Finance': {
        requiredColors: ['blue', 'navy', 'green', 'gold'],
        forbiddenColors: ['pink', 'bright'], // No playful colors
        requiredSections: ['services', 'expertise', 'compliance'],
        trustFactors: ['regulation', 'security', 'credentials'],
        tone: 'trustworthy-professional'
      },
      'Education': {
        requiredColors: ['blue', 'purple', 'orange', 'green'],
        forbiddenColors: ['black', 'dark'], // No intimidating colors
        requiredSections: ['programs', 'faculty', 'admissions'],
        trustFactors: ['accreditation', 'placement', 'faculty'],
        tone: 'inspiring-achievement'
      },
      'Real Estate': {
        requiredColors: ['blue', 'brown', 'gold', 'green'],
        forbiddenColors: ['bright', 'neon'], // No unprofessional colors
        requiredSections: ['properties', 'agents', 'services'],
        trustFactors: ['licensing', 'experience', 'testimonials'],
        tone: 'luxury-trust'
      }
    };
  }
  
  /**
   * Validate industry specificity (Phase 6.1)
   */
  validateIndustrySpecificity(componentCode, industry) {
    console.log(`🎯 [UIUXRulesValidator] Validating industry specificity for: ${industry}`);
    
    const requirements = this.industryRequirements[industry] || this.industryRequirements['Technology'];
    const validation = {
      colorCompliance: this.validateIndustryColors(componentCode, industry),
      contentRelevance: this.validateContentRelevance(componentCode, industry),
      visualAlignment: this.validateVisualAlignment(componentCode, industry),
      templateAvoidance: this.validateTemplateAvoidance(componentCode)
    };
    
    const scores = Object.values(validation).map(v => v.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      passed: averageScore >= 75,
      score: Math.round(averageScore),
      requirements: validation,
      recommendations: this.generateImprovementRecommendations(validation, industry),
      industry: industry,
      industryRequirements: requirements
    };
  }
  
  /**
   * Validate industry-appropriate colors (Phase 6.1)
   */
  validateIndustryColors(componentCode, industry) {
    const requirements = this.industryRequirements[industry] || this.industryRequirements['Technology'];
    const codeText = componentCode.toLowerCase();
    
    let score = 50; // Base score
    const findings = [];
    
    // Check for required colors
    const requiredColorFound = requirements.requiredColors.some(color => {
      return codeText.includes(color) || codeText.includes(this.getColorVariations(color));
    });
    
    if (requiredColorFound) {
      score += 30;
      findings.push(`✅ Industry-appropriate colors detected`);
    } else {
      findings.push(`❌ Missing industry-specific colors: ${requirements.requiredColors.join(', ')}`);
    }
    
    // Check for forbidden colors
    const forbiddenColorFound = requirements.forbiddenColors.some(color => {
      return codeText.includes(color) || codeText.includes(this.getColorVariations(color));
    });
    
    if (forbiddenColorFound) {
      score -= 25;
      findings.push(`❌ Inappropriate colors detected for ${industry}`);
    } else {
      score += 20;
      findings.push(`✅ No inappropriate colors detected`);
    }
    
    return {
      passed: score >= 75,
      score: Math.max(0, Math.min(100, score)),
      findings: findings,
      requiredColors: requirements.requiredColors,
      forbiddenColors: requirements.forbiddenColors
    };
  }
  
  /**
   * Validate template avoidance (Phase 6.2)
   */
  validateTemplateAvoidance(componentCode) {
    console.log('🚫 [UIUXRulesValidator] Validating template pattern avoidance...');
    
    const allPatterns = [
      ...this.templatePatterns.gradientPatterns,
      ...this.templatePatterns.glassmorphismPatterns,
      ...this.templatePatterns.hoverPatterns,
      ...this.templatePatterns.typographyPatterns,
      ...this.templatePatterns.spacingPatterns
    ];
    
    const foundPatterns = [];
    let templateScore = 100;
    
    // Check each pattern category
    Object.entries(this.templatePatterns).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        const matches = componentCode.match(pattern);
        if (matches) {
          foundPatterns.push({
            category: category,
            pattern: pattern.source,
            matches: matches,
            severity: this.getPatternSeverity(category)
          });
          templateScore -= this.getPatternSeverity(category);
        }
      });
    });
    
    return {
      passed: foundPatterns.length === 0,
      score: Math.max(0, templateScore),
      foundPatterns: foundPatterns,
      message: foundPatterns.length > 0 
        ? `Template patterns detected: ${foundPatterns.map(p => p.category).join(', ')}` 
        : 'No template patterns found - creative implementation detected',
      recommendations: foundPatterns.length > 0 
        ? this.generateTemplateAlternatives(foundPatterns)
        : []
    };
  }
  
  /**
   * Validate content relevance to industry
   */
  validateContentRelevance(componentCode, industry) {
    const requirements = this.industryRequirements[industry] || this.industryRequirements['Technology'];
    const codeText = componentCode.toLowerCase();
    
    let score = 40; // Base score
    const findings = [];
    
    // Check for required sections
    const foundSections = requirements.requiredSections.filter(section => 
      codeText.includes(section) || codeText.includes(section.replace('-', ' '))
    );
    
    score += (foundSections.length / requirements.requiredSections.length) * 40;
    findings.push(`Found ${foundSections.length}/${requirements.requiredSections.length} required sections`);
    
    // Check for trust factors
    const foundTrustFactors = requirements.trustFactors.filter(factor => 
      codeText.includes(factor) || codeText.includes(factor.replace('-', ' '))
    );
    
    score += (foundTrustFactors.length / requirements.trustFactors.length) * 20;
    findings.push(`Found ${foundTrustFactors.length}/${requirements.trustFactors.length} trust factors`);
    
    return {
      passed: score >= 70,
      score: Math.round(score),
      findings: findings,
      foundSections: foundSections,
      foundTrustFactors: foundTrustFactors
    };
  }
  
  /**
   * Validate visual alignment with industry
   */
  validateVisualAlignment(componentCode, industry) {
    const requirements = this.industryRequirements[industry] || this.industryRequirements['Technology'];
    const codeText = componentCode.toLowerCase();
    
    let score = 60; // Base score
    const findings = [];
    
    // Check for industry-appropriate tone
    const toneKeywords = this.getToneKeywords(requirements.tone);
    const foundToneKeywords = toneKeywords.filter(keyword => codeText.includes(keyword));
    
    if (foundToneKeywords.length > 0) {
      score += 25;
      findings.push(`✅ Industry tone detected: ${foundToneKeywords.join(', ')}`);
    } else {
      findings.push(`❌ Missing industry tone keywords for ${requirements.tone}`);
    }
    
    // Check for modern patterns (non-template)
    const modernPatterns = ['backdrop-blur', 'gradient', 'shadow', 'rounded', 'transition'];
    const foundPatterns = modernPatterns.filter(pattern => codeText.includes(pattern));
    
    score += (foundPatterns.length / modernPatterns.length) * 15;
    findings.push(`Modern patterns: ${foundPatterns.length}/${modernPatterns.length}`);
    
    return {
      passed: score >= 75,
      score: Math.round(score),
      findings: findings,
      expectedTone: requirements.tone,
      foundToneKeywords: foundToneKeywords
    };
  }
  
  /**
   * Generate improvement recommendations
   */
  generateImprovementRecommendations(validation, industry) {
    const recommendations = [];
    
    // Color compliance recommendations
    if (!validation.colorCompliance.passed) {
      recommendations.push({
        category: 'Color System',
        priority: 'high',
        issue: 'Industry-inappropriate color palette',
        solution: `Use ${validation.colorCompliance.requiredColors.join(', ')} colors for ${industry}`,
        example: `Replace generic patterns with industry-appropriate colors`
      });
    }
    
    // Template avoidance recommendations
    if (!validation.templateAvoidance.passed) {
      recommendations.push({
        category: 'Creative Implementation',
        priority: 'high',
        issue: 'Template patterns detected',
        solution: 'Replace template patterns with creative alternatives',
        example: validation.templateAvoidance.recommendations[0] || 'Use unique gradient combinations'
      });
    }
    
    // Content relevance recommendations
    if (!validation.contentRelevance.passed) {
      recommendations.push({
        category: 'Content Strategy',
        priority: 'medium',
        issue: 'Missing industry-specific content',
        solution: `Include ${industry}-specific sections and trust factors`,
        example: `Add sections for ${validation.contentRelevance.foundSections.join(', ')}`
      });
    }
    
    return recommendations;
  }
  
  /**
   * Get color variations for validation
   */
  getColorVariations(color) {
    const colorMap = {
      'red': ['red-', 'rose-', 'crimson', 'scarlet'],
      'blue': ['blue-', 'sky-', 'cyan-', 'azure'],
      'green': ['green-', 'emerald-', 'teal-', 'mint'],
      'purple': ['purple-', 'violet-', 'indigo-', 'lavender'],
      'orange': ['orange-', 'amber-', 'yellow-', 'gold'],
      'brown': ['brown-', 'amber-', 'orange-', 'yellow-'],
      'gray': ['gray-', 'slate-', 'zinc-', 'neutral'],
      'pink': ['pink-', 'rose-', 'fuchsia-']
    };
    
    return colorMap[color] ? colorMap[color].join('|') : color;
  }
  
  /**
   * Get pattern severity score
   */
  getPatternSeverity(category) {
    const severityMap = {
      'gradientPatterns': 30,      // High severity - obvious template
      'glassmorphismPatterns': 20, // Medium severity - common template  
      'hoverPatterns': 15,         // Medium severity - generic interaction
      'typographyPatterns': 10,    // Low severity - common scale
      'spacingPatterns': 5         // Low severity - common spacing
    };
    
    return severityMap[category] || 10;
  }
  
  /**
   * Generate template alternatives
   */
  generateTemplateAlternatives(foundPatterns) {
    const alternatives = [];
    
    foundPatterns.forEach(pattern => {
      switch (pattern.category) {
        case 'gradientPatterns':
          alternatives.push('Use industry-specific color gradients based on color psychology');
          break;
        case 'glassmorphismPatterns':
          alternatives.push('Create contextual transparency effects appropriate for industry');
          break;
        case 'hoverPatterns':
          alternatives.push('Design hover states that enhance industry-specific workflows');
          break;
        case 'typographyPatterns':
          alternatives.push('Use typography scales that communicate industry expertise');
          break;
        case 'spacingPatterns':
          alternatives.push('Apply spacing patterns that reflect industry content hierarchy');
          break;
      }
    });
    
    return [...new Set(alternatives)]; // Remove duplicates
  }
  
  /**
   * Get tone keywords for validation
   */
  getToneKeywords(tone) {
    const toneMap = {
      'professional-caring': ['care', 'compassion', 'health', 'wellness', 'trust', 'expert'],
      'energetic-conversion': ['shop', 'buy', 'save', 'deal', 'free', 'fast', 'now'],
      'innovative-intelligent': ['innovation', 'smart', 'advanced', 'cutting-edge', 'intelligent'],
      'trustworthy-professional': ['secure', 'expert', 'professional', 'trusted', 'certified'],
      'inspiring-achievement': ['success', 'achieve', 'learn', 'grow', 'future', 'opportunity'],
      'luxury-trust': ['premium', 'luxury', 'exclusive', 'expert', 'professional', 'quality']
    };
    
    return toneMap[tone] || ['professional', 'quality'];
  }
}

module.exports = { UIUXRulesValidator };