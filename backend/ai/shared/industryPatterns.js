/**
 * @file backend/ai/shared/industryPatterns.js
 * @description Industry-specific visual and functional patterns for pure AI generation
 * @purpose Define unique visual and functional patterns for each industry
 */

const INDUSTRY_PATTERNS = {
  healthcare: {
    colors: {
      primary: ['#00A86B', '#20B2AA', '#4682B4'],     // Medical greens and blues
      secondary: ['#FF6B6B', '#FFA500'],              // Warm accent colors
      neutrals: ['#F8F9FA', '#E9ECEF', '#6C757D']     // Clean, clinical grays
    },
    typography: {
      headingFont: 'Inter',                           // Clean, readable
      bodyFont: 'Inter',                              // Professional consistency
      emphasis: 'font-medium',                        // Subtle emphasis
      sizing: 'conservative'                          // Readable sizes
    },
    layout: {
      sections: ['hero', 'services', 'doctors', 'testimonials', 'contact'],
      spacing: 'generous',                            // Clean, breathable
      grid: 'structured',                             // Organized information
      cta: 'reassuring'                              // Trust-building CTAs
    },
    interactions: {
      buttonStyle: 'solid',                          // Trustworthy appearance
      hoverEffect: 'subtle-lift',                    // Professional interactions
      transitions: 'smooth',                        // Calming animations
      feedback: 'reassuring'                        // Positive reinforcement
    },
    imagery: {
      keywords: ['medical', 'healthcare', 'doctor', 'hospital', 'wellness'],
      style: 'professional',
      colors: 'clean-bright'
    }
  },
  
  fintech: {
    colors: {
      primary: ['#1E40AF', '#7C3AED', '#059669'],     // Trust blues, tech purples
      secondary: ['#F59E0B', '#EF4444'],              // Warning/error colors
      neutrals: ['#111827', '#374151', '#9CA3AF']     // Tech-focused grays
    },
    typography: {
      headingFont: 'Inter Display',                   // Modern, tech-forward
      bodyFont: 'Inter',                              // Clean readability
      emphasis: 'font-semibold',                      // Strong emphasis
      sizing: 'dynamic'                               // Responsive scaling
    },
    layout: {
      sections: ['hero', 'features', 'security', 'pricing', 'integrations'],
      spacing: 'tight',                               // Information density
      grid: 'asymmetric',                             // Modern layouts
      cta: 'conversion-focused'                       // Clear value props
    },
    interactions: {
      buttonStyle: 'gradient',                       // Modern appearance
      hoverEffect: 'scale-shadow',                   // Tech interactions
      transitions: 'snappy',                        // Responsive feel
      feedback: 'data-driven'                       // Analytical feedback
    },
    imagery: {
      keywords: ['finance', 'technology', 'data', 'charts', 'business'],
      style: 'modern-tech',
      colors: 'blue-purple'
    }
  },
  
  ecommerce: {
    colors: {
      primary: ['#DC2626', '#EA580C', '#9333EA'],     // Shopping reds, oranges
      secondary: ['#16A34A', '#0891B2'],              // Success, info colors
      neutrals: ['#FAFAFA', '#E5E7EB', '#4B5563']     // Product-focused neutrals
    },
    typography: {
      headingFont: 'Inter Display',                   // Attention-grabbing
      bodyFont: 'Inter',                              // Product descriptions
      emphasis: 'font-bold',                          // Strong product emphasis
      sizing: 'varied'                                // Hierarchical pricing
    },
    layout: {
      sections: ['hero', 'products', 'reviews', 'features', 'checkout'],
      spacing: 'product-focused',                     // Showcase products
      grid: 'masonry',                                // Product grid layouts
      cta: 'buy-focused'                             // Purchase-oriented CTAs
    },
    interactions: {
      buttonStyle: 'vibrant',                        // Eye-catching buttons
      hoverEffect: 'product-preview',                // Product interactions
      transitions: 'engaging',                      // Shopping experience
      feedback: 'purchase-encouraging'              // Cart/wishlist feedback
    },
    imagery: {
      keywords: ['products', 'shopping', 'lifestyle', 'commerce', 'retail'],
      style: 'product-focused',
      colors: 'vibrant-lifestyle'
    }
  },

  technology: {
    colors: {
      primary: ['#3B82F6', '#8B5CF6', '#06B6D4'],     // Tech blues and cyans
      secondary: ['#10B981', '#F59E0B'],              // Success and warning
      neutrals: ['#1F2937', '#374151', '#6B7280']     // Dark tech grays
    },
    typography: {
      headingFont: 'JetBrains Mono',                  // Code-focused
      bodyFont: 'Inter',                              // Clean readability
      emphasis: 'font-semibold',                      // Strong emphasis
      sizing: 'dynamic'                               // Responsive scaling
    },
    layout: {
      sections: ['hero', 'features', 'documentation', 'api', 'community'],
      spacing: 'code-focused',                        // Technical density
      grid: 'modular',                                // Component-based
      cta: 'developer-focused'                        // Technical CTAs
    },
    interactions: {
      buttonStyle: 'outlined',                       // Developer-friendly
      hoverEffect: 'glow',                          // Tech interactions
      transitions: 'precise',                       // Technical feel
      feedback: 'informative'                       // Clear feedback
    },
    imagery: {
      keywords: ['technology', 'code', 'development', 'software', 'innovation'],
      style: 'tech-modern',
      colors: 'blue-tech'
    }
  },

  education: {
    colors: {
      primary: ['#7C3AED', '#2563EB', '#059669'],     // Learning purples and blues
      secondary: ['#F59E0B', '#EF4444'],              // Attention colors
      neutrals: ['#F9FAFB', '#E5E7EB', '#6B7280']     // Clean learning environment
    },
    typography: {
      headingFont: 'Inter Display',                   // Clear, readable
      bodyFont: 'Inter',                              // Educational content
      emphasis: 'font-medium',                        // Gentle emphasis
      sizing: 'accessible'                            // Readable for all ages
    },
    layout: {
      sections: ['hero', 'courses', 'instructors', 'testimonials', 'enrollment'],
      spacing: 'comfortable',                         // Learning-friendly
      grid: 'organized',                              // Structured information
      cta: 'encouraging'                             // Motivational CTAs
    },
    interactions: {
      buttonStyle: 'friendly',                       // Approachable design
      hoverEffect: 'gentle-lift',                    // Encouraging interactions
      transitions: 'smooth',                        // Calming animations
      feedback: 'positive'                          // Learning reinforcement
    },
    imagery: {
      keywords: ['education', 'learning', 'students', 'knowledge', 'growth'],
      style: 'educational',
      colors: 'bright-learning'
    }
  },

  realestate: {
    colors: {
      primary: ['#059669', '#7C3AED', '#DC2626'],     // Trust greens, luxury purples
      secondary: ['#F59E0B', '#0891B2'],              // Accent colors
      neutrals: ['#FAFAFA', '#E5E7EB', '#374151']     // Clean, luxurious neutrals
    },
    typography: {
      headingFont: 'Inter Display',                   // Elegant headings
      bodyFont: 'Inter',                              // Property descriptions
      emphasis: 'font-semibold',                      // Property emphasis
      sizing: 'luxurious'                             // Premium feel
    },
    layout: {
      sections: ['hero', 'properties', 'agents', 'testimonials', 'contact'],
      spacing: 'luxurious',                           // Premium spacing
      grid: 'property-showcase',                      // Property-focused
      cta: 'trust-building'                          // Professional CTAs
    },
    interactions: {
      buttonStyle: 'premium',                        // Luxury appearance
      hoverEffect: 'property-preview',               // Property interactions
      transitions: 'elegant',                       // Smooth, premium feel
      feedback: 'professional'                      // Trust-building feedback
    },
    imagery: {
      keywords: ['real estate', 'property', 'homes', 'luxury', 'investment'],
      style: 'premium-lifestyle',
      colors: 'luxury-neutral'
    }
  }
};

/**
 * Get industry pattern by name
 */
function getIndustryPattern(industry) {
  return INDUSTRY_PATTERNS[industry] || INDUSTRY_PATTERNS.technology; // Default fallback
}

/**
 * Get all available industries
 */
function getAvailableIndustries() {
  return Object.keys(INDUSTRY_PATTERNS);
}

/**
 * Generate industry-specific sections based on page type
 */
function generateIndustrySections(pageSpec, industryPattern) {
  const baseSections = industryPattern.layout.sections;
  const customSections = generateCustomSections(pageSpec.type, pageSpec.industry);
  
  return {
    sections: [...baseSections, ...customSections],
    contentStrategy: buildContentStrategy(pageSpec.industry),
    callsToAction: generateIndustryCTAs(pageSpec.industry)
  };
}

/**
 * Generate custom sections based on page type and industry
 */
function generateCustomSections(pageType, industry) {
  const customSections = [];
  
  if (industry === 'healthcare') {
    if (pageType === 'clinic') {
      customSections.push('appointments', 'insurance', 'specialties');
    } else if (pageType === 'wellness') {
      customSections.push('programs', 'nutritionists', 'success-stories');
    }
  } else if (industry === 'fintech') {
    if (pageType === 'investment') {
      customSections.push('portfolio', 'analysis', 'risk-assessment');
    } else if (pageType === 'banking') {
      customSections.push('accounts', 'loans', 'security');
    }
  } else if (industry === 'ecommerce') {
    if (pageType === 'marketplace') {
      customSections.push('categories', 'sellers', 'marketplace-features');
    } else if (pageType === 'store') {
      customSections.push('catalog', 'shipping', 'returns');
    }
  } else if (industry === 'education') {
    if (pageType === 'course') {
      customSections.push('curriculum', 'prerequisites', 'certification');
    } else if (pageType === 'school') {
      customSections.push('programs', 'faculty', 'admissions');
    }
  } else if (industry === 'realestate') {
    if (pageType === 'agency') {
      customSections.push('listings', 'market-analysis', 'financing');
    } else if (pageType === 'property') {
      customSections.push('gallery', 'neighborhood', 'mortgage-calculator');
    }
  }
  
  return customSections;
}

/**
 * Build content strategy for industry
 */
function buildContentStrategy(industry) {
  const strategies = {
    healthcare: {
      tone: 'reassuring and professional',
      focus: 'trust and expertise',
      messaging: 'patient-centered care and medical excellence'
    },
    fintech: {
      tone: 'confident and data-driven',
      focus: 'security and innovation',
      messaging: 'financial empowerment and technological advancement'
    },
    ecommerce: {
      tone: 'engaging and persuasive',
      focus: 'products and value',
      messaging: 'quality products and customer satisfaction'
    },
    technology: {
      tone: 'innovative and technical',
      focus: 'capabilities and solutions',
      messaging: 'cutting-edge technology and developer experience'
    },
    education: {
      tone: 'inspiring and supportive',
      focus: 'learning and growth',
      messaging: 'knowledge empowerment and personal development'
    },
    realestate: {
      tone: 'professional and trustworthy',
      focus: 'properties and expertise',
      messaging: 'dream homes and investment opportunities'
    }
  };
  
  return strategies[industry] || strategies.technology;
}

/**
 * Generate industry-specific call-to-action buttons
 */
function generateIndustryCTAs(industry) {
  const ctas = {
    healthcare: [
      'Schedule Appointment',
      'Learn More About Our Services',
      'Contact Our Medical Team',
      'View Insurance Options'
    ],
    fintech: [
      'Start Free Trial',
      'Request Demo',
      'View Pricing',
      'Get API Access'
    ],
    ecommerce: [
      'Shop Now',
      'Add to Cart',
      'View Products',
      'Check Out'
    ],
    technology: [
      'Try It Free',
      'View Documentation',
      'Download Now',
      'Get Started'
    ],
    education: [
      'Enroll Now',
      'Learn More',
      'View Courses',
      'Start Learning'
    ],
    realestate: [
      'View Properties',
      'Schedule Viewing',
      'Contact Agent',
      'Get Market Analysis'
    ]
  };
  
  return ctas[industry] || ctas.technology;
}

/**
 * Get industry-specific color palette
 */
function getIndustryColors(industry) {
  const pattern = getIndustryPattern(industry);
  return {
    primary: pattern.colors.primary[0],
    secondary: pattern.colors.primary[1] || pattern.colors.secondary[0],
    accent: pattern.colors.secondary[0] || pattern.colors.primary[2],
    neutrals: pattern.colors.neutrals
  };
}

/**
 * Get industry-specific typography
 */
function getIndustryTypography(industry) {
  const pattern = getIndustryPattern(industry);
  return pattern.typography;
}

module.exports = {
  INDUSTRY_PATTERNS,
  getIndustryPattern,
  getAvailableIndustries,
  generateIndustrySections,
  generateCustomSections,
  buildContentStrategy,
  generateIndustryCTAs,
  getIndustryColors,
  getIndustryTypography
};
