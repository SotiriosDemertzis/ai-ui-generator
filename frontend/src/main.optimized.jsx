/**
 * @file main.optimized.jsx
 * @description Performance-optimized entry point for the React application
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Performance utilities
import { 
  mark, 
  measure, 
  addResourceHints, 
  registerServiceWorker,
  logMemoryUsage 
} from './utils/performance.js';

// Mark app initialization start
mark('app-init-start');

// Add resource hints for better loading performance
addResourceHints();

// Create optimized root with concurrent features
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container, {
  // Enable concurrent features for better performance
  unstable_concurrentUpdatesByDefault: true
});

// Mark React render start
mark('react-render-start');

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Measure initial render performance
  setTimeout(() => {
    mark('react-render-end');
    measure('React Render Time', 'react-render-start', 'react-render-end');
    measure('Total App Init Time', 'app-init-start', 'react-render-end');
    
    // Log memory usage
    logMemoryUsage();
    
    // Log Core Web Vitals when available
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, 100);
}

// Register service worker for production
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker();
}

// Preload critical routes
const preloadRoutes = () => {
  // Preload components that are likely to be used
  import('./components/EnhancedDashboard.jsx');
};

// Preload after initial render
setTimeout(preloadRoutes, 1000);