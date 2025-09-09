/**
 * @file performance.js
 * @description Frontend performance monitoring and optimization utilities
 */

// Measure component render performance
export const measureRender = (componentName, renderFn) => {
  const start = performance.now();
  const result = renderFn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 ${componentName} render time: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
};

// Debounce function for search and input optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll and resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading observer for images and components
export const createLazyObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };
  
  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Memory usage monitoring
export const logMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = performance.memory;
    console.log('📊 Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`
    });
  }
};

// Bundle size analysis (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // Log component counts and estimated sizes
    const componentCount = document.querySelectorAll('[data-component]').length;
    const domNodes = document.querySelectorAll('*').length;
    
    console.log('📦 Bundle Analysis:', {
      components: componentCount,
      domNodes,
      timestamp: new Date().toISOString()
    });
  }
};

// Performance mark utilities
export const mark = (name) => {
  if ('mark' in performance) {
    performance.mark(name);
  }
};

export const measure = (name, startMark, endMark) => {
  if ('measure' in performance) {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
    }
    return measure.duration;
  }
  return 0;
};

// Preload critical resources
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Optimize images with lazy loading
export const createOptimizedImage = (src, alt, className = '') => {
  return {
    src,
    alt,
    className: `${className} transition-opacity duration-300`,
    loading: 'lazy',
    decoding: 'async'
  };
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
};

// Critical resource hints
export const addResourceHints = () => {
  // DNS prefetch for external resources
  const dnsPrefetch = (hostname) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${hostname}`;
    document.head.appendChild(link);
  };
  
  // Prefetch common external resources
  dnsPrefetch('cdn.tailwindcss.com');
  dnsPrefetch('unpkg.com');
  
  // Preconnect to API
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = window.location.origin;
  document.head.appendChild(preconnect);
};