/**
 * @file backend/ai/agents/tailwindStylistAgent.js
 * @description TailwindStylist Agent - Enhances components with modern UI/UX compliant Tailwind styles
 * @version 1.0 - New Architecture Implementation
 */

const { runAgent } = require('./runAgent');
const fs = require('fs');
const path = require('path');

/**
 * TailwindStylist Agent - Applies modern UI/UX styling with Tailwind CSS
 * Ensures generated components follow ModernUIUXRules.json standards
 */
class TailwindStylistAgent {
  constructor() {
    this.version = '1.0';
    this.agentType = 'TailwindStylistAgent';
    this.loadUIUXRules();
    // Use creative principles instead of hard-coded patterns
    this.creativePrinciples = {
      modernTechniques: {
        glassmorphism: 'Use sophisticated transparency effects appropriate for industry',
        gradients: 'Create unique gradient combinations that reflect industry personality',
        microInteractions: 'Design hover states that enhance industry-specific workflows'
      }
    };
  }

  /**
   * Load UI/UX rules for compliance checking
   */
  loadUIUXRules() {
    try {
      const rulesPath = path.join(__dirname, '..', '..', '.claude', 'ModernUIUXRules.json');
      const rulesData = fs.readFileSync(rulesPath, 'utf8');
      this.uiuxRules = JSON.parse(rulesData);
      console.log('📋 [TailwindStylistAgent] Loaded UI/UX rules for styling compliance');
    } catch (error) {
      console.warn('⚠️ [TailwindStylistAgent] Could not load UI/UX rules, using fallback patterns');
      this.uiuxRules = this.getFallbackRules();
    }
  }

  /**
   * Apply modern Tailwind styling to generated component
   * CRITICAL FIX #1: Enhanced to process specific validation guidance
   */
  async applyModernStyling(componentCode, pageSpec = {}, design = {}, layout = {}, validationIssues = [], designImplementation = null, validationGuidance = null) {
    console.log('[TailwindStylistAgent] Start styling');
    // Essential concise logs for data flow
    console.log('[TailwindStylistAgent] Styling start');
    if (validationIssues?.length > 0) {
      console.log('[TailwindStylistAgent] Validation issues:', validationIssues.length);
    }
    if (validationGuidance) {
      console.log('[TailwindStylistAgent] Validation guidance present');
    }
    try {
      // Analyze current styling
      const analysisStartTime = Date.now();
      const styleAnalysis = this.analyzeCurrentStyling(componentCode);
      const analysisEndTime = Date.now();
      console.log('[TailwindStylistAgent] Style analysis done in', analysisEndTime - analysisStartTime, 'ms');

      // Apply advanced styling from design implementation if present
      let enhancedCode = componentCode;
      if (designImplementation) {
        enhancedCode = this.enhanceWithAdvancedStyling(componentCode, design);
        console.log('[TailwindStylistAgent] Design implementation enhancements applied');
      }

      // Generate styling improvements
      const improvementStartTime = Date.now();
      const stylingImprovements = await this.generateStylingImprovements(
        enhancedCode,
        styleAnalysis,
        pageSpec,
        design,
        layout,
        validationIssues,
        validationGuidance
      );
      const improvementEndTime = Date.now();
      console.log('[TailwindStylistAgent] Styling improvements generated in', improvementEndTime - improvementStartTime, 'ms');

      // Apply the improvements
      const applicationStartTime = Date.now();
      const styledComponent = this.applyStylingImprovements(enhancedCode, stylingImprovements);
      const applicationEndTime = Date.now();
      console.log('[TailwindStylistAgent] Styling improvements applied in', applicationEndTime - applicationStartTime, 'ms');

      // Validate the styling
      const validationStartTime = Date.now();
      const stylingValidation = this.validateStyling(styledComponent);
      const validationEndTime = Date.now();
      console.log('[TailwindStylistAgent] Styling validation done in', validationEndTime - validationStartTime, 'ms');

      const result = {
        success: true,
        styledComponent,
        improvements: stylingImprovements,
        validation: stylingValidation,
        changes: this.calculateChanges(componentCode, styledComponent),
        _metadata: {
          originalAnalysis: styleAnalysis,
          improvementsApplied: stylingImprovements?.improvements?.length || 0,
          validationScore: stylingValidation?.score || 0
        },
        timestamp: new Date().toISOString()
      };

      console.log('[TailwindStylistAgent] Styling completed');
      return result;
    } catch (error) {
      console.error('[TailwindStylistAgent] Styling failed:', error.message);
      return {
        success: false,
        error: error.message,
        styledComponent: componentCode,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze current styling in the component
   */
  analyzeCurrentStyling(componentCode) {
    const analysis = {
      responsiveClasses: [],
      interactionStates: [],
      modernPatterns: [],
      accessibilityFeatures: [],
      colorSystem: [],
      spacing: [],
      typography: [],
      issues: []
    };

    // Extract all className attributes
    const classNameMatches = componentCode.match(/className\s*=\s*["']([^"']+)["']/g) || [];
    const allClasses = classNameMatches.map(match => 
      match.match(/["']([^"']+)["']/)[1]
    ).join(' ').split(/\s+/);

    // Analyze responsive classes
    analysis.responsiveClasses = allClasses.filter(cls => /^(sm|md|lg|xl|2xl):/.test(cls));

    // Analyze interaction states
    analysis.interactionStates = allClasses.filter(cls => 
      /^(hover|focus|active|disabled|group-hover):/.test(cls)
    );

    // Analyze modern patterns
    analysis.modernPatterns = this.detectModernPatterns(componentCode);

    // Analyze accessibility features
    analysis.accessibilityFeatures = this.detectAccessibilityFeatures(componentCode);

    // Analyze color system
    analysis.colorSystem = allClasses.filter(cls => 
      /^(bg|text|border)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)/.test(cls)
    );

    // Analyze spacing
    analysis.spacing = allClasses.filter(cls => 
      /^(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|space|gap)-/.test(cls)
    );

    // Analyze typography
    analysis.typography = allClasses.filter(cls => 
      /^(text|font|leading|tracking)/.test(cls)
    );

    // Identify issues
    if (analysis.responsiveClasses.length === 0) {
      analysis.issues.push('No responsive breakpoint classes found');
    }
    if (analysis.interactionStates.length === 0) {
      analysis.issues.push('No interaction states (hover, focus) detected');
    }
    if (!componentCode.includes('transition')) {
      analysis.issues.push('No smooth transitions for interactions');
    }
    if (analysis.modernPatterns.length === 0) {
      analysis.issues.push('Missing modern design patterns');
    }

    return analysis;
  }

  /**
   * Detect modern design patterns in code
   */
  detectModernPatterns(code) {
    const patterns = [];
    
    // Glassmorphism
    if (/backdrop-blur|bg-white\/\d+|bg-gray.*\/\d+/.test(code)) {
      patterns.push('glassmorphism');
    }
    
    // Gradients
    if (/bg-gradient/.test(code)) {
      patterns.push('gradients');
    }
    
    // Shadows & depth
    if (/shadow-(sm|md|lg|xl|2xl)/.test(code)) {
      patterns.push('depth-shadows');
    }
    
    // Rounded corners
    if (/rounded-(lg|xl|2xl|3xl)/.test(code)) {
      patterns.push('modern-rounded');
    }
    
    // Micro-interactions
    if (/hover:(scale|translate|rotate)/.test(code)) {
      patterns.push('micro-interactions');
    }

    return patterns;
  }

  /**
   * Detect accessibility features
   */
  detectAccessibilityFeatures(code) {
    const features = [];
    
    if (/aria-/.test(code)) features.push('aria-attributes');
    if (/role=/.test(code)) features.push('semantic-roles');
    if (/alt=/.test(code)) features.push('image-alt');
    if (/tabIndex/.test(code)) features.push('keyboard-navigation');
    if (/focus:ring/.test(code)) features.push('focus-indicators');
    
    return features;
  }

  /**
   * Generate styling improvements using AI
   * CRITICAL FIX #1: Enhanced with specific validation guidance processing
   * Can be called with separate parameters OR a single context object
   */
  async generateStylingImprovements(componentCode, styleAnalysis, pageSpec, design, layout, validationIssues, validationGuidance = null, context = null) {
    if (arguments.length === 1 && typeof componentCode === 'object' && componentCode.componentCode) {
      context = componentCode;
      ({ componentCode, styleAnalysis, pageSpec, design, layout, validationIssues, validationGuidance } = context);
    }
    const prompt = this.buildStylingPrompt(componentCode, styleAnalysis, pageSpec, design, layout, validationIssues, validationGuidance);
    console.log('[TailwindStylistAgent] Generating styling improvements');
    const aiResult = await runAgent('TailwindStylistAgent', prompt, { pageSpec, design, layout }, {
      temperature: 0.3,
      maxTokens: 4000
    });
    if (!aiResult.success) {
      throw new Error(`Styling improvement generation failed: ${aiResult.error}`);
    }
    let improvements;
    const { parseJSONResponse } = require('./runAgent');
    const parseResult = parseJSONResponse(aiResult.response);
    if (parseResult.success) {
      improvements = parseResult.data;
    } else {
      console.warn('[TailwindStylistAgent] Failed to parse AI response, using fallback improvements');
      improvements = this.getFallbackImprovements(styleAnalysis, validationIssues);
    }
    return improvements;
  }

  /**
   * Build AI prompt for styling improvements
   * CRITICAL FIX #1: Enhanced with specific validation guidance integration
   */
  buildStylingPrompt(componentCode, styleAnalysis, pageSpec, design, layout, validationIssues, validationGuidance = null) {
    const uiuxRulesText = this.getRelevantUIUXRules();
    
    return `You are a Senior UI/UX Designer and Tailwind CSS Expert specializing in MANDATORY UI/UX compliance. You MUST achieve 75%+ UI/UX compliance or the component will be REJECTED.

# 🚨 CRITICAL MISSION: ACHIEVE 75%+ UI/UX COMPLIANCE

**CURRENT COMPONENT**:
\`\`\`jsx
${componentCode}
\`\`\`

**STYLE ANALYSIS**:
- Responsive classes: ${styleAnalysis.responsiveClasses.length} found
- Interaction states: ${styleAnalysis.interactionStates.length} found  
- Modern patterns: ${styleAnalysis.modernPatterns.join(', ') || 'None'}
- Issues identified: ${styleAnalysis.issues.join(', ') || 'None'}

**VALIDATION ISSUES TO FIX** (PRIORITY - MUST RESOLVE ALL):
${validationIssues.length > 0 ? validationIssues.map(issue => `🚨 CRITICAL: ${issue}`).join('\n') : 'None specified - Focus on increasing overall UI/UX compliance from current 66% to 75%+'}

${validationGuidance ? this.buildSpecificGuidanceSection(validationGuidance) : ''}

**PAGE CONTEXT**:
- Type: ${pageSpec.type}
- Industry: ${pageSpec.industry}
- Design Style: ${design.type || design.designType}

**DYNAMIC DESIGN SYSTEM - MANDATORY USAGE:**
${this.buildDynamicDesignSystemInstructions(design)}

🚨 CRITICAL: You MUST use ONLY the design system values above. NEVER use hardcoded colors, gradients, or patterns. All styling MUST be derived from the provided design system data.

# 🚨 MANDATORY UI/UX RULES (MUST IMPLEMENT ALL):
${uiuxRulesText}

**🚨 CRITICAL MANDATORY RULES (MUST IMPLEMENT ALL 5 OR COMPONENT REJECTED):**

1. **RESPONSIVE DESIGN** (Rule ID: responsiveDesign - MANDATORY)
   ❌ FAILING: Missing responsive breakpoints on layout elements
   ✅ REQUIRED FIX: Add responsive classes to ALL elements:
   - Containers: max-w-sm md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 
   - Grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
   - Text: text-base md:text-lg lg:text-xl xl:text-2xl
   - Spacing: p-4 md:p-6 lg:p-8 xl:p-10
   - Gaps: gap-4 md:gap-6 lg:gap-8

2. **INTERACTION STATES** (Rule ID: interactionStates - MANDATORY) 
   ❌ FAILING: Missing hover/focus/active states on interactive elements
   ✅ REQUIRED FIX: Add interaction states to ALL clickable elements:
   - Buttons: hover:bg-blue-600 active:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200
   - Links: hover:text-blue-600 hover:underline transition-colors duration-200  
   - Cards: hover:shadow-lg hover:scale-105 transition-all duration-300
   - Inputs: focus:border-blue-500 focus:ring-2 focus:ring-blue-200

3. **ACCESSIBILITY BASELINE** (Rule ID: accessibilityBaseline - MANDATORY)
   ❌ FAILING: Missing focus outlines and ARIA attributes
   ✅ REQUIRED FIX: 
   - Focus outlines: focus:ring-2 focus:ring-blue-500 focus:outline-none on ALL interactive elements
   - ARIA labels: aria-label="descriptive text" on buttons, links, form controls
   - Semantic HTML: Use <header>, <nav>, <main>, <section>, <footer>
   - Color contrast: text-gray-900 on light, text-gray-100 on dark (never pure black/white)

4. **CLEAR NAVIGATION** (Rule ID: clearNavigation - MANDATORY)
   ❌ FAILING: Navigation lacks proper styling and states  
   ✅ REQUIRED FIX:
   - Persistent navigation: sticky top-0 z-50 bg-white/90 backdrop-blur-md
   - Clear labels: Descriptive text (not just icons) for all nav items
   - Active states: bg-blue-100 dark:bg-blue-800 for current section
   - Mobile menu: Hidden menu with hamburger toggle for mobile

5. **NO BLOCKING ERRORS** (Rule ID: noBlockingErrors - MANDATORY)
   ❌ FAILING: Missing error handling and loading states
   ✅ REQUIRED FIX:
   - Loading states: <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
   - Error boundaries: Error state handling with user-friendly messages
   - Form validation: HTML5 validation with visual error states text-red-500
   - Fallbacks: Default content when data fails to load

**IMMEDIATE PRIORITY FIXES FOR 75%+ COMPLIANCE** (Currently 56/87 = 66%, Need 31+ more rules):

🎯 **HIGH IMPACT FIXES (Target: +20 rules)**:
1. **Responsive Design** (~8 rules): Add sm:, md:, lg:, xl:, 2xl: to EVERY container, text, spacing element
2. **Interaction States** (~6 rules): Add hover:, focus:, active:, disabled: to ALL buttons, links, inputs  
3. **Accessibility Focus** (~6 rules): Add focus:ring-2 focus:ring-offset-2 to ALL interactive elements

🎯 **MEDIUM IMPACT FIXES (Target: +15 rules)**:
4. **Typography System** (~5 rules): Consistent text-* sizes, leading-relaxed, font weights
5. **Color System** (~4 rules): Replace pure black/white with text-gray-900/text-gray-100
6. **Spacing System** (~3 rules): Use space-y-*, consistent p-*, m-* patterns
7. **Visual Effects** (~3 rules): Add shadows, gradients, proper rounded corners

🎯 **SPECIFIC FAILING RULE TARGETS**:
- whiteSpace: Add space-y-4 sm:space-y-6 between sections
- visualHierarchy: text-3xl font-bold (h1), text-xl font-semibold (h2), text-base (body)
- actionEmphasis: bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md
- animations: transition-all duration-200 ease-in-out on ALL interactive elements
- darkMode: dark:bg-gray-900 dark:text-gray-100 variants
- depth: shadow-sm on cards, shadow-md on buttons, shadow-lg on modals
- brandColors: Use consistent color palette throughout
- lineHeight: leading-relaxed on body text, leading-tight on headings

**MANDATORY STYLING IMPROVEMENTS**:
1. **Responsive Design**: Add comprehensive responsive classes to EVERY layout element
   - Container: \`px-4 sm:px-6 lg:px-8\`
   - Text: \`text-sm sm:text-base md:text-lg\`
   - Spacing: \`py-8 sm:py-12 md:py-16\`
   
2. **Interaction States**: Add complete state management to ALL interactive elements
   - Buttons: \`hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 active:scale-95 transition-all duration-200\`
   - Links: \`hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500\`
   
3. **Modern Patterns**: Apply cutting-edge 2024 patterns
   - Glassmorphism: \`bg-white/80 backdrop-blur-sm border border-white/20\`
   - Shadows: \`shadow-lg hover:shadow-xl transition-shadow\`
   - Gradients: Use design system colors for industry-appropriate gradients (NO hardcoded patterns)
   
4. **Accessibility**: Implement comprehensive a11y features
   - Focus rings: \`focus:ring-2 focus:ring-offset-2 focus:ring-blue-500\`
   - Screen readers: Add proper aria-labels
   - Keyboard navigation: Ensure all interactive elements are focusable
   
5. **Typography**: Modern type scale with perfect readability
   - Headings: \`text-3xl sm:text-4xl md:text-5xl font-bold leading-tight\`
   - Body: \`text-base leading-relaxed\`
   - Small text: \`text-sm leading-relaxed\`
   
6. **Color System**: Modern professional palette
   - Avoid pure black/white: Use \`text-gray-900\` and \`bg-gray-50\`
   - Consistent brand colors throughout
   - Proper contrast ratios
   
7. **Spacing**: Consistent spacing system
   - Container spacing: \`px-4 sm:px-6 lg:px-8\`
   - Section spacing: \`py-12 sm:py-16 md:py-20\`
   - Element spacing: \`space-y-6 sm:space-y-8\`
   
8. **Animations**: Smooth micro-interactions
   - Transitions: \`transition-all duration-200 ease-in-out\`
   - Hover effects: \`hover:scale-105 hover:shadow-lg\`
   - Button presses: \`active:scale-95\`

**🎯 COMPLIANCE TARGET: You MUST achieve 75%+ (66+ rules passing) - Current: 56/87 = 66%**
**REQUIRED: Identify and fix 10+ specific failing rules to reach target**

**OUTPUT FORMAT** (JSON):
{
  "complianceAnalysis": {
    "currentScore": "Estimate current compliance %",
    "targetScore": "75%+",
    "rulesFixed": "Number of rules you expect this update to fix",
    "priorityFixes": ["List the highest impact rule fixes in this update"]
  },
  "improvements": [
    {
      "type": "responsive",
      "description": "Add responsive breakpoints to container",
      "oldClass": "p-4", 
      "newClass": "p-4 sm:p-6 md:p-8 lg:p-10",
      "element": "main container",
      "rule": "responsiveDesign",
      "impact": "high"
    },
    {
      "type": "interaction", 
      "description": "Add complete interaction states",
      "oldClass": "bg-blue-500",
      "newClass": "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 active:scale-95 transition-all duration-200",
      "element": "button",
      "rule": "interactionStates",
      "impact": "high"
    }
  ],
  "patterns": {
    "glassmorphism": "bg-white/80 backdrop-blur-sm",
    "shadows": "shadow-lg hover:shadow-xl",
    "gradients": "Use design.colorSystem.primaryGradients for dynamic industry colors",
    "rounded": "rounded-xl",
    "focus": "focus:ring-2 focus:ring-blue-500 focus:outline-none"
  },
  "accessibility": [
    "Add tabIndex={0} to interactive elements",
    "Include aria-label for icon buttons", 
    "Use semantic HTML tags (header, main, section)"
  ],
  "compliance": {
    "mandatoryRules": ["responsiveDesign", "interactionStates", "focusKeyboard"],
    "targetScore": 90
  }
}

Generate the styling improvements JSON:`;
  }

  /**
   * Get relevant UI/UX rules for the prompt
   */
  getRelevantUIUXRules() {
    if (!this.uiuxRules || !this.uiuxRules.rules) return 'Modern UI/UX standards';
    
    const mandatoryRules = this.uiuxRules.scoringSystem?.mandatoryRules || [];
    const rulesText = [];
    
    this.uiuxRules.rules.forEach(category => {
      category.rules.forEach(rule => {
        if (mandatoryRules.includes(rule.id) || rule.mandatory) {
          rulesText.push(`**${rule.id}** (MANDATORY): ${rule.text}`);
        }
      });
    });
    
    return rulesText.slice(0, 10).join('\n'); // Limit to top 10 rules
  }

  /**
   * Apply styling improvements to the component
   */
  applyStylingImprovements(componentCode, improvements) {
    let styledCode = componentCode;
    let changesApplied = 0;
    if (!improvements || !improvements.improvements) {
      console.warn('[TailwindStylistAgent] No improvements to apply');
      return styledCode;
    }
    improvements.improvements.forEach((improvement, index) => {
      if (improvement.oldClass && improvement.newClass) {
        let replacementMade = false;
        // CRITICAL FIX 2025-09-08: Enhanced dynamic class detection and replacement
        // Method 1: Direct class replacement in className attributes
        const classRegex = new RegExp(
          `(className\\s*=\\s*["'])([^"']*\\b${improvement.oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^"']*)`,
          'g'
        );
        
        styledCode = styledCode.replace(classRegex, (match, prefix, classes) => {
          const newClasses = classes.replace(improvement.oldClass, improvement.newClass);
          if (classes !== newClasses) {
            replacementMade = true;
            // Concise log:
            console.log(`[TailwindStylistAgent] Replaced '${improvement.oldClass}' → '${improvement.newClass}'`);
          }
          return prefix + newClasses;
        });
        
        // Method 2: Pattern-based replacement for similar classes if direct replacement failed
        if (!replacementMade && improvement.oldClass) {
          // Extract base class pattern (e.g., 'p-4' from 'p-4', 'bg-blue-500' from 'bg-blue-500')
          const basePattern = improvement.oldClass.split('-')[0];
          if (basePattern) {
            const patternRegex = new RegExp(`\\b${basePattern}-[\\w\\d]+\\b`, 'g');
            const matchesFound = styledCode.match(patternRegex);
            
            if (matchesFound && matchesFound.length > 0) {
              console.log(`[TailwindStylistAgent] Pattern '${basePattern}': '${similarClass}' → '${improvement.newClass}'`);
              
              // Replace the first matching class with similar pattern
              const similarClass = matchesFound[0];
              const similarClassRegex = new RegExp(
                `(className\\s*=\\s*["'])([^"']*\\b${similarClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^"']*)`,
                'g'
              );
              
              styledCode = styledCode.replace(similarClassRegex, (match, prefix, classes) => {
                const newClasses = classes.replace(similarClass, improvement.newClass);
                if (classes !== newClasses) {
                  replacementMade = true;
                  console.log(`[TailwindStylistAgent] Pattern '${basePattern}': '${similarClass}' → '${improvement.newClass}'`);
                }
                return prefix + newClasses;
              });
            }
          }
        }
        
        // Method 3: Smart class addition if no existing classes found
        if (!replacementMade && improvement.newClass) {
          // Find className attributes that could benefit from this class type
          const additionTargets = this.findClassAdditionTargets(styledCode, improvement);
          if (additionTargets.length > 0) {
            const target = additionTargets[0]; // Take the first suitable target
            const additionRegex = new RegExp(`(className\\s*=\\s*["'])([^"']*)(["'])`, 'g');
            
            styledCode = styledCode.replace(additionRegex, (match, prefix, classes, suffix) => {
              // Only add to the first suitable element to avoid over-application
              if (!replacementMade && this.isSuitableForClassAddition(classes, improvement)) {
                const enhancedClasses = classes.trim() + (classes.trim() ? ' ' : '') + improvement.newClass;
                replacementMade = true;
                console.log(`[TailwindStylistAgent] Added '${improvement.newClass}'`);
                return prefix + enhancedClasses + suffix;
              }
              return match;
            });
          }
        }
        
        if (replacementMade || styledCode.length !== beforeLength) {
          changesApplied++;
        }
      }
    });
    if (improvements.patterns) {
      styledCode = this.applyPatternImprovements(styledCode, improvements.patterns);
    }
    console.log('[TailwindStylistAgent] Total changes applied:', changesApplied);
    return styledCode;
  }

  /**
   * Apply modern pattern improvements
   */
  applyPatternImprovements(code, patterns) {
    let improvedCode = code;
    
    // Add transitions if not present
    if (patterns.transitions && !code.includes('transition')) {
      improvedCode = improvedCode.replace(
        /className\s*=\s*["']([^"']*\bbg-\w+[^"']*)["']/g,
        (match, classes) => {
          return `className="${classes} transition-colors duration-200"`;
        }
      );
    }

    // Add focus states if not present
    if (patterns.focus && !code.includes('focus:')) {
      improvedCode = improvedCode.replace(
        /className\s*=\s*["']([^"']*\bbutton[^"']*|[^"']*\bbg-\w+[^"']*)["']/g,
        (match, classes) => {
          if (!classes.includes('focus:')) {
            return `className="${classes} ${patterns.focus}"`;
          }
          return match;
        }
      );
    }

    return improvedCode;
  }

  /**
   * Validate the final styling
   */
  validateStyling(styledComponent) {
    const validation = {
      score: 0,
      compliance: 'NON-COMPLIANT',
      passed: [],
      failed: [],
      improvements: []
    };

    const checks = [
      {
        name: 'responsive',
        test: /\b(sm|md|lg|xl|2xl):/.test(styledComponent),
        weight: 20
      },
      {
        name: 'interactions',
        test: /\b(hover|focus|active):/.test(styledComponent),
        weight: 20
      },
      {
        name: 'transitions',
        test: /transition/.test(styledComponent),
        weight: 15
      },
      {
        name: 'accessibility',
        test: /\b(aria-|role=|alt=|tabIndex|focus:ring)/.test(styledComponent),
        weight: 15
      },
      {
        name: 'modern-colors',
        test: /\b(gray|slate|zinc)-\d+/.test(styledComponent),
        weight: 10
      },
      {
        name: 'spacing-system',
        test: /\b[pm][xytrbl]?-(1|2|3|4|6|8|12|16|20|24)/.test(styledComponent),
        weight: 10
      },
      {
        name: 'typography',
        test: /\b(text-|font-|leading-)/.test(styledComponent),
        weight: 10
      }
    ];

    checks.forEach(check => {
      if (check.test) {
        validation.score += check.weight;
        validation.passed.push(check.name);
      } else {
        validation.failed.push(check.name);
        validation.improvements.push(`Add ${check.name} styling`);
      }
    });

    // Determine compliance
    if (validation.score >= 85) {
      validation.compliance = 'COMPLIANT';
    } else if (validation.score >= 70) {
      validation.compliance = 'NEEDS_IMPROVEMENT';
    } else {
      validation.compliance = 'NON-COMPLIANT';
    }

    return validation;
  }

  /**
   * Calculate changes between original and styled component
   */
  calculateChanges(originalCode, styledCode) {
    return {
      originalLines: originalCode.split('\n').length,
      styledLines: styledCode.split('\n').length,
      originalLength: originalCode.length,
      styledLength: styledCode.length,
      changeRatio: ((styledCode.length - originalCode.length) / originalCode.length * 100).toFixed(1)
    };
  }

  /**
   * CRITICAL FIX #1: Build specific guidance section for enhanced prompt
   * Converts ValidatorAgent's specific guidance into actionable AI instructions
   */
  buildSpecificGuidanceSection(validationGuidance) {
    let guidanceText = '\n🎯 **SPECIFIC ACTIONABLE FIXES** (CRITICAL FIX #1 - Use these exact instructions):\n\n';
    
    // Interaction States Fixes
    if (validationGuidance.interactionStates && validationGuidance.interactionStates.length > 0) {
      guidanceText += '**INTERACTION STATES FIXES** (MANDATORY):\n';
      validationGuidance.interactionStates.forEach(fix => {
        guidanceText += `• ${fix.issue}\n`;
        guidanceText += `  SOLUTION: ${fix.fix}\n`;
        guidanceText += `  TARGET: ${fix.targetElements.join(', ')}\n`;
        guidanceText += `  CLASSES: ${fix.specificClasses}\n\n`;
      });
    }
    
    // Responsive Design Fixes
    if (validationGuidance.responsiveDesign && validationGuidance.responsiveDesign.length > 0) {
      guidanceText += '**RESPONSIVE DESIGN FIXES** (MANDATORY):\n';
      validationGuidance.responsiveDesign.forEach(fix => {
        guidanceText += `• ${fix.issue}\n`;
        guidanceText += `  SOLUTION: ${fix.fix}\n`;
        guidanceText += `  TARGET: ${fix.targetElements.join(', ')}\n`;
        guidanceText += `  CLASSES: ${fix.specificClasses}\n\n`;
      });
    }
    
    // Color Contrast Fixes
    if (validationGuidance.colorContrast && validationGuidance.colorContrast.length > 0) {
      guidanceText += '**COLOR CONTRAST FIXES** (MANDATORY):\n';
      validationGuidance.colorContrast.forEach(fix => {
        guidanceText += `• ${fix.issue}\n`;
        guidanceText += `  SOLUTION: ${fix.fix}\n`;
        guidanceText += `  TARGET: ${fix.targetElements.join(', ')}\n`;
        guidanceText += `  CLASSES: ${fix.specificClasses}\n\n`;
      });
    }
    
    // Glassmorphism Fixes
    if (validationGuidance.glassmorphism && validationGuidance.glassmorphism.length > 0) {
      guidanceText += '**GLASSMORPHISM FIXES** (HIGH PRIORITY):\n';
      validationGuidance.glassmorphism.forEach(fix => {
        guidanceText += `• ${fix.issue}\n`;
        guidanceText += `  SOLUTION: ${fix.fix}\n`;
        guidanceText += `  TARGET: ${fix.targetElements.join(', ')}\n`;
        guidanceText += `  CLASSES: ${fix.specificClasses}\n\n`;
      });
    }
    
    // Industry-Specific Fixes
    if (validationGuidance.industrySpecific && validationGuidance.industrySpecific.length > 0) {
      guidanceText += '**INDUSTRY-SPECIFIC FIXES** (HIGH PRIORITY):\n';
      validationGuidance.industrySpecific.forEach(fix => {
        guidanceText += `• ${fix.issue}\n`;
        guidanceText += `  SOLUTION: ${fix.fix}\n`;
        guidanceText += `  TARGET: ${fix.targetElements.join(', ')}\n`;
        guidanceText += `  CLASSES: ${fix.specificClasses}\n\n`;
      });
    }
    
    // Template Pattern Fixes
    if (validationGuidance.templateFixes && validationGuidance.templateFixes.length > 0) {
      guidanceText += '**TEMPLATE PATTERN FIXES** (CREATIVITY REQUIRED):\n';
      validationGuidance.templateFixes.forEach(fix => {
        guidanceText += `• ${fix.issue}\n`;
        guidanceText += `  SOLUTION: ${fix.fix}\n`;
        guidanceText += `  TARGET: ${fix.targetElements.join(', ')}\n`;
        guidanceText += `  CLASSES: ${fix.specificClasses}\n\n`;
      });
    }
    
    guidanceText += '🚨 **CRITICAL**: You MUST apply ALL the above fixes with the EXACT classes specified. These are not suggestions - they are mandatory requirements from the validation system.\n\n';
    
    return guidanceText;
  }

  /**
   * Get fallback improvements for AI parsing failures
   */
  getFallbackImprovements(styleAnalysis, validationIssues) {
    return {
      improvements: [
        {
          type: 'responsive',
          description: 'Add basic responsive classes',
          oldClass: 'p-4',
          newClass: 'p-4 sm:p-6 md:p-8',
          element: 'container',
          rule: 'responsiveDesign'
        },
        {
          type: 'interaction',
          description: 'Add hover and focus states',
          oldClass: 'bg-blue-500',
          newClass: 'bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 transition-colors',
          element: 'button',
          rule: 'interactionStates'
        }
      ],
      patterns: {
        focus: 'focus:ring-2 focus:ring-blue-500 focus:outline-none',
        transitions: 'transition-all duration-200'
      },
      accessibility: ['Add focus indicators', 'Include aria labels'],
      compliance: {
        mandatoryRules: ['responsiveDesign', 'interactionStates'],
        targetScore: 85
      }
    };
  }

  /**
   * Initialize modern design patterns
   */
  initializeModernPatterns() {
    return {
      glassmorphism: {
        light: 'bg-white/80 backdrop-blur-sm border border-white/20',
        dark: 'bg-gray-900/80 backdrop-blur-sm border border-gray-700/20'
      },
      gradients: {
        hero: this.extractGradientFromDesign(design, 'primary'),
        subtle: this.extractGradientFromDesign(design, 'subtle'),
        accent: this.extractGradientFromDesign(design, 'accent')
      },
      shadows: {
        card: 'shadow-lg hover:shadow-xl transition-shadow duration-300',
        floating: 'shadow-2xl shadow-blue-500/25',
        inner: 'shadow-inner shadow-gray-200/50'
      },
      animations: {
        hover: 'hover:scale-105 transition-transform duration-200',
        bounce: 'animate-bounce',
        fade: 'animate-fade-in'
      }
    };
  }

  /**
   * Generate glassmorphism styles for modern UI effects
   * Implementation of Phase 3.2 from PURE_AI_GENERATION_TECHNICAL_SPEC.md
   */
  generateGlassmorphismStyles(designSpec) {
    const glassmorphism = designSpec?.effects?.glassmorphism;
    
    if (!glassmorphism?.enabled) return '';
    
    return `
      /* Glassmorphism effect */
      .glass-effect {
        background: ${glassmorphism.background || 'rgba(255, 255, 255, 0.1)'};
        backdrop-filter: blur(${glassmorphism.blur || 10}px);
        -webkit-backdrop-filter: blur(${glassmorphism.blur || 10}px);
        border: 1px solid ${glassmorphism.borderColor || 'rgba(255, 255, 255, 0.2)'};
        border-radius: ${glassmorphism.borderRadius || '12px'};
        box-shadow: ${glassmorphism.shadow || '0 8px 32px rgba(0, 0, 0, 0.1)'};
      }
      
      /* Fallback for browsers without backdrop-filter support */
      @supports not (backdrop-filter: blur(10px)) {
        .glass-effect {
          background: ${glassmorphism.fallbackBackground || 'rgba(255, 255, 255, 0.8)'};
        }
      }
      
      /* Dark mode glassmorphism */
      .dark .glass-effect {
        background: ${glassmorphism.darkBackground || 'rgba(0, 0, 0, 0.1)'};
        border-color: ${glassmorphism.darkBorderColor || 'rgba(255, 255, 255, 0.1)'};
      }
    `;
  }

  /**
   * Generate micro-interactions for enhanced user experience
   */
  generateMicroInteractions(designSpec) {
    const interactions = designSpec?.microInteractions;
    
    if (!interactions) return this.getDefaultMicroInteractions();
    
    return {
      buttonClasses: `
        transform transition-all ${interactions.transitionSpeed}
        ${interactions.easingFunction} ${interactions.buttonHover}
        active:scale-95 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-primary/50
      `,
      cardClasses: `
        transform transition-all ${interactions.transitionSpeed}
        ${interactions.easingFunction} ${interactions.cardHover}
        cursor-pointer group
      `,
      inputClasses: `
        transition-all ${interactions.transitionSpeed}
        ${interactions.easingFunction} ${interactions.inputFocus}
        focus:border-primary focus:ring-primary/20
      `
    };
  }

  /**
   * Get default micro-interactions if none specified
   */
  getDefaultMicroInteractions() {
    return {
      buttonClasses: `
        transform transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-xl
        active:scale-95 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-primary/50
      `,
      cardClasses: `
        transform transition-all duration-300 ease-in-out
        hover:shadow-2xl hover:-translate-y-1
        cursor-pointer group
      `,
      inputClasses: `
        transition-all duration-300 ease-in-out
        focus:ring-2 focus:ring-primary/20
        focus:border-primary focus:ring-primary/20
      `
    };
  }

  /**
   * Apply glassmorphism and micro-interactions to component code
   */
  enhanceWithAdvancedStyling(componentCode, designSpec) {
    let enhancedCode = componentCode;
    
    // Add glassmorphism custom CSS if enabled
    const glassmorphismCSS = this.generateGlassmorphismStyles(designSpec);
    if (glassmorphismCSS) {
      enhancedCode = this.injectCustomCSS(enhancedCode, glassmorphismCSS);
    }
    
    // Apply micro-interactions to interactive elements
    const microInteractions = this.generateMicroInteractions(designSpec);
    enhancedCode = this.applyMicroInteractions(enhancedCode, microInteractions);
    
    return enhancedCode;
  }

  /**
   * Inject custom CSS into component
   */
  injectCustomCSS(componentCode, customCSS) {
    // Find the return statement and inject CSS before it
    const returnIndex = componentCode.lastIndexOf('return (');
    if (returnIndex === -1) return componentCode;
    
    const cssBlock = `
      <style jsx>{\`
        ${customCSS}
      \`}</style>
    `;
    
    const beforeReturn = componentCode.substring(0, returnIndex);
    const afterReturn = componentCode.substring(returnIndex);
    
    return beforeReturn + '  ' + cssBlock + '\n  ' + afterReturn;
  }

  /**
   * Apply micro-interactions to interactive elements
   */
  applyMicroInteractions(componentCode, microInteractions) {
    let enhancedCode = componentCode;
    
    // Apply button micro-interactions
    enhancedCode = enhancedCode.replace(
      /className="([^"]*button[^"]*)"/g,
      `className="$1 ${microInteractions.buttonClasses.replace(/\s+/g, ' ').trim()}"`
    );
    
    // Apply card micro-interactions
    enhancedCode = enhancedCode.replace(
      /className="([^"]*card[^"]*)"/g,
      `className="$1 ${microInteractions.cardClasses.replace(/\s+/g, ' ').trim()}"`
    );
    
    // Apply input micro-interactions
    enhancedCode = enhancedCode.replace(
      /className="([^"]*input[^"]*)"/g,
      `className="$1 ${microInteractions.inputClasses.replace(/\s+/g, ' ').trim()}"`
    );
    
    return enhancedCode;
  }

  /**
   * CRITICAL: Build dynamic design system instructions from actual design data
   */
  buildDynamicDesignSystemInstructions(design) {
    if (!design) return 'No design system provided - use modern defaults';
    
    const instructions = [];
    
    // Extract primary gradient
    const primaryGradient = this.extractGradientFromDesign(design, 'primary');
    if (primaryGradient) {
      instructions.push(`PRIMARY GRADIENT: ${primaryGradient}`);
    }
    
    // Extract colors
    const primaryColor = this.extractColorFromDesign(design, 'primary');
    const secondaryColor = this.extractColorFromDesign(design, 'secondary');
    if (primaryColor) instructions.push(`PRIMARY COLOR: ${primaryColor}`);
    if (secondaryColor) instructions.push(`SECONDARY COLOR: ${secondaryColor}`);
    
    // Extract glassmorphism
    const glassmorphism = this.extractGlassmorphismFromDesign(design);
    if (glassmorphism) {
      instructions.push(`GLASSMORPHISM: ${glassmorphism}`);
    }
    
    // Extract typography
    const headingFont = this.extractTypographyFromDesign(design);
    if (headingFont) {
      instructions.push(`HEADING FONT: ${headingFont}`);
    }
    
    return instructions.length > 0 ? instructions.join('\n') : 'Modern design system with industry-appropriate styling';
  }
  
  /**
   * Extract gradient from design system data
   */
  extractGradientFromDesign(design, type = 'primary') {
    // Try multiple possible gradient locations
    const gradientSources = [
      design?.advancedColorSystem?.primaryGradients,
      design?.colorSystem?.primaryGradients,
      design?.gradients?.[type],
      design?.brand?.colorPalette ? Object.values(design.brand.colorPalette) : null,
      design?.visual?.gradients
    ].filter(Boolean);
    
    for (const source of gradientSources) {
      if (Array.isArray(source) && source.length >= 2) {
        return `linear-gradient(135deg, ${source[0]}, ${source[1]})`;
      }
    }
    
    // Fallback based on type
    const fallbacks = {
      primary: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      subtle: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)',
      accent: 'linear-gradient(135deg, #10B981, #059669)'
    };
    
    return fallbacks[type] || fallbacks.primary;
  }
  
  /**
   * Extract color from design system data
   */
  extractColorFromDesign(design, type = 'primary') {
    const colorSources = [
      design?.advancedColorSystem?.[`${type}Color`],
      design?.colorSystem?.[`${type}Color`], 
      design?.brand?.colorPalette?.[type],
      design?.colors?.[type]
    ].filter(Boolean);
    
    for (const color of colorSources) {
      if (color && typeof color === 'string') {
        return color;
      }
    }
    
    // Fallback colors
    const fallbacks = {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#10B981'
    };
    
    return fallbacks[type] || fallbacks.primary;
  }
  
  /**
   * Extract glassmorphism settings from design system
   */
  extractGlassmorphismFromDesign(design) {
    const glassmorphismSources = [
      design?.advancedColorSystem?.glassmorphism,
      design?.glassmorphism,
      design?.modernEffects?.glassmorphism,
      design?.effects?.glassmorphism
    ].filter(Boolean);
    
    for (const glass of glassmorphismSources) {
      if (glass && typeof glass === 'object') {
        const backdrop = glass.backdropFilter || 'blur(8px)';
        const bg = glass.background || 'rgba(255, 255, 255, 0.1)';
        const border = glass.border || '1px solid rgba(255, 255, 255, 0.2)';
        
        return `backdrop-blur-md bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/20`;
      }
    }
    
    return 'backdrop-blur-md bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/20';
  }
  
  /**
   * Extract typography from design system
   */
  extractTypographyFromDesign(design) {
    const fontSources = [
      design?.typography?.headingFont,
      design?.brand?.typography?.heading,
      design?.fonts?.heading
    ].filter(Boolean);
    
    for (const font of fontSources) {
      if (font && typeof font === 'string') {
        // Map to Tailwind font classes
        const fontMap = {
          'Inter': 'font-sans',
          'Roboto': 'font-sans',
          'Montserrat': 'font-sans',
          'Playfair Display': 'font-serif',
          'Georgia': 'font-serif',
          'Courier New': 'font-mono'
        };
        
        return fontMap[font] || 'font-sans';
      }
    }
    
    return 'font-sans';
  }

  /**
   * Get fallback rules if UI/UX rules file is not found
   */
  getFallbackRules() {
    return {
      scoringSystem: {
        mandatoryRules: ['responsiveDesign', 'interactionStates', 'focusKeyboard'],
        passingThreshold: 85
      },
      rules: []
    };
  }

  /**
   * CRITICAL FIX 2025-09-08: Helper methods for enhanced class detection
   * Find suitable targets for class additions when direct replacement fails
   */
  findClassAdditionTargets(styledCode, improvement) {
    const targets = [];
    
    // Look for elements that could benefit from this type of improvement
    const classNameMatches = styledCode.match(/className\s*=\s*["']([^"']*)/g);
    if (classNameMatches) {
      classNameMatches.forEach((match, index) => {
        targets.push({
          match,
          index,
          type: this.classifyImprovementType(improvement)
        });
      });
    }
    
    return targets;
  }

  /**
   * Check if a className attribute is suitable for adding a specific class
   */
  isSuitableForClassAddition(existingClasses, improvement) {
    const improvementType = this.classifyImprovementType(improvement);
    
    // Don't add if the class or similar already exists
    if (existingClasses.includes(improvement.newClass)) {
      return false;
    }
    
    // Check if this type of class would be appropriate
    switch (improvementType) {
      case 'responsive':
        return existingClasses.includes('p-') || existingClasses.includes('m-') || existingClasses.includes('w-') || existingClasses.includes('h-');
      case 'interaction':
        return existingClasses.includes('bg-') || existingClasses.includes('border-') || existingClasses.includes('text-');
      case 'transition':
        return existingClasses.includes('hover:') || existingClasses.includes('focus:');
      case 'spacing':
        return !existingClasses.match(/\bp-\d+/) && !existingClasses.match(/\bm-\d+/);
      default:
        return true; // Allow other types by default
    }
  }

  /**
   * Classify improvement type based on the class being added
   */
  classifyImprovementType(improvement) {
    const newClass = improvement.newClass || '';
    
    if (newClass.includes('sm:') || newClass.includes('md:') || newClass.includes('lg:') || newClass.includes('xl:')) {
      return 'responsive';
    }
    if (newClass.includes('hover:') || newClass.includes('focus:') || newClass.includes('active:')) {
      return 'interaction';
    }
    if (newClass.includes('transition') || newClass.includes('duration') || newClass.includes('ease')) {
      return 'transition';
    }
    if (newClass.match(/\b[pm][xytrbl]?-\d+/)) {
      return 'spacing';
    }
    if (newClass.includes('bg-') || newClass.includes('text-') || newClass.includes('border-')) {
      return 'color';
    }
    
    return 'other';
  }
}

module.exports = { TailwindStylistAgent };