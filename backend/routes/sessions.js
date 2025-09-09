/**
 * @file backend/routes/sessions.js
 * @description This file defines the API routes for managing user sessions.
 * It provides endpoints for creating, retrieving, updating, and deleting sessions, as well as fetching all sessions for a given user.
 * All routes are protected by the `verifyToken` middleware to ensure that only authenticated users can access their sessions.
 * The routes interact with the database to perform CRUD operations on the `sessions` and `prompts` tables.
 */
const express = require('express');
const pool = require('../database/database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get all sessions for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('📋 GET /api/sessions request:', { 
      userId: req.user?.userId,
      timestamp: new Date().toISOString()
    });

    const sessions = await pool.query(
      `SELECT s.*, COUNT(p.id) as prompt_count 
       FROM sessions s 
       LEFT JOIN prompts p ON s.id = p.session_id 
       WHERE s.user_id = $1 
       GROUP BY s.id 
       ORDER BY s.updated_at DESC`,
      [req.user.userId]
    );

    console.log('📋 Sessions query result:', {
      rowCount: sessions.rows.length,
      userId: req.user.userId
    });

    res.json({ sessions: sessions.rows });
  } catch (error) {
    console.error('❌ GET /api/sessions error:', {
      error: error.message,
      stack: error.stack?.substring(0, 500),
      userId: req.user?.userId
    });
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      success: false 
    });
  }
});

// Get a specific session with its prompts
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get session details
    const session = await pool.query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (session.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Get all prompts for this session
    const prompts = await pool.query(
      'SELECT * FROM prompts WHERE session_id = $1 ORDER BY created_at ASC',
      [id]
    );

    // Clean jsx_code for all prompts using the enhanced extraction utility
    const cleanedPrompts = prompts.rows.map(prompt => {
      if (prompt.jsx_code) {
          console.log(`✅ Successfully extracted component for prompt ${prompt.id}, length:`, prompt.jsx_code);
          return {
            ...prompt,
            jsx_code: prompt.jsx_code
          };
        } else {
          console.warn(`⚠️ Extraction failed for prompt ${prompt.id}:`, extractionResult.error);
          return prompt;
        }    
      });

    res.json({
      session: session.rows[0],
      prompts: cleanedPrompts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new session
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title } = req.body;
    const sessionTitle = title || `Session ${new Date().toLocaleDateString()}`;

    const newSession = await pool.query(
      'INSERT INTO sessions (user_id, title) VALUES ($1, $2) RETURNING *',
      [req.user.userId, sessionTitle]
    );

    res.status(201).json(newSession.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update session title
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const updatedSession = await pool.query(
      'UPDATE sessions SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [title, id, req.user.userId]
    );

    if (updatedSession.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(updatedSession.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a session
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete all prompts first (foreign key constraint)
    await pool.query('DELETE FROM prompts WHERE session_id = $1', [id]);
    
    // Then delete the session
    const deletedSession = await pool.query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (deletedSession.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;