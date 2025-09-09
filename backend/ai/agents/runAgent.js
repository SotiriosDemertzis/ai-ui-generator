/**
 * @file backend/ai/agents/runAgent.js
 * @description Simplified AI Agent Runner - Single optimized call to Groq API
 */
require('dotenv').config({path: require('path').join(__dirname, '..', '.env')});

const Groq = require('groq-sdk');
const debugLogger = require('../shared/DebugLogger');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Enhanced runAgent function with context injection and optimized single calls
 */
async function runAgent(agentName, promptTemplate, context = {}, options = {}) {
  const startTime = Date.now();
  
  // Ensure we have a valid correlation ID for performance tracking
  if (!debugLogger.correlationId) {
    debugLogger.generateCorrelationId();
  }
  
  // Always log essential performance metrics for system monitoring
  debugLogger.logAgentInput(agentName, { prompt: promptTemplate, context });
  
  // Optional: Only detailed context logging when DEBUG_ORCHESTRATOR=true
  const DEBUG_ORCHESTRATOR = process.env.DEBUG_ORCHESTRATOR === 'true';
  if (DEBUG_ORCHESTRATOR) {
    debugLogger.logMemoryUsage();
  }
  // Essential flow log
  console.log(`[${agentName}] Starting AI call...`);
  
  // Default options optimized for single-call efficiency with JSON-focused settings
  const defaultOptions = {
    model: 'llama-3.3-70b-versatile',
    maxTokens: (agentName === 'CodeAgent' || agentName === 'TailwindStylistAgent') ? 32000 : 4000,
    temperature: (['LayoutAgent', 'CodeAgent', 'TailwindStylistAgent', 'ValidatorAgent'].includes(agentName)) ? 0.3 : 0.7,
    topP: 0.9
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    // Build enhanced system prompt and context summary
    const contextSummary = buildContextSummary(context, agentName);
    const systemPrompt = buildEnhancedSystemPrompt(agentName);
    const optimizedPrompt = buildOptimizedPrompt(promptTemplate, contextSummary);
    
    // Single optimized call to Groq
    const apiCallStart = Date.now();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user', 
          content: optimizedPrompt
        }
      ],
      model: finalOptions.model,
      max_tokens: finalOptions.maxTokens,
      temperature: finalOptions.temperature,
      top_p: finalOptions.topP
    });
    const apiCallEnd = Date.now();
    const response = completion.choices[0]?.message?.content;
    
  // Essential log for API response
  console.log(`[${agentName}] Groq API response received in ${apiCallEnd - apiCallStart}ms`);
    
    if (!response) {
      console.error(`[${agentName}] Empty response from Groq API!`);
      throw new Error('Empty response from Groq API');
    }
    
    const executionTime = Date.now() - startTime;
    
    // Parse JSON response if it appears to be JSON and is not already parsed
    let parsedResponse = response.trim();
    try {
      if (typeof response === 'string' && response.includes('{') && response.includes('}')) {
        const parseResult = parseJSONResponse(response);
        if (parseResult.success) {
          parsedResponse = parseResult.data;
        }
      } else if (typeof response === 'object' && response !== null) {
        parsedResponse = response;
      }
    } catch (parseError) {
      // Only log error if parsing fails
      console.error(`[${agentName}] JSON parsing failed:`, parseError.message);
    }
    
    const result = {
      success: true,
      response: parsedResponse,
      metadata: {
        agent: agentName,
        model: finalOptions.model,
        executionTime,
        tokensUsed: completion.usage?.total_tokens || 0,
        promptLength: promptTemplate.length,
        responseLength: response.length
      }
    };
    
    // Always capture essential performance data for system monitoring
    debugLogger.logAgentOutput(agentName, result, executionTime);
    
    // Optional: Only detailed memory monitoring when DEBUG_ORCHESTRATOR=true
    if (DEBUG_ORCHESTRATOR) {
      debugLogger.logMemoryUsage();
    }
    // Essential flow log
    console.log(`[${agentName}] AI call completed in ${executionTime}ms`);
    return result;
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`[${agentName}] ERROR:`, error.message);
    return {
      success: false,
      error: error.message,
      metadata: {
        agent: agentName,
        executionTime,
        failed: true
      }
    };
  }
}

/**
 * Enhanced utility function to safely parse JSON responses with robust cleanup
 */
function parseJSONResponse(response) {
  try {
    console.log('[parseJSONResponse-DEBUG] Input type:', typeof response, 'length:', response?.length || 'N/A');
    
    if (typeof response === 'object' && response !== null) {
      console.log('[parseJSONResponse-DEBUG] Response is already an object, returning directly');
      return { success: true, data: response };
    } else if (typeof response === 'string') {
      console.log('[parseJSONResponse-DEBUG] Response is string, attempting JSON parsing...');
      return parseJSONString(response);
    } else {
      console.warn('[parseJSONResponse-DEBUG] Unexpected response type:', typeof response, response);
      return {
        success: false,
        error: `Expected string or object, got ${typeof response}`,
        rawResponse: response
      };
    }
  } catch (error) {
    console.error('[parseJSONResponse] All parsing attempts failed:', error.message);
    return {
      success: false,
      error: `JSON parsing failed: ${error.message}`,
      rawResponse: response?.substring(0, 1000) || 'No response available'
    };
  }
}

/**
 * Parse string responses with multi-pass cleaning
 */
function parseJSONString(response) {
  let jsonText;
  try {
    let cleanResponse = response.trim();
    const jsonPatterns = [
      /```json\s*([\s\S]*?)\s*```/,
      /```\s*([\s\S]*?)\s*```/,
      /(?:here'?s?|the)\s+(?:json|result|output|response)[:.\s]*\s*(\{[\s\S]*\})\s*(?:```|\n\n|$)/i,
      /[:•\-]\s*(\{[\s\S]*\})\s*(?:```|\n\n|$)/,
      /^[\s\S]*?(\{(?:[^{}]|{[^{}]*})*\})[\s\S]*$/,
      /(\[[\s\S]*\])/
    ];
    let extractedJson = null;
    const braceIndex = cleanResponse.indexOf('{');
    if (braceIndex !== -1) {
      let braceCount = 0;
      let jsonStart = braceIndex;
      let jsonEnd = -1;
      for (let i = braceIndex; i < cleanResponse.length; i++) {
        if (cleanResponse[i] === '{') braceCount++;
        if (cleanResponse[i] === '}') braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
      if (jsonEnd !== -1) {
        extractedJson = cleanResponse.substring(jsonStart, jsonEnd + 1);
      }
    }
    if (!extractedJson) {
      for (const pattern of jsonPatterns) {
        const match = cleanResponse.match(pattern);
        if (match) {
          extractedJson = match[1] || match[0];
          extractedJson = extractedJson
            .replace(/^```json\s*/g, '')
            .replace(/^```\s*/g, '')
            .replace(/```\s*$/g, '')
            .trim();
          if ((extractedJson.startsWith('{') && extractedJson.includes('}')) ||
              (extractedJson.startsWith('[') && extractedJson.includes(']'))) {
            break;
          }
          extractedJson = null;
        }
      }
    }
    jsonText = extractedJson || cleanResponse;
    // Only log error if parsing fails below
    const jsonWithoutComments = jsonText
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
      .replace(/:\s*'([^']*?)'/g, ': "$1"');
    const parseMethods = [
      () => JSON.parse(jsonWithoutComments),
      () => {
        const sanitized = jsonWithoutComments
          .replace(/(['"])?([a-zA-Z_$][a-zA-Z0-9_$]*)\1?\s*:/g, '"$2":')
          .replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}])/g, ': "$1"$2');
        return JSON.parse(sanitized);
      },
      () => {
        const cleaned = jsonWithoutComments
          .replace(/^\s*\{/, 'return {')
          .replace(/\}\s*$/, '}');
        const func = new Function(cleaned);
        return func();
      }
    ];
    for (let i = 0; i < parseMethods.length; i++) {
      try {
        const result = parseMethods[i]();
        return {
          success: true,
          data: result
        };
      } catch (methodError) {
        continue;
      }
    }
    throw new Error('All parsing methods failed');
  } catch (error) {
    console.error('[parseJSONString] All parsing attempts failed:', error.message);
    return {
      success: false,
      error: `JSON parsing failed: ${error.message}`,
      rawResponse: response?.substring(0, 1000) || 'No response available'
    };
  }
}

/**
 * Build optimized prompts for single-call efficiency
 */
function buildOptimizedPrompt(basePrompt, context = {}) {
  const contextInfo = [];
  if (context.pageType) contextInfo.push(`Page Type: ${context.pageType}`);
  if (context.industry) contextInfo.push(`Industry: ${context.industry}`);
  if (context.complexity) contextInfo.push(`Complexity: ${context.complexity}/10`);
  if (contextInfo.length === 0) {
    return basePrompt;
  }
  return `${basePrompt}\n\nContext: ${contextInfo.join(', ')}`;
}

/**
 * Build context summary for agent with compression for efficiency
 */
function buildContextSummary(context = {}, agentName) {
  if (!context || Object.keys(context).length === 0) {
    return {};
  }
  const contextSize = JSON.stringify(context).length;
  // Only log warning if context is very large
  if (contextSize > 5000) {
    console.warn(`[buildContextSummary] Large context (${contextSize} chars) for ${agentName}`);
  }
  if (contextSize < 1000) {
    return context;
  }
  const compressed = {};
  if (context.pageSpec) {
    compressed.pageSpec = {
      type: context.pageSpec.type,
      industry: context.pageSpec.industry,
      complexity: context.pageSpec.complexity,
      sections: context.pageSpec.sections?.slice(0, 3)
    };
  }
  if (context.design) {
    // CRITICAL FIX: Preserve important design data for CodeAgent
    if (agentName === 'CodeAgent') {
      // CodeAgent needs full design data for gradient extraction and styling
      compressed.design = context.design;
    } else {
      // For other agents, keep the compressed version
      compressed.design = {
        modernVisualSystem: context.design.modernVisualSystem,
        advancedColorSystem: context.design.advancedColorSystem,
        modernTypography: context.design.modernTypography,
        // Preserve full structure but limit depth
        style: context.design.modernVisualSystem?.style,
        colors: context.design.advancedColorSystem?.primaryGradients?.[0],
        typography: context.design.modernTypography?.headingFont
      };
    }
    
    console.log(`[buildContextSummary-DEBUG] Design compression for ${agentName}:`, {
      originalKeys: context.design ? Object.keys(context.design) : [],
      compressedKeys: compressed.design ? Object.keys(compressed.design) : [],
      preservedAdvancedColorSystem: !!compressed.design?.advancedColorSystem,
      preservedGradients: !!compressed.design?.advancedColorSystem?.primaryGradients
    });
  }
  if (context.content && agentName !== 'contentAgent') {
    compressed.content = {
      heroTitle: context.content.hero?.title,
      featuresCount: context.content.features?.length || 0,
      companyName: context.content.companyInfo?.name
    };
  } else if (context.content) {
    compressed.content = context.content;
  }
  if (context.layout && agentName === 'codeAgent') {
    compressed.layout = context.layout;
  } else if (context.layout) {
    compressed.layout = { strategy: context.layout.strategy };
  }
  if (context.code && (agentName === 'tailwindStylistAgent' || agentName === 'validatorAgent')) {
    compressed.code = context.code;
  } else if (context.code) {
    compressed.code = { componentName: context.code.componentName };
  }
  return compressed;
}

/**
 * Build enhanced system prompt for each agent type with JSON-only enforcement
 */
function buildEnhancedSystemPrompt(agentName) {
  const basePrompt = `You are a specialized AI agent focused on generating production-ready web components.`;
  const jsonCriticalAgents = ['LayoutAgent', 'CodeAgent', 'TailwindStylistAgent', 'ValidatorAgent', 'SpecAgent', 'DesignAgent', 'ContentAgent'];
  if (jsonCriticalAgents.includes(agentName)) {
    return `${basePrompt}

CRITICAL INSTRUCTION: You MUST return ONLY valid JSON. No explanatory text, no markdown blocks, no comments, no code fences. Start your response directly with { and end with }.

FORBIDDEN:
- Do not write "Here is the JSON:" or similar
- Do not use \`\`\`json or \`\`\` blocks
- Do not add explanations before or after JSON
- Do not include any text outside the JSON structure

REQUIRED: Return pure, valid JSON that can be parsed directly.`;
  }
  return basePrompt;
}

module.exports = {
  runAgent,
  parseJSONResponse,
  buildOptimizedPrompt,
  buildContextSummary,
  buildEnhancedSystemPrompt
};