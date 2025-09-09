/**
 * @file backend/routes/pages.js
 * @description New backend routes for multi-agent page generation system
 */

console.log('DEBUG: backend/routes/pages.js loaded');

const express = require('express');
// NEW: Use improved orchestrator with validation loop
const { ImprovedOrchestrator } = require('../ai/orchestrator');
const db = require('../database/database'); // Updated import
const verifyToken = require('../middleware/auth');
const { validatePrompt } = require('../middleware/security');

const router = express.Router();

/**
 * POST /test-debug - Test route for debugging without authentication
 */
router.post('/test-debug', validatePrompt, async (req, res) => {
  const { prompt = "Create a simple healthcare dashboard with patient metrics" } = req.body;
  
  console.log(`🧪 [Test Debug] Starting debug test generation: "${prompt}"`);
  
  try {
    const orchestrator = new ImprovedOrchestrator();
    
    console.log('🧪 [Test Debug] Calling orchestrator.generatePage...');
    const result = await orchestrator.generatePage(prompt, {
      sessionId: `test_debug_${Date.now()}`,
      mode: 'full'
    });

    console.log('🧪 [Test Debug] Generation completed successfully!');
    console.log('🧪 [Test Debug] Result keys:', Object.keys(result));
    console.log('🧪 [Test Debug] Validation score:', result.validationScore);
    
    // Handle both successful and failed generations with proper metadata
    const response = {
      success: result.success !== false,
      message: result.success !== false ? 'Debug test completed successfully' : 'Debug test completed with errors',
      correlationId: result.context?.correlationId,
      validationScore: result.validationScore,
      executionTime: result.executionTime,
      agentsUsed: result.agentsUsed,
      codeLength: result.finalCode?.length || result.code?.length || 0,
      error: result.error || null,
      failedAt: result.success === false ? 'pipeline' : null
    };

    // Add debug metadata if available
    if (result.context?.correlationId) {
      response.debugInfo = {
        hasContext: !!result.context,
        contextKeys: result.context ? Object.keys(result.context) : [],
        hasValidation: !!result.validation,
        pipeline: result.context?.pipeline || 'unknown'
      };
    }

    res.json(response);

  } catch (error) {
    console.error('🧪 [Test Debug] Generation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /generatePage - Generate a complete page using multi-agent system
 */
router.post('/generatePage', verifyToken, validatePrompt, async (req, res) => {
  const { prompt, mode = 'full', sessionId } = req.body;
  
  // CRITICAL FIX: Get userId from auth middleware (req.user) instead of req.body
  const userId = req.user?.id || req.user?.userId || req.user?.sub;

  console.log(`🚀 [Pages API] Starting page generation: "${prompt}"`);
  console.log(`📋 [Pages API] Mode: ${mode}, Session: ${sessionId}, User: ${userId}`);
  console.log(`🔍 [Pages API] Auth context: ${JSON.stringify(req.user)}`);

  try {
    const startTime = Date.now();

    // Use the NEW improved orchestrator with validation loop
    const orchestrator = new ImprovedOrchestrator();
    const result = await orchestrator.generatePage(prompt, {
      sessionId,
      userId,
      generationRequestId: `gen_${Date.now()}`,
      mode // Pass mode as hint to orchestrator
    });

    const executionTime = Date.now() - startTime;

    if (result.success) {
      console.log(`✅ [Pages API] NEW FLOW generation successful (${executionTime}ms)`);
      console.log(`📊 [Pages API] Validation score: ${result.validationScore}/100`);
      console.log(`🎨 [Pages API] Agents used: ${result.agentsUsed.join(' → ')}`);
      console.log(`✅ [Pages API] Approved: ${result.context?.validation?.passed ? 'YES' : 'NO'}`);
      
      // NEW: Enhanced debug logging for new flow
      console.log(`📁 [NEW-FLOW-DEBUG] Final code analysis:`);
      console.log(`📁 [NEW-FLOW-DEBUG] Final code exists: ${!!result.finalCode}`);
      console.log(`📁 [NEW-FLOW-DEBUG] Final code length: ${result.finalCode?.length || 0}`);
      console.log(`📁 [NEW-FLOW-DEBUG] Validation attempts: ${result.context?.validationLoop?.attempt || 0}`);
      console.log(`📁 [NEW-FLOW-DEBUG] Final validation passed: ${result.context?.validation?.passed}`);
      
      if (result.finalCode) {
        console.log(`📁 [NEW-FLOW-DEBUG] Code preview:`);
        console.log(`📁 [NEW-FLOW-DEBUG] ${result.finalCode.substring(0, 200)}...`);
      }
      
      console.log(`💾 [Pages API] NEW FLOW Generated page details:`, {
        sessionId,
        userPrompt: prompt?.substring(0, 100) + '...',
        hasFinalCode: !!result.finalCode,
        finalCodeLength: result.finalCode?.length || 0,
        validationScore: result.validationScore,
        validationPassed: result.context?.validation?.passed,
        agentsUsed: result.agentsUsed
      });

      // Save generated page to the database
      let insertedPage = null;
      try {
        const insertResult = await db.query(
          `INSERT INTO pages (user_prompt, session_id, page_spec, component_graph, final_code, files_manifest, main_file, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
          [
            prompt,
            sessionId,
            JSON.stringify(result.context?.pageSpec || {}),
            JSON.stringify(result.context?.layout || {}),
            result.finalCode || '',
            null, // No files in new flow
            null  // No main file in new flow
          ]
        );
        insertedPage = insertResult.rows[0];
      } catch (dbError) {
        console.error('❌ [Pages API] Failed to save generated page to DB:', dbError.message);
      }

      // ENHANCED DEBUG LOGGING - Response preparation
      console.log(`🔍 [RESPONSE-PREP] Raw orchestrator result analysis:`);
      console.log(`🔍 [RESPONSE-PREP] result.finalCode exists: ${!!result.finalCode}`);
      console.log(`🔍 [RESPONSE-PREP] result.finalCode length: ${result.finalCode?.length || 0}`);
      console.log(`🔍 [RESPONSE-PREP] result.reactCode exists: ${!!result.reactCode}`);
      console.log(`🔍 [RESPONSE-PREP] result.context exists: ${!!result.context}`);
      console.log(`🔍 [RESPONSE-PREP] result.context.validationLoop.currentCode exists: ${!!result.context?.validationLoop?.currentCode}`);
      
      // CRITICAL FIX: Map finalCode to reactCode for frontend compatibility
      const finalReactCode = result.finalCode || result.context?.validationLoop?.currentCode || '';
      
      console.log(`🔍 [RESPONSE-PREP] Using finalReactCode length: ${finalReactCode?.length || 0}`);
      if (finalReactCode) {
        console.log(`🔍 [RESPONSE-PREP] finalReactCode preview: ${finalReactCode.substring(0, 200)}...`);
      }

      const responsePayload = {
        success: true,
        page: insertedPage || {
          id: Date.now(), // Fallback temporary ID
          user_prompt: prompt,
          final_code: finalReactCode, // Use corrected code
          files_manifest: result.files ? JSON.stringify(result.files) : null,
          main_file: result.mainFile,
          page_spec: result.metadata?.results?.specAgent?.pageSpec,
          component_graph: result.metadata?.results?.layoutAgent?.componentGraph,
          session_id: sessionId,
          created_at: new Date().toISOString()
        },
        metadata: {
          ...result.metadata,
          executionTime,
          mode,
          agentExecutions: result.logs?.length || 0,
          qualityScore: result.metadata?.qualityScore || 85,
          approved: true
        },
        result: {
          pageSpec: result.metadata?.results?.specAgent?.pageSpec,
          componentGraph: result.metadata?.results?.layoutAgent?.componentGraph,
          reactCode: finalReactCode, // CRITICAL FIX: Use finalCode here for frontend compatibility
          files: result.files, // Include files in response
          mainFile: result.mainFile, // Include mainFile in response
          approved: true,
          qaScore: result.result?.qaReport?.overallScore
        }
      };
      
      console.log(`📤 [RESPONSE-DEBUG] Sending response to frontend:`);
      console.log(`📤 [RESPONSE-DEBUG] Response has files: ${!!responsePayload.result.files}`);
      console.log(`📤 [RESPONSE-DEBUG] Response mainFile: ${responsePayload.result.mainFile}`);
      console.log(`📤 [RESPONSE-DEBUG] Response reactCode length: ${responsePayload.result.reactCode?.length || 0}`);
      if (responsePayload.result.files) {
        console.log(`📤 [RESPONSE-DEBUG] Response files keys: ${Object.keys(responsePayload.result.files).join(', ')}`);
      }
      
      res.json(responsePayload);
    } else {
      console.error(`❌ [Pages API] Page generation failed: ${result.error}`);

      res.status(500).json({
        success: false,
        error: result.error,
        metadata: {
          executionTime,
          mode,
          failedAt: result.metadata?.lastSuccessfulPhase,
          partialLogs: result.logs
        }
      });
    }

  } catch (error) {
    console.error('❌ [Pages API] Route error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Page generation failed',
      details: error.message
    });
  }
});

/**
 * GET /pages/:id - Get a specific page by ID
 */
router.get('/pages/:id', async (req, res) => {
  const { id } = req.params;
  const { format = 'json' } = req.query;

  console.log(`📄 [Pages API] Fetching page ${id} (format: ${format})`);

  try {
    const page = await db.getPageById(parseInt(id));

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    if (format === 'code') {
      // Return just the React code for direct use
      res.setHeader('Content-Type', 'text/plain');
      res.send(page.final_code);
    } else {
      // Return full page data as JSON
      res.json({
        success: true,
        page: {
          id: page.id,
          userPrompt: page.user_prompt,
          pageSpec: page.page_spec,
          componentGraph: page.component_graph,
          finalCode: page.final_code,
          filesManifest: page.files_manifest,
          mainFile: page.main_file,
          qaReport: page.qa_report,
          reviewResult: page.review_result,
          createdAt: page.created_at,
          updatedAt: page.updated_at,
          // Summary data
          qualityScore: page.overall_score,
          approved: page.approved,
          agentLogs: page.agent_logs
        }
      });
    }

  } catch (error) {
    console.error('❌ [Pages API] Failed to fetch page:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch page',
      details: error.message
    });
  }
});

/**
 * GET /pages - Get all pages with pagination
 */
router.get('/', async (req, res) => {
  console.log('🔍 [Pages API] Reached GET /api/pages route handler');
  const { limit = 20, offset = 0, approved, minScore, sessionId } = req.query;
  
  console.log('📊 [Pages API] Query parameters:', {
    limit,
    offset,
    approved,
    minScore,
    sessionId
  });

  try {
    let pages = await db.getAllPages(
      parseInt(limit), 
      parseInt(offset), 
      approved, 
      minScore, 
      sessionId
    );

    // Apply filters
    if (approved !== undefined) {
      const isApproved = approved === 'true';
      pages = pages.filter(page => page.approved === isApproved);
    }

    if (minScore) {
      const minScoreNum = parseInt(minScore);
      pages = pages.filter(page => (page.overall_score || 0) >= minScoreNum);
    }

    console.log(`✅ [Pages API] Returning ${pages.length} pages`);
    
    if (sessionId) {
      console.log(`🔍 [Pages API] Filtered pages for session ${sessionId}:`, pages.map(page => ({
        id: page.id,
        userPrompt: page.user_prompt?.substring(0, 100) + '...',
        sessionId: page.session_id,
        createdAt: page.created_at,
        hasFinalCode: !!page.final_code,
        finalCodeLength: page.final_code?.length || 0
      })));
    }

    res.json({
      success: true,
      pages: pages.map(page => ({
        id: page.id,
        userPrompt: page.user_prompt,
        pageSpec: page.page_spec,
        componentGraph: page.component_graph,
        finalCode: page.final_code,
        filesManifest: page.files_manifest,
        mainFile: page.main_file,
        qaReport: page.qa_report,
        reviewResult: page.review_result,
        createdAt: page.created_at,
        updatedAt: page.updated_at,
        sessionId: page.session_id,
        qualityScore: page.overall_score,
        approved: page.approved
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: pages.length,
        hasMore: pages.length === parseInt(limit)
      },
      filters: {
        approved: approved !== undefined ? approved === 'true' : null,
        minScore: minScore ? parseInt(minScore) : null
      }
    });

  } catch (error) {
    console.error('❌ [Pages API] Failed to fetch pages:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pages',
      details: error.message
    });
  }
});

module.exports = router;