/**
 * @file backend/services/cacheService.js
 * @description Redis-based caching service for dramatic performance improvements
 */

const Redis = require('ioredis');

class CacheService {
  constructor() {
    // Use Redis if available, fallback to in-memory for development
    this.redis = this.initializeRedis();
    this.memoryCache = new Map(); // Fallback for development
    this.isRedisConnected = false;
    
    console.log('🗄️ Cache Service initialized');
  }
  
  initializeRedis() {
    try {
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });
      
      redis.on('connect', () => {
        this.isRedisConnected = true;
        console.log('✅ Redis connected successfully');
      });
      
      redis.on('error', (err) => {
        this.isRedisConnected = false;
        console.warn('⚠️ Redis connection failed, using memory cache:', err.message);
      });
      
      return redis;
    } catch (error) {
      console.warn('⚠️ Redis not available, using memory cache:', error.message);
      return null;
    }
  }
  
  /**
   * Generate cache key for component specifications
   */
  generateSpecCacheKey(prompt, industry, businessName) {
    const cleanPrompt = prompt.toLowerCase().trim().replace(/\s+/g, '_');
    return `spec:${industry}:${businessName || 'generic'}:${cleanPrompt.substring(0, 50)}`;
  }
  
  /**
   * Generate cache key for industry contexts
   */
  generateIndustryCacheKey(industry) {
    return `industry:${industry}:context`;
  }
  
  /**
   * Generate cache key for similar components
   */
  generateComponentCacheKey(promptHash, industry, agentVersionHash = null) {
    const versionPart = agentVersionHash ? `:v${agentVersionHash}` : '';
    return `component:${industry}:${promptHash}${versionPart}`;
  }
  
  /**
   * Generate agent version hash based on all agent prompt files
   */
  generateAgentVersionHash() {
    const crypto = require('crypto');
    const fs = require('fs');
    const path = require('path');
    
    try {
      const agentPromptsDir = path.join(__dirname, '../ai/prompts');
      const agentFiles = [
        'specificationAgent.js',
        'uxArchitectPrompt.js', 
        'uiDesignerPrompt.js',
        'reactTailwindCoderPrompt.js',
        'designCriticPrompt.js'
      ];
      
      let combinedContent = '';
      for (const file of agentFiles) {
        const filePath = path.join(agentPromptsDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          combinedContent += content;
        }
      }
      
      // Create hash of all agent prompt content
      const hash = crypto.createHash('sha256').update(combinedContent).digest('hex').substring(0, 8);
      console.log(`🔄 Agent Version Hash: ${hash}`);
      return hash;
    } catch (error) {
      console.warn('⚠️ Failed to generate agent version hash:', error.message);
      return 'default';
    }
  }
  
  /**
   * Cache component specification (1 hour TTL)
   */
  async cacheComponentSpec(prompt, industry, businessName, spec) {
    const key = this.generateSpecCacheKey(prompt, industry, businessName);
    await this.set(key, spec, 3600); // 1 hour
    console.log(`💾 Cached spec: ${key}`);
  }
  
  /**
   * Get cached component specification
   */
  async getCachedSpec(prompt, industry, businessName) {
    const key = this.generateSpecCacheKey(prompt, industry, businessName);
    const cached = await this.get(key);
    if (cached) {
      console.log(`⚡ Cache HIT for spec: ${key}`);
      return cached;
    }
    console.log(`💫 Cache MISS for spec: ${key}`);
    return null;
  }
  
  /**
   * Cache industry context (24 hours TTL)
   */
  async cacheIndustryContext(industry, context) {
    const key = this.generateIndustryCacheKey(industry);
    await this.set(key, context, 86400); // 24 hours
    console.log(`💾 Cached industry context: ${industry}`);
  }
  
  /**
   * Get cached industry context
   */
  async getCachedIndustryContext(industry) {
    const key = this.generateIndustryCacheKey(industry);
    const cached = await this.get(key);
    if (cached) {
      console.log(`⚡ Cache HIT for industry: ${industry}`);
      return cached;
    }
    return null;
  }
  
  /**
   * Cache complete component (2 hours TTL)
   */
  async cacheComponent(promptHash, industry, component, metadata) {
    const agentVersionHash = this.generateAgentVersionHash();
    const key = this.generateComponentCacheKey(promptHash, industry, agentVersionHash);
    const data = { component, metadata, cachedAt: Date.now(), agentVersion: agentVersionHash };
    await this.set(key, data, 7200); // 2 hours
    console.log(`💾 Cached component: ${key}`);
  }
  
  /**
   * Get cached component
   */
  async getCachedComponent(promptHash, industry) {
    const agentVersionHash = this.generateAgentVersionHash();
    const key = this.generateComponentCacheKey(promptHash, industry, agentVersionHash);
    const cached = await this.get(key);
    if (cached) {
      console.log(`⚡ Cache HIT for component: ${key} (agent v${agentVersionHash})`);
      return cached;
    }
    console.log(`💫 Cache MISS for component: ${key} (agent v${agentVersionHash})`);
    return null;
  }
  
  /**
   * Generic set method with Redis/Memory fallback
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      if (this.isRedisConnected && this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        // Fallback to memory cache with TTL
        const expiry = Date.now() + (ttlSeconds * 1000);
        this.memoryCache.set(key, { value, expiry });
        
        // Clean up expired items periodically
        setTimeout(() => {
          const item = this.memoryCache.get(key);
          if (item && Date.now() > item.expiry) {
            this.memoryCache.delete(key);
          }
        }, ttlSeconds * 1000);
      }
    } catch (error) {
      console.warn('Cache set failed:', error.message);
    }
  }
  
  /**
   * Generic get method with Redis/Memory fallback
   */
  async get(key) {
    try {
      if (this.isRedisConnected && this.redis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to memory cache
        const item = this.memoryCache.get(key);
        if (item) {
          if (Date.now() > item.expiry) {
            this.memoryCache.delete(key);
            return null;
          }
          return item.value;
        }
        return null;
      }
    } catch (error) {
      console.warn('Cache get failed:', error.message);
      return null;
    }
  }
  
  /**
   * Clear cache by pattern
   */
  async clearPattern(pattern) {
    try {
      if (this.isRedisConnected && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          console.log(`🗑️ Cleared ${keys.length} cache entries matching: ${pattern}`);
        }
      } else {
        // Clear memory cache by pattern
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.warn('Cache clear failed:', error.message);
    }
  }
  
  /**
   * Clear all outdated component cache entries (different agent versions)
   * This is useful when agents are updated to remove stale cached components
   */
  async clearOutdatedComponents() {
    const currentVersionHash = this.generateAgentVersionHash();
    console.log(`🔄 Clearing components cached with old agent versions (current: v${currentVersionHash})`);
    
    try {
      if (this.isRedisConnected && this.redis) {
        // Get all component cache keys
        const allKeys = await this.redis.keys('component:*');
        let clearedCount = 0;
        
        for (const key of allKeys) {
          // Check if key contains version hash
          if (key.includes(':v') && !key.includes(`:v${currentVersionHash}`)) {
            await this.redis.del(key);
            clearedCount++;
          } else if (!key.includes(':v')) {
            // Clear old format cache entries (before version hash was added)
            await this.redis.del(key);
            clearedCount++;
          }
        }
        
        if (clearedCount > 0) {
          console.log(`🗑️ Cleared ${clearedCount} outdated component cache entries`);
        } else {
          console.log(`✅ No outdated cache entries found`);
        }
      } else {
        // Clear outdated entries from memory cache
        let clearedCount = 0;
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith('component:') && 
              ((key.includes(':v') && !key.includes(`:v${currentVersionHash}`)) || 
               !key.includes(':v'))) {
            this.memoryCache.delete(key);
            clearedCount++;
          }
        }
        if (clearedCount > 0) {
          console.log(`🗑️ Cleared ${clearedCount} outdated component cache entries from memory`);
        }
      }
    } catch (error) {
      console.warn('Failed to clear outdated cache entries:', error.message);
    }
  }
  
  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      if (this.isRedisConnected && this.redis) {
        const info = await this.redis.info('keyspace');
        return {
          type: 'redis',
          connected: true,
          info: info
        };
      } else {
        return {
          type: 'memory',
          connected: true,
          size: this.memoryCache.size,
          keys: Array.from(this.memoryCache.keys())
        };
      }
    } catch (error) {
      return {
        type: 'none',
        connected: false,
        error: error.message
      };
    }
  }
  
  /**
   * Calculate prompt similarity for intelligent caching
   */
  calculatePromptSimilarity(prompt1, prompt2) {
    const words1 = prompt1.toLowerCase().split(/\s+/);
    const words2 = prompt2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }
  
  /**
   * Hash prompt for consistent caching
   */
  hashPrompt(prompt) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(prompt.toLowerCase().trim()).digest('hex').substring(0, 16);
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;