/**
 * @file backend/ai/agents/imageIntegrationAgent.js
 * @description Real Image Integration Agent for industry-appropriate images with fallback strategies
 * @purpose Integrate real, industry-appropriate images with fallback strategies
 */

/**
 * ImageIntegrationAgent - Integrates real images from external APIs with proper fallbacks
 * Implementation of Phase 4 from PURE_AI_GENERATION_TECHNICAL_SPEC.md
 */
class ImageIntegrationAgent {
  constructor() {
    this.name = 'ImageIntegrationAgent';
    this.version = '1.1';
    // Using only Pexels API for real image integration
    this.pexelsApiKey = process.env.PEXELS_API_KEY;
  }

  /**
   * Main integration method to add real images to component code
   * Can be called with separate parameters OR a single context object
   */
  async integrateImages(componentCode, pageSpec, content, context = null) {
    // Handle both calling patterns: integrateImages(context) OR integrateImages(componentCode, pageSpec, content)
    if (arguments.length === 1 && typeof componentCode === 'object' && componentCode.componentCode) {
      // Single context object pattern
      context = componentCode;
      ({ componentCode, pageSpec, content } = context);
    }
    console.log('\n🖼️ [ImageIntegrationAgent] Starting image integration...');
    
    try {
      const imageRequirements = this.analyzeImageNeeds(componentCode, pageSpec);
      const images = await this.fetchIndustryImages(imageRequirements, pageSpec.industry);
      
      return this.injectImagesIntoCode(componentCode, images);
    } catch (error) {
      console.error('❌ [ImageIntegrationAgent] Error integrating images:', error);
      // Return original code with placeholder images as fallback
      return this.addPlaceholderImages(componentCode, pageSpec);
    }
  }

  /**
   * Analyze component code to determine image requirements
   */
  analyzeImageNeeds(componentCode, pageSpec) {
    const requirements = {};
    
    // Detect common image patterns in the code
    if (componentCode.includes('hero') || componentCode.includes('Hero')) {
      requirements.hero = {
        section: 'hero',
        orientation: 'landscape',
        mood: 'professional',
        size: 'large'
      };
    }
    
    if (componentCode.includes('about') || componentCode.includes('About')) {
      requirements.about = {
        section: 'about',
        orientation: 'landscape',
        mood: 'team',
        size: 'medium'
      };
    }
    
    if (componentCode.includes('services') || componentCode.includes('Services')) {
      requirements.services = {
        section: 'services',
        orientation: 'square',
        mood: 'professional',
        size: 'medium'
      };
    }
    
    if (componentCode.includes('contact') || componentCode.includes('Contact')) {
      requirements.contact = {
        section: 'contact',
        orientation: 'landscape',
        mood: 'office',
        size: 'medium'
      };
    }
    
    // If no specific sections found, add a default hero image
    if (Object.keys(requirements).length === 0) {
      requirements.hero = {
        section: 'hero',
        orientation: 'landscape',
        mood: 'professional',
        size: 'large'
      };
    }
    
    console.log('🔍 [ImageIntegrationAgent] Image requirements analyzed:', {
      sectionsFound: Object.keys(requirements),
      totalImages: Object.keys(requirements).length
    });
    
    return requirements;
  }

  /**
   * Fetch industry-appropriate images from Pexels API with fallbacks
   */
  async fetchIndustryImages(requirements, industry) {
    const images = {};
    
    for (const [section, requirement] of Object.entries(requirements)) {
      const keywords = this.generateKeywords(requirement, industry);
      
      try {
        // Try Pexels API if key is available
        if (this.pexelsApiKey) {
          const pexelsImage = await this.fetchFromPexels(keywords, requirement);
          if (pexelsImage) {
            images[section] = pexelsImage;
            console.log(`✅ [ImageIntegrationAgent] Pexels image found for ${section}`);
            continue;
          }
        }
        
        // Fallback to professional placeholder
        images[section] = this.createPlaceholderImage(keywords, requirement);
        console.log(`📋 [ImageIntegrationAgent] Using placeholder for ${section} (Pexels API unavailable)`);
        
      } catch (error) {
        console.warn(`⚠️ [ImageIntegrationAgent] Failed to fetch image for ${section}:`, error.message);
        images[section] = this.createPlaceholderImage(keywords, requirement);
      }
    }
    
    console.log('✅ [ImageIntegrationAgent] Image fetching completed:', {
      totalImages: Object.keys(images).length,
      sections: Object.keys(images),
      pexelsApiAvailable: !!this.pexelsApiKey
    });
    
    return images;
  }

  /**
   * Generate keywords for image search based on industry and context
   */
  generateKeywords(requirement, industry) {
    const industryKeywords = {
      healthcare: ['medical', 'doctor', 'healthcare', 'hospital', 'wellness', 'clinic', 'nurse', 'patient', 'medical office'],
      finance: ['finance', 'business', 'professional', 'banking', 'investment', 'financial advisor', 'money', 'corporate'],
      fintech: ['finance', 'technology', 'business', 'data', 'professional', 'banking', 'investment'],
      'e-commerce': ['shopping', 'product', 'lifestyle', 'retail', 'commerce', 'store', 'customer', 'online shopping'],
      ecommerce: ['shopping', 'product', 'lifestyle', 'retail', 'commerce', 'store', 'customer', 'online shopping'],
      technology: ['technology', 'code', 'development', 'software', 'innovation', 'digital', 'computer', 'tech workspace'],
      education: ['education', 'learning', 'students', 'knowledge', 'growth', 'classroom', 'study', 'university'],
      'real estate': ['real estate', 'property', 'homes', 'luxury', 'investment', 'building', 'architecture', 'house'],
      realestate: ['real estate', 'property', 'homes', 'luxury', 'investment', 'building', 'architecture', 'house']
    };
    
    const contextKeywords = {
      hero: ['banner', 'professional', 'modern', 'corporate'],
      about: ['team', 'office', 'professional', 'workplace'],
      services: ['services', 'professional', 'quality', 'expertise'],
      contact: ['office', 'building', 'professional', 'communication']
    };
    
    return [
      ...industryKeywords[industry] || ['business', 'professional'],
      ...contextKeywords[requirement.section] || ['professional'],
      requirement.mood || 'modern',
      'high quality'
    ];
  }


  /**
   * Fetch image from Pexels API
   */
  async fetchFromPexels(keywords, requirement) {
    if (!this.pexelsApiKey) return null;
    
    try {
      const query = keywords.slice(0, 3).join(' '); // Limit keywords for API
      console.log(`🔍 [ImageIntegrationAgent] Searching Pexels for: "${query}"`);
      
      // Real Pexels API call
      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=${requirement.orientation || 'landscape'}`, {
        headers: {
          'Authorization': this.pexelsApiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.photos && data.photos.length > 0) {
        const photo = data.photos[0];
        console.log(`✅ [ImageIntegrationAgent] Found Pexels image by ${photo.photographer}`);
        return {
          primary: photo.src.large,
          fallback1: photo.src.medium,
          fallback2: photo.src.small,
          alt: photo.alt || `${keywords.join(' ')} - Professional Image`,
          source: 'pexels',
          photographer: photo.photographer,
          url: photo.url
        };
      } else {
        console.log(`📋 [ImageIntegrationAgent] No Pexels images found for "${query}"`);
      }
    } catch (error) {
      console.warn('⚠️ [ImageIntegrationAgent] Pexels API error:', error.message);
    }
    
    return null;
  }

  /**
   * Create professional placeholder image as ultimate fallback
   * Enhanced with industry-specific colors and high-quality services
   */
  createPlaceholderImage(keywords, requirement) {
    const keyword = keywords[0] || 'business';
    const size = this.getSizeFromRequirement(requirement);
    const industryColors = this.getIndustryColors(keywords);
    
    // Use multiple high-quality placeholder services with industry-appropriate colors
    const placeholderServices = [
      // Picsum with professional overlay
      `https://picsum.photos/${size}/${Math.round(size * 0.6)}?random=1&blur=1`,
      // Unsplash Source (no API key needed)
      `https://source.unsplash.com/${size}x${Math.round(size * 0.6)}/?${keywords.slice(0, 2).join(',')}`,
      // Professional placeholder with industry colors
      `https://via.placeholder.com/${size}x${Math.round(size * 0.6)}/${industryColors.background}/${industryColors.text}?text=${encodeURIComponent(keyword)}`,
      // DummyImage.com with modern styling
      `https://dummyimage.com/${size}x${Math.round(size * 0.6)}/${industryColors.background}/${industryColors.text}&text=${encodeURIComponent(keyword)}`
    ];
    
    return {
      primary: placeholderServices[0],
      fallback1: placeholderServices[1],  
      fallback2: placeholderServices[2],
      fallback3: placeholderServices[3],
      alt: keywords.join(' ') + ' - Professional Image',
      source: 'enhanced-placeholder'
    };
  }
  
  /**
   * Get industry-appropriate colors for placeholder images
   */
  getIndustryColors(keywords) {
    // Determine industry from keywords and return appropriate color scheme
    const industryColorMap = {
      healthcare: { background: '10b981', text: 'ffffff' }, // Medical green
      technology: { background: '3b82f6', text: 'ffffff' }, // Tech blue
      finance: { background: '1e40af', text: 'ffffff' },    // Financial blue
      education: { background: '7c3aed', text: 'ffffff' },  // Education purple
      ecommerce: { background: 'dc2626', text: 'ffffff' },  // E-commerce red
      realestate: { background: '7c2d12', text: 'ffffff' } // Real estate brown
    };
    
    // Detect industry from keywords
    const keywordString = keywords.join(' ').toLowerCase();
    for (const [industry, colors] of Object.entries(industryColorMap)) {
      if (keywordString.includes(industry) || 
          keywordString.includes(industry.slice(0, -1)) || // Remove 's' from industries
          this.industryKeywordMatch(keywordString, industry)) {
        return colors;
      }
    }
    
    // Default professional colors
    return { background: '374151', text: 'ffffff' }; // Professional gray
  }
  
  /**
   * Match keywords to industry categories
   */
  industryKeywordMatch(keywordString, industry) {
    const industryKeywords = {
      healthcare: ['medical', 'doctor', 'hospital', 'clinic', 'wellness', 'nurse', 'health'],
      technology: ['tech', 'software', 'digital', 'innovation', 'code', 'ai', 'data'],
      finance: ['finance', 'banking', 'investment', 'money', 'wealth', 'financial'],
      education: ['education', 'learning', 'student', 'knowledge', 'study', 'academic'],
      ecommerce: ['shopping', 'retail', 'product', 'store', 'commerce', 'buy', 'sell'],
      realestate: ['property', 'homes', 'real estate', 'building', 'architecture', 'house']
    };
    
    const keywords = industryKeywords[industry] || [];
    return keywords.some(keyword => keywordString.includes(keyword));
  }

  /**
   * Get appropriate size based on requirement
   */
  getSizeFromRequirement(requirement) {
    const sizes = {
      large: 1200,
      medium: 800,
      small: 400
    };
    
    return sizes[requirement.size] || sizes.medium;
  }

  /**
   * Inject real images into component code
   */
  injectImagesIntoCode(componentCode, images) {
    let updatedCode = componentCode;
    
    for (const [section, imageData] of Object.entries(images)) {
      // Replace placeholder image sources with real images
      const placeholderPatterns = [
        new RegExp(`src=["'](?:https?://[^"']*placeholder[^"']*|[^"']*${section}[^"']*)["']`, 'gi'),
        new RegExp(`src=\\{[^}]*${section}[^}]*\\}`, 'gi'),
        /src=["']https?:\/\/via\.placeholder\.com[^"']*["']/gi
      ];
      
      const imageComponent = this.createOptimizedImageComponent(imageData, section);
      
      placeholderPatterns.forEach(pattern => {
        updatedCode = updatedCode.replace(pattern, imageComponent);
      });
    }
    
    return updatedCode;
  }

  /**
   * Create optimized image component with enhanced error handling and multiple fallbacks
   */
  createOptimizedImageComponent(imageData, section) {
    // Create a cascading fallback system with Pexels API fallbacks
    const fallbacks = [
      imageData.fallback1, // Pexels medium
      imageData.fallback2, // Pexels small
      imageData.fallback3, // Industry-specific placeholder
      "https://via.placeholder.com/800x400/374151/ffffff?text=Professional+Image"
    ].filter(Boolean); // Remove any undefined fallbacks
    
    const photographerCredit = imageData.source === 'pexels' ? 
      `Photo by ${imageData.photographer} on Pexels` : 
      imageData.alt;
    
    return `src="${imageData.primary}"
          alt="${photographerCredit}"
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            // First fallback (Pexels medium)
            if (e.target.src !== "${fallbacks[0] || ''}") {
              e.target.src = "${fallbacks[0] || ''}";
              return;
            }
            // Second fallback (Pexels small)
            if (e.target.src !== "${fallbacks[1] || ''}") {
              e.target.src = "${fallbacks[1] || ''}";
              return;
            }
            // Third fallback (Industry placeholder)
            if (e.target.src !== "${fallbacks[2] || ''}") {
              e.target.src = "${fallbacks[2] || ''}";
              return;
            }
            // Final fallback
            e.target.src = "${fallbacks[3] || 'https://via.placeholder.com/800x400/374151/ffffff?text=Image'}";
          }}
          loading="lazy"
          style={{backgroundColor: '#f8fafc', minHeight: '200px'}}"`;
  }

  /**
   * Add placeholder images if no real images are available
   */
  addPlaceholderImages(componentCode, pageSpec) {
    const industry = pageSpec.industry || 'business';
    const placeholderUrl = `https://via.placeholder.com/800x400?text=${encodeURIComponent(industry)}&color=3B82F6&background=F8FAFC`;
    
    // Replace any existing image sources with industry-appropriate placeholders
    let updatedCode = componentCode.replace(
      /src=["'][^"']*["']/g,
      `src="${placeholderUrl}" alt="${industry} placeholder"`
    );
    
    return updatedCode;
  }

}

module.exports = { ImageIntegrationAgent };
