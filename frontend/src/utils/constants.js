/**
 * @file frontend/src/utils/constants.js
 * @description This file centralizes all constants used throughout the frontend application.
 * It includes API URLs, route paths, local storage keys, UI generation timeouts, example prompts, and error messages.
 * By defining these values as constants, the application becomes more maintainable, readable, and less prone to errors caused by magic strings or numbers.
 */

export const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Defines the main routes for the application.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
};

/**
 * Defines the keys used for storing data in local storage.
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CURRENT_SESSION: 'currentSession',
};

/**
 * Defines the timeout duration for UI generation requests in milliseconds.
 */
export const UI_GENERATION_TIMEOUT = 30000; // 30 seconds

/**
 * Provides a list of example prompts for UI generation, useful for demonstration or quick starts.
 */
export const EXAMPLE_PROMPTS = [
  'Create a modern SaaS login form with email/password authentication, social login options, and forgot password link. Use a clean, professional design with subtle gradients and modern card layout.',
  'Build a premium pricing card component for a SaaS platform featuring 3 tiers (Basic, Pro, Enterprise), highlighting the middle tier, with feature lists and CTA buttons.',
  'Design a comprehensive dashboard sidebar navigation for a business application with user profile, main menu items, settings, and logout. Include active states and smooth hover animations.',
  'Create a compelling hero section for a tech startup landing page with attention-grabbing headline, value proposition, email signup form, and background image or gradient.',
  'Build a product card for an e-commerce platform with high-quality product image, title, price, rating stars, and add-to-cart button. Include hover effects and mobile-responsive design.',
  'Design a professional contact form for a business website with name, email, subject, message fields, validation feedback, and success/error states.',
  'Create a comprehensive analytics dashboard with key metrics cards, charts placeholder areas, data tables, and filters. Use a clean, data-focused design.',
  'Build a detailed user profile page with avatar upload, personal information form, account settings, and activity history sections.',
];

/**
 * Provides a list of example iterative refinement prompts, useful for demonstrating how to refine generated components.
 */
export const ITERATION_EXAMPLES = [
  'Enhance with modern design elements: increase border radius to rounded-xl, add subtle shadow-lg, and implement smooth hover transitions with transform scale effects.',
  'Update color scheme from blue to emerald green palette (emerald-500, emerald-600, emerald-50 backgrounds) while maintaining professional contrast ratios.',
  'Add sophisticated micro-interactions: button hover animations, smooth fade-in effects for content, and subtle bounce animations for important elements.',
  'Optimize for mobile-first design: reduce padding on small screens, stack elements vertically, increase touch target sizes to 44px minimum.',
  'Implement comprehensive dark mode support with dark: prefixes, appropriate color inversions, and toggle functionality for theme switching.',
  'Add comprehensive loading states with skeleton screens, spinner animations, and error boundaries with retry mechanisms and user-friendly messages.',
  'Enhance call-to-action buttons: increase size to px-8 py-4, add gradient backgrounds, implement focus states, and include subtle icon additions.',
  'Improve information hierarchy with strategic iconography: add relevant Unicode symbols or simple SVG shapes to section headers and key actions.',
];

/**
 * Defines common error messages used throughout the application for consistent user feedback.
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please login again.',
  GENERATION_FAILED: 'Failed to generate UI. Please try again.',
  SESSION_LOAD_FAILED: 'Failed to load session.',
  EXPORT_FAILED: 'Failed to export components.',
};