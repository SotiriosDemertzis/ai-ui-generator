/**
 * @file backend/database/index.js
 * @description Unified database connection and schema management for the backend.
 * This file centralizes the PostgreSQL connection pool, query execution,
 * and database initialization (table creation, indexing) from a single schema file.
 */
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create connection pool
const pool = new Pool(dbConfig);

// Database utility functions
const db = {
  pool,
  isShuttingDown: false,

  /**
   * Execute a query with parameters
   */
  async query(text, params = []) {
    if (this.isShuttingDown) {
      console.log('🛑 [DB] Ignoring query during shutdown:', text.substring(0, 50));
      return { rows: [] };
    }
    
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`📊 [DB] Query executed in ${duration}ms: ${text.substring(0, 100)}...`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`❌ [DB] Query failed after ${duration}ms:`, error.message);
      throw error;
    }
  },

  /**
   * Initialize database (create tables, indexes, views from schema.sql)
   */
  async initialize() {
    try {
      console.log('🔄 [DB] Initializing database...');
      
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await this.query(schema);
        console.log('✅ [DB] Database schema created/updated successfully');
      } else {
        console.warn('⚠️ [DB] Schema file not found, skipping table creation');
      }

      // Test connection
      await this.query('SELECT NOW() as current_time');
      console.log('✅ [DB] Database connection verified');
      console.log('🎯 System ready for AI generation with optimizations!');

    } catch (error) {
      console.error('❌ [DB] Database initialization failed:', error.message);
      throw error;
    }
  },

  /**
   * Get all pages with summary info and optional filters
   */
  async getAllPages(limit = 50, offset = 0, approved, minScore, sessionId) {
    try {
      let query = `SELECT * FROM page_summary`;
      const params = [];
      const conditions = [];
      let paramIndex = 1;

      if (approved !== undefined && approved !== null) {
        conditions.push(`approved = $${paramIndex++}`);
        params.push(approved === 'true');
      }
      if (minScore) {
        conditions.push(`overall_score >= $${paramIndex++}`);
        params.push(parseInt(minScore));
      }
      if (sessionId) {
        conditions.push(`session_id = $${paramIndex++}`);
        params.push(parseInt(sessionId));
      }

      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(` AND `);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const result = await this.query(query, params);
      return result.rows;

    } catch (error) {
      console.error('❌ [DB] Failed to get pages:', error.message);
      throw error;
    }
  },

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      const result = await this.query('SELECT NOW() as current_time, version() as pg_version');
      return {
        connected: true,
        timestamp: result.rows[0].current_time,
        version: result.rows[0].pg_version.split(' ')[0]
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  },

  /**
   * Close database connections
   */
  async close() {
    this.isShuttingDown = true;
    await pool.end();
    console.log('👋 [DB] Database connections closed');
  }
};

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('🛑 [DB] Received SIGTERM, closing database connections...');
  await db.close();
});

process.on('SIGINT', async () => {
  console.log('🛑 [DB] Received SIGINT, closing database connections...');
  await db.close();
});

module.exports = db;