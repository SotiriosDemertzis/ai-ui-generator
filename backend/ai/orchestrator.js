/**
 * @file backend/ai/orchestrator_new.js
 * @description NEW IMPROVED Multi-Agent Orchestrator with Validation Loop
 * @flow Spec → Design/Content → Layout → Code → TailwindStylist → Validator (with loop)
 * @version 2.0
 */

require('dotenv').config();

// CRITICAL FIX: Clear module cache in development to prevent method reference errors
if (process.env.NODE_ENV === 'development') {
  const designAgentPath = require.resolve('./agents/designAgent');
  const contentAgentPath = require.resolve('./agents/contentAgent');
  const layoutAgentPath = require.resolve('./agents/layoutAgent');
  const codeAgentPath = require.resolve('./agents/codeAgent');
  const tailwindAgentPath = require.resolve('./agents/tailwindStylistAgent');
  
  delete require.cache[designAgentPath];
  delete require.cache[contentAgentPath];
  delete require.cache[layoutAgentPath];
  delete require.cache[codeAgentPath];
  delete require.cache[tailwindAgentPath];
}

const { SpecAgent } = require('./agents/specAgent');
const { DesignAgent } = require('./agents/designAgent');
const { ContentAgent } = require('./agents/contentAgent');
const { LayoutAgent } = require('./agents/layoutAgent');
const { CodeAgent } = require('./agents/codeAgent');
const { TailwindStylistAgent } = require('./agents/tailwindStylistAgent');
const { ValidatorAgent } = require('./agents/validatorAgent');
const DesignImplementationAgent = require('./agents/designImplementationAgent');
const { ImageIntegrationAgent } = require('./agents/imageIntegrationAgent');
const debugLogger = require('./shared/DebugLogger');

/**
 * Improved Generation Context
 */
class ImprovedGenerationContext {
  constructor(userPrompt, options = {}) {
    this.userPrompt = userPrompt;
    this.sessionId = options.sessionId || `session_${Date.now()}`;
    this.startTime = Date.now();
    
    // Initialize debug tracking
    this.correlationId = debugLogger.generateCorrelationId();
    debugLogger.setCorrelationId(this.correlationId);
    debugLogger.logContextEvolution('GENERATION_START', { userPrompt, sessionId: this.sessionId });
    
    // Core data containers - NEW FLOW
    this.pageSpec = null;
    this.design = null;
    this.content = null;
    this.layout = null;        // NEW: Layout structure
    this.code = null;
    this.styledCode = null;    // NEW: Styled component
    this.validation = null;
    
    // Validation loop tracking
    this.validationLoop = {
      attempt: 0,
      maxAttempts: 2,
      currentCode: null,
      issues: [],
      history: []
    };
    
    // Enhanced guidance for targeted improvements
    this.validationGuidance = null;
    
    // Execution tracking with memory monitoring
    this.metadata = {
      agentsUsed: [],
      executionTime: 0,
      flow: 'improved',
      initialMemory: process.memoryUsage(),
      peakMemory: process.memoryUsage()
    };
  }
  
  // Setter methods
  setPageSpec(pageSpec) {
    this.pageSpec = pageSpec;
    this.metadata.agentsUsed.push('SpecAgent');
  }
  
  setDesign(design) {
    this.design = design;
    this.metadata.agentsUsed.push('DesignAgent');
  }
  
  setContent(content) {
    this.content = content;
    this.metadata.agentsUsed.push('ContentAgent');
  }
  
  setLayout(layout) {
    this.layout = layout;
    this.metadata.agentsUsed.push('LayoutAgent');
  }
  
  setCode(code) {
    this.code = code;
    // CodeAgent now returns reactCode directly 
    this.validationLoop.currentCode = code?.reactCode || '';
    this.metadata.agentsUsed.push('CodeAgent');
  }
  
  setStyledCode(styledResult) {
    this.styledCode = styledResult;
    this.validationLoop.currentCode = styledResult?.styledComponent || '';
    this.metadata.agentsUsed.push('TailwindStylistAgent');
  }
  
  setValidation(validation) {
    this.validation = validation;
    this.validationLoop.attempt++;
    this.validationLoop.issues = validation.criticalIssues || [];
    this.validationLoop.history.push({
      attempt: this.validationLoop.attempt,
      score: validation.overallScore,
      passed: validation.passed,
      issues: validation.criticalIssues
    });
    this.metadata.agentsUsed.push('ValidatorAgent');
  }
  
  shouldRetryValidation() {
    return !this.validation.passed && 
           this.validationLoop.attempt < this.validationLoop.maxAttempts;
  }
  
  finalize() {
    this.metadata.executionTime = Date.now() - this.startTime;
    this.metadata.finalState = this.getFinalState();
    this.metadata.completeness = this.calculateCompleteness();
  }
  
  getFinalState() {
    return {
      hasPageSpec: !!this.pageSpec,
      hasDesign: !!this.design,
      hasContent: !!this.content,
      hasLayout: !!this.layout,
      hasCode: !!this.code,
      hasValidation: !!this.validation,
      validationPassed: this.validation?.passed || false,
      validationScore: this.validation?.overallScore || 0
    };
  }
  
  calculateCompleteness() {
    const required = ['pageSpec', 'design', 'content', 'layout', 'code'];
    const present = required.filter(field => !!this[field]);
    return Math.round((present.length / required.length) * 100);
  }
  
  // Memory usage tracking
  updateMemoryTracking() {
    const currentMemory = process.memoryUsage();
    if (currentMemory.heapUsed > this.metadata.peakMemory.heapUsed) {
      this.metadata.peakMemory = currentMemory;
    }
  }

  // Context optimization for validation loop
  optimizeForValidationLoop() {
    this.updateMemoryTracking();
    
    // Keep only essential data during validation loops
    if (this.validationLoop.attempt > 0) {
      // Reduce validation history size
      if (this.validationLoop.history.length > 2) {
        this.validationLoop.history = this.validationLoop.history.slice(-2);
      }
      
      // Create content summary to reduce memory usage
      if (this.content && !this.contentSummary) {
        this.contentSummary = {
          hero: this.content.hero ? { headline: this.content.hero.headline } : null,
          sectionsCount: Object.keys(this.content).length,
          hasFeatures: !!this.content.features,
          hasTestimonials: !!this.content.testimonials
        };
      }
    }
  }

  cleanup() {
    // Clear sensitive data or large objects
    this.updateMemoryTracking();
    if (this.metadata.agentsUsed.length === 0) {
      console.warn('⚠️ [ImprovedGenerationContext] No agents were used - possible error state');
    }
    
    // Final memory report
    const memoryGrowth = this.metadata.peakMemory.heapUsed - this.metadata.initialMemory.heapUsed;
    if (memoryGrowth > 50 * 1024 * 1024) { // > 50MB growth
      console.log(`🔍 [Memory] Peak memory growth: ${Math.round(memoryGrowth / 1024 / 1024)}MB`);
    }
  }
}

/**
 * Improved Multi-Agent Orchestrator
 * NEW FLOW: Spec → Design/Content → Layout → Code → TailwindStylist ↔ Validator
 */
class ImprovedOrchestrator {
  constructor() {
    this.specAgent = new SpecAgent();
    this.designAgent = new DesignAgent();
    this.contentAgent = new ContentAgent();
    this.layoutAgent = new LayoutAgent();
    this.codeAgent = new CodeAgent();
    this.tailwindStylistAgent = new TailwindStylistAgent();
    this.validatorAgent = new ValidatorAgent();
    
    console.log('🚀 [ImprovedOrchestrator] Initialized with NEW FLOW architecture');
  }
  
  /**
   * MAIN ENTRY POINT: Generate page with improved flow
   */
  async generatePage(userPrompt, options = {}) {
    console.log('\n🚀 [ImprovedOrchestrator] Starting NEW IMPROVED generation flow...');
    console.log('📋 [ImprovedOrchestrator] Flow: Spec → Design/Content → Layout → Code → TailwindStylist ↔ Validator');
    
    const context = new ImprovedGenerationContext(userPrompt, options);
    
    try {
      // PHASE 1: Specification
      console.log('\n📋 [Phase 1] Page Specification...');
      await this.executeSpecificationPhase(context);
      debugLogger.logContextEvolution('PHASE_1_COMPLETE', context);
      console.log('✅ [Phase 1] Specification completed');
      
      // PHASE 2 & 3: Design and Content (Parallel)
      console.log('\n🎨📝 [Phase 2 & 3] Design and Content Generation (Parallel)...');
      await Promise.all([
        this.executeDesignPhase(context),
        this.executeContentPhase(context)
      ]);
      debugLogger.logContextEvolution('PHASE_2_3_COMPLETE', context);
      console.log('✅ [Phase 2 & 3] Design and Content completed');
      
      // PHASE 4: Layout Generation (NEW)
      console.log('\n🏗️ [Phase 4] Layout Generation...');
      await this.executeLayoutPhase(context);
      debugLogger.logContextEvolution('PHASE_4_COMPLETE', context);
      console.log('✅ [Phase 4] Layout completed');
      
      // PHASE 5: Code Generation
      console.log('\n⚙️ [Phase 5] Code Generation...');
      await this.executeCodeGenerationPhase(context);
      debugLogger.logContextEvolution('PHASE_5_COMPLETE', context);
      console.log('✅ [Phase 5] Code Generation completed');
      
      // PHASE 5.5: Design Implementation & Image Integration (NEW - PURE AI SPEC)
      console.log('\n🎨🖼️ [Phase 5.5] Design Implementation & Image Integration...');
      await this.executeDesignImplementationPhase(context);
      await this.executeImageIntegrationPhase(context);
      debugLogger.logContextEvolution('PHASE_5_5_COMPLETE', context);
      console.log('✅ [Phase 5.5] Design Implementation & Image Integration completed');
      
      // PHASE 6-7: TailwindStylist ↔ Validator Loop (NEW)
      console.log('\n🎨🔍 [Phase 6-7] TailwindStylist ↔ Validator Loop...');
      await this.executeStylingValidationLoop(context);
      console.log('✅ [Phase 6-7] Styling and Validation completed');
      
      context.finalize();
      context.cleanup();
      
      // FINAL DEBUG: Log final result structure
      console.log('\n📊 [Orchestrator] ================================');
      console.log('📊 [Orchestrator] FINAL RESULT ANALYSIS');
      console.log('📊 [Orchestrator] ================================');
      
      const finalResult = {
        success: true,
        context,
        finalCode: context.validationLoop.currentCode,
        validationScore: context.validation?.overallScore || 0,
        executionTime: context.metadata.executionTime,
        agentsUsed: context.metadata.agentsUsed,
        completeness: context.metadata.completeness,
        finalState: context.metadata.finalState
      };
      
      // Debug logging for final result
      debugLogger.logContextEvolution('GENERATION_COMPLETE', context);
      debugLogger.logMemoryUsage();
      
      // Generate and log summary
      const generationSummary = debugLogger.getGenerationSummary(context.correlationId);
      console.log('🔍 [Debug] Generation Summary:', JSON.stringify(generationSummary, null, 2));
      
      console.log('� [Orchestrator] Success metrics:', {
        success: finalResult.success,
        totalExecutionTime: `${finalResult.executionTime}ms`,
        agentsUsedCount: finalResult.agentsUsed.length,
        completenessPercentage: `${finalResult.completeness}%`,
        finalValidationScore: `${finalResult.validationScore}%`,
        validationPassed: context.validation?.passed || false
      });
      
      console.log('📊 [Orchestrator] Agents execution order:', finalResult.agentsUsed);
      
      console.log('📊 [Orchestrator] Final state check:', finalResult.finalState);
      
      console.log('� [Orchestrator] Code analysis:', {
        hasFinalCode: !!finalResult.finalCode,
        finalCodeLength: finalResult.finalCode?.length || 0,
        codePreview: finalResult.finalCode ? finalResult.finalCode.substring(0, 200) + '...' : 'No code generated'
      });
      
      if (context.validationLoop.history.length > 0) {
        console.log('📊 [Orchestrator] Validation history:', 
          context.validationLoop.history.map(h => ({
            attempt: h.attempt,
            score: `${h.score}%`,
            passed: h.passed
          }))
        );
      }
      
      if (finalResult.finalCode) {
        console.log('✅ [Orchestrator] SUCCESS: Final code generated successfully');
      } else {
        console.log('❌ [Orchestrator] FAILURE: No final code in result!');
      }
      
      console.log('📊 [Orchestrator] ================================\n');
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ [ImprovedOrchestrator] Generation failed:', error.message);
      return {
        success: false,
        error: error.message,
        context,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Phase 1: Specification
   */
  async executeSpecificationPhase(context) {
    console.log('📋 [SpecAgent] Analyzing requirements...');
    const specResult = await this.specAgent.generateSpec(context.userPrompt);
    
    if (!specResult.success) {
      throw new Error('Specification phase failed');
    }
    
    context.setPageSpec(specResult.pageSpec);
    if (process.env.NODE_ENV !== 'production') {
      console.log('📋 [SpecAgent] Generated spec:', JSON.stringify({
        type: specResult.pageSpec.type,
        complexity: specResult.pageSpec.complexity,
        sections: specResult.pageSpec.sections?.length || 0,
        industry: specResult.pageSpec.industry,
        name: specResult.pageSpec.name
      }, null, 2));
    } else {
      console.log('📋 [SpecAgent] Generated spec:', {
        type: specResult.pageSpec.type,
        complexity: specResult.pageSpec.complexity,
        sections: specResult.pageSpec.sections?.length || 0
      });
    }
  }
  
  /**
   * Phase 2: Design
   */
  async executeDesignPhase(context) {
    console.log('🎨 [DesignAgent] Creating design system...');
    const designResult = await this.designAgent.generateDesign(
      context.pageSpec,
      {},
      context
    );
    
    if (!designResult.success) {
      throw new Error('Design phase failed');
    }
    
    context.setDesign(designResult.design);
    // Robust validation: ensure design is not empty/minimal
    const design = context.design;
    const designKeys = design ? Object.keys(design) : [];
    const hasCoreDesign = design && (
      design.brand || design.visual || design.modernVisualSystem || design.advancedColorSystem || design.modernTypography
    );
    if (!hasCoreDesign || designKeys.length < 2) {
      console.error('❌ [Orchestrator] Design object after DesignAgent is missing core fields or is too minimal:', design);
      throw new Error('Design phase failed: Design object missing core fields.');
    }
    console.log('🎨 [DesignAgent] Generated design system. Keys:', designKeys);
  }
  
  /**
   * Phase 3: Content
   */
  async executeContentPhase(context) {
    console.log('📝 [ContentAgent] Creating content strategy...');
    const contentResult = await this.contentAgent.generateContent(
      context.pageSpec,
      {},
      context
    );
    
    if (!contentResult.success) {
      throw new Error('Content phase failed');
    }
    
    context.setContent(contentResult.content);
    console.log('📝 [ContentAgent] Generated content strategy');
    
    // DEBUG: Log content quality for analysis
    console.log('🔍 [DEBUG] Content quality assessment:', {
      hasHero: !!contentResult.content.hero,
      featuresCount: contentResult.content.features?.length || 0,
      testimonialsCount: contentResult.content.testimonials?.length || 0,
      hasPlaceholders: JSON.stringify(contentResult.content).includes('[') || JSON.stringify(contentResult.content).includes('placeholder'),
      authenticity: contentResult.content._metadata?.authenticityScore || 'unknown'
    });
  }
  
  /**
   * Phase 4: Layout (NEW)
   */
  async executeLayoutPhase(context) {
    console.log('🏗️ [LayoutAgent] Creating layout structure...');
    const layoutResult = await this.layoutAgent.generateLayout(
      context.pageSpec,
      context.design,
      context
    );
    
    if (!layoutResult.success) {
      throw new Error('Layout phase failed');
    }
    
    context.setLayout(layoutResult.layout);
    console.log('🏗️ [LayoutAgent] Generated layout:', {
      name: layoutResult.layout.name,
      sections: layoutResult.layout.sections?.length || 0,
      components: layoutResult.layout.components?.length || 0
    });
    
    // DEBUG: Log layout structure for analysis
    console.log('🔍 [DEBUG] Layout structure details:', JSON.stringify({
      sections: layoutResult.layout.sections?.map(s => ({ name: s.name, type: s.type })) || [],
      responsive: layoutResult.layout.responsive,
      hasComponents: !!layoutResult.layout.components?.length
    }, null, 2));
  }
  
  /**
   * Phase 5: Code Generation
   */
  async executeCodeGenerationPhase(context) {
    console.log('⚙️ [CodeAgent] Generating React code...');
    // Ensure design is valid before calling CodeAgent
    if (!context.design) {
      throw new Error('Code generation phase failed: No design object available.');
    }
    const codeResult = await this.codeAgent.generateCode(
      context.pageSpec,
      context.design,
      context.content,
      context.layout, // Pass layout to code generation
      context
    );
    if (!codeResult.success) {
      throw new Error('Code generation phase failed: ' + (codeResult.error || 'Unknown error'));
    }
    // ENHANCED DEBUG: Log codeResult structure
    console.log('🔍 [Orchestrator] CodeAgent result analysis:', {
      hasReactCode: !!codeResult?.reactCode,
      reactCodeLength: codeResult?.reactCode?.length || 0,
      componentName: codeResult?.componentName,
      success: codeResult?.success
    });
    if (codeResult?.reactCode) {
      console.log('🔍 [Orchestrator] Generated code preview:', codeResult.reactCode.substring(0, 200) + '...');
    } else {
      console.log('⚠️ [Orchestrator] No reactCode in codeResult!');
    }
    context.setCode(codeResult);
    console.log('✅ [CodeAgent] Code generation phase completed');
    // DEBUG: Log context state after code generation
    console.log('🔍 [Orchestrator] Context after code generation:', {
      hasContextCode: !!context.code,
      hasValidationLoopCurrentCode: !!context.validationLoop.currentCode,
      currentCodeLength: context.validationLoop.currentCode?.length || 0
    });
    // CodeAgent now returns consistent interface
    const reactCodeLength = codeResult?.reactCode?.length ?? 0;
    const contentUsed = codeResult?.contentUtilization?.used ?? 0;
    const contentTotal = codeResult?.contentUtilization?.total ?? 0;
    console.log('⚙️ [CodeAgent] Generated React component:', {
      length: reactCodeLength,
      contentUsed: contentUsed,
      contentTotal: contentTotal
    });
  }
  
  /**
   * Phase 6-7: Styling ↔ Validation Loop (NEW - KEY IMPROVEMENT)
   */
  async executeStylingValidationLoop(context) {
    console.log('🔄 [StylingValidationLoop] Starting validation loop (max 2 attempts)...');
    
    let currentCode = context.validationLoop.currentCode;
    
    while (context.validationLoop.attempt < context.validationLoop.maxAttempts) {
      const attemptNum = context.validationLoop.attempt + 1;
      console.log(`\n🔄 [Attempt ${attemptNum}] Styling → Validation cycle...`);
      
      // Step 1: Apply Tailwind Styling (all improvements)
      console.log('🎨 [TailwindStylist] Applying modern styling...');
      const stylingResult = await this.tailwindStylistAgent.applyModernStyling(
        currentCode,
        context.pageSpec,
        context.design,
        context.layout,
        context.validationGuidance || context.validationLoop.issues, // Pass validation guidance
        context.designImplementation, // Pass design implementation from Phase 5.5
        context.validation?.specificGuidance // CRITICAL FIX #1: Pass enhanced specific guidance from ValidatorAgent
      );
      
      if (!stylingResult.success) {
        console.warn('⚠️ [TailwindStylist] Styling failed, using original code');
        // Continue with original code
      } else {
        context.setStyledCode(stylingResult);
        currentCode = stylingResult.styledComponent;
        console.log('🎨 [TailwindStylist] Applied styling improvements:', {
          improvements: stylingResult.improvements?.improvements?.length || 0,
          score: stylingResult.validation?.score || 0
        });
      }
      
      // Step 2: Validate
      console.log('🔍 [Validator] Validating component...');
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 [ValidatorAgent-DEBUG] Validation context:', {
          hasPageSpec: !!context.pageSpec,
          hasDesign: !!context.design,
          hasContent: !!context.content,
          hasCode: !!context.code,
          currentCodeLength: currentCode.length
        });
      }
      
      // Create validation context with current styled code
      const validationContext = {
        pageSpec: context.pageSpec,
        design: context.design,
        content: context.content,
        code: {
          reactCode: currentCode,
          componentName: context.code?.componentName || 'UnknownComponent'
        }
      };
      
      const validationResult = await this.validatorAgent.validate(validationContext);
      
      // Debug logging for validation
      debugLogger.logValidationDetails(validationResult.validation || validationResult);
      debugLogger.logContextEvolution(`VALIDATION_ATTEMPT_${attemptNum}`, context);
      
      if (!validationResult.success) {
        console.error('❌ [Validator] Validation failed:', validationResult.error);
        break;
      }
      
      context.setValidation(validationResult.validation);
      
      console.log('🔍 [Validator] Validation result:', {
        attempt: attemptNum,
        score: validationResult.validation.overallScore,
        passed: validationResult.validation.passed,
        compliance: validationResult.validation.compliance,
        issues: validationResult.validation.criticalIssues?.length || 0
      });
      
      // Check if validation passed
      if (validationResult.validation.passed) {
        console.log('✅ [StylingValidationLoop] Validation PASSED! Loop completed successfully.');
        break;
      }
      
      // Check if score improved from previous attempt
      const currentScore = validationResult.validation.overallScore;
      const previousAttempt = context.validationLoop.history[context.validationLoop.history.length - 2]; // -2 because current attempt already added
      
      // Stop if no improvement or score has plateaued
      if (previousAttempt) {
        const improvement = currentScore - previousAttempt.score;
        // Enhanced improvement analysis
        const minImprovement = attemptNum === 1 ? 3 : (attemptNum === 2 ? 2 : 1);
        const targetReached = currentScore >= 75;
        const significantImprovement = Math.abs(improvement) >= minImprovement;
        
        if (targetReached) {
          console.log(`✅ [StylingValidationLoop] Target compliance reached (${currentScore}%), stopping loop`);
          break;
        } else if (!significantImprovement && currentScore < 75) {
          if (attemptNum < 3) {
            console.log(`⚠️ [StylingValidationLoop] Insufficient improvement (${previousAttempt.score}% → ${currentScore}%), continuing with enhanced guidance (attempt ${attemptNum}/3)`);
            // Add specific failing rule guidance to context for next attempt
            context.validationGuidance = this.generateTargetedGuidance(validationResult, currentScore);
          } else {
            console.log(`⚠️ [StylingValidationLoop] No meaningful improvement after ${attemptNum} attempts (${previousAttempt.score}% → ${currentScore}%), stopping loop`);
            break;
          }
        } else if (Math.abs(improvement) < 0.5 && attemptNum > 1) {
          console.log(`⚠️ [StylingValidationLoop] Minimal improvement (${previousAttempt.score}% → ${currentScore}%), stopping loop`);
          break;
        }
      } else if (attemptNum >= 2) {
        // If this is the second attempt and there's no improvement record, stop
        console.log(`⚠️ [StylingValidationLoop] No improvement data available after attempt ${attemptNum}, stopping loop`);
        break;
      }
      
      // Check if we should retry
      if (!context.shouldRetryValidation()) {
        console.log('⚠️ [StylingValidationLoop] Max attempts reached, stopping loop');
        break;
      }
      
      console.log(`🔄 [StylingValidationLoop] Score: ${previousAttempt?.score || 'Initial'}% → ${currentScore}%, continuing retry...`);
    }
    
    console.log('🔄 [StylingValidationLoop] Loop completed:', {
      finalAttempt: context.validationLoop.attempt,
      finalScore: context.validation?.overallScore || 0,
      finalPassed: context.validation?.passed || false,
      history: context.validationLoop.history.map(h => ({
        attempt: h.attempt,
        score: h.score,
        passed: h.passed
      }))
    });
  }

  /**
   * Generate targeted guidance for failing UI/UX rules
   */
  generateTargetedGuidance(validationResult, currentScore) {
    const neededImprovement = 75 - currentScore;
    const guidance = {
      score: currentScore,
      target: 75,
      neededImprovement: neededImprovement,
      priorityFixes: [],
      // CRITICAL FIX 2025-09-08: Enhanced specific actionable instructions
      specificInstructions: {
        responsiveDesign: [],
        interactionStates: [],
        colorContrast: [],
        glassmorphism: [],
        industrySpecific: [],
        templateFixes: []
      }
    };

    // Add specific guidance based on validation results
    if (validationResult?.validation?.failedRules) {
      const failedRules = validationResult.validation.failedRules.slice(0, 10); // Top 10 failed rules
      guidance.priorityFixes = failedRules.map(rule => ({
        rule: rule.id,
        category: rule.category,
        reason: rule.reason,
        recommendation: rule.recommendation
      }));

      // CRITICAL FIX: Generate specific class-based instructions
      failedRules.forEach(rule => {
        switch(rule.id) {
          case 'responsiveDesign':
            guidance.specificInstructions.responsiveDesign.push({
              targetElements: ['div', 'section', 'h1', 'h2', 'h3', 'p'],
              specificClasses: 'text-sm sm:text-base md:text-lg lg:text-xl p-4 sm:p-6 md:p-8',
              description: 'Add responsive text sizing and padding to all major elements'
            });
            break;
          case 'interactionStates':
            guidance.specificInstructions.interactionStates.push({
              targetElements: ['button', 'a', '[onClick]'],
              specificClasses: 'hover:bg-blue-600 focus:bg-blue-600 hover:scale-105 transition-all duration-200',
              description: 'Add hover and focus states with transitions to all interactive elements'
            });
            break;
          case 'colorContrast':
            guidance.specificInstructions.colorContrast.push({
              targetElements: ['text-black', 'text-white'],
              specificClasses: 'text-gray-900 text-gray-100',
              description: 'Replace harsh black/white with softer gray tones'
            });
            break;
          case 'glassmorphism':
            guidance.specificInstructions.glassmorphism.push({
              targetElements: ['main containers', 'cards'],
              specificClasses: 'backdrop-blur-sm bg-white/10 border border-white/20 shadow-xl',
              description: 'Add modern glassmorphism effects to main containers'
            });
            break;
        }
      });
    } else {
      // Enhanced fallback guidance with specific class instructions
      const fallbackFixes = [
        { 
          rule: 'responsiveDesign', 
          category: 'LayoutAndStructure', 
          recommendation: 'Add responsive classes to all elements',
          targetElements: ['all containers'],
          specificClasses: 'p-4 sm:p-6 md:p-8 text-sm sm:text-base md:text-lg'
        },
        { 
          rule: 'interactionStates', 
          category: 'InteractionAndFeedback', 
          recommendation: 'Add hover/focus states to interactive elements',
          targetElements: ['buttons', 'links'],
          specificClasses: 'hover:bg-blue-600 focus:bg-blue-600 transition-colors duration-200'
        },
        { 
          rule: 'accessibilityBaseline', 
          category: 'AccessibilityAndInclusivity', 
          recommendation: 'Add focus indicators to interactive elements',
          targetElements: ['buttons', 'inputs', 'links'],
          specificClasses: 'focus:ring-2 focus:ring-blue-500 focus:outline-none'
        },
        { 
          rule: 'colorContrast', 
          category: 'VisualDesign', 
          recommendation: 'Improve color contrast',
          targetElements: ['text elements'],
          specificClasses: 'text-gray-900 bg-gray-50 border-gray-200'
        },
        { 
          rule: 'animations', 
          category: 'VisualDesign', 
          recommendation: 'Add smooth transitions',
          targetElements: ['interactive elements'],
          specificClasses: 'transition-all duration-200 hover:scale-105'
        }
      ].slice(0, Math.ceil(neededImprovement / 10));

      guidance.priorityFixes = fallbackFixes;
      
      // Populate specific instructions from fallback fixes
      fallbackFixes.forEach(fix => {
        const category = fix.rule.replace(/([A-Z])/g, (match, p1) => p1.toLowerCase());
        if (guidance.specificInstructions[category]) {
          guidance.specificInstructions[category].push({
            targetElements: fix.targetElements,
            specificClasses: fix.specificClasses,
            description: fix.recommendation
          });
        }
      });
    }

    return guidance;
  }

  /**
   * Phase 5.5a: Design Implementation (NEW - PURE AI SPEC)
   * Translate design specs to concrete Tailwind implementations
   */
  async executeDesignImplementationPhase(context) {
    console.log('🎨 [DesignImplementationAgent] Translating design specs to Tailwind...');
    
    if (!this.designImplementationAgent) {
      try {
        if (typeof DesignImplementationAgent !== 'function') {
          console.error('❌ [Orchestrator] DesignImplementationAgent is not a constructor:', typeof DesignImplementationAgent);
          throw new Error('DesignImplementationAgent is not a constructor');
        }
        this.designImplementationAgent = new DesignImplementationAgent();
      } catch (err) {
        console.error('❌ [Orchestrator] Failed to instantiate DesignImplementationAgent:', err.message);
        return;
      }
    }
    try {
      if (!context.design) {
        throw new Error('No design object available for DesignImplementationAgent');
      }
      const implementationResult = await this.designImplementationAgent.translateDesignToTailwind(
        context.design,
        context.pageSpec
      );
      // Store implementation details in context for use by TailwindStylist
      context.designImplementation = implementationResult;
      console.log('✅ [DesignImplementationAgent] Design implementation completed:', {
        hasColorClasses: !!implementationResult.colorClasses,
        hasTypographyClasses: !!implementationResult.typographyClasses,
        hasCustomCSS: !!implementationResult.customCSS
      });
    } catch (error) {
      console.warn('⚠️ [DesignImplementationAgent] Design implementation failed:', error.message);
      // Continue without design implementation - TailwindStylist will handle fallbacks
    }
  }

  /**
   * Phase 5.5b: Image Integration (NEW - PURE AI SPEC)
   * Integrate real, industry-appropriate images with fallback strategies
   */
  async executeImageIntegrationPhase(context) {
    console.log('🖼️ [ImageIntegrationAgent] Integrating industry-appropriate images...');
    
    if (!this.imageIntegrationAgent) {
      try {
        // ImageIntegrationAgent is exported as { ImageIntegrationAgent }
        const agentModule = require('./agents/imageIntegrationAgent');
        const ImageIntegrationAgent = agentModule.ImageIntegrationAgent;
        if (typeof ImageIntegrationAgent !== 'function') {
          console.error('❌ [Orchestrator] ImageIntegrationAgent is not a constructor:', typeof ImageIntegrationAgent);
          throw new Error('ImageIntegrationAgent is not a constructor');
        }
        this.imageIntegrationAgent = new ImageIntegrationAgent();
      } catch (err) {
        console.error('❌ [Orchestrator] Failed to instantiate ImageIntegrationAgent:', err.message);
        return;
      }
    }
    try {
      const currentCode = context.validationLoop.currentCode;
      const enhancedCode = await this.imageIntegrationAgent.integrateImages(
        currentCode,
        context.pageSpec,
        context.content
      );
      // Update context with image-enhanced code
      context.validationLoop.currentCode = enhancedCode;
      console.log('✅ [ImageIntegrationAgent] Image integration completed:', {
        originalCodeLength: currentCode?.length || 0,
        enhancedCodeLength: enhancedCode?.length || 0,
        hasImages: enhancedCode?.includes('img') || enhancedCode?.includes('Image')
      });
    } catch (error) {
      console.warn('⚠️ [ImageIntegrationAgent] Image integration failed:', error.message);
      // Continue with original code - images will use placeholders
    }
  }
}

module.exports = { ImprovedOrchestrator, ImprovedGenerationContext };