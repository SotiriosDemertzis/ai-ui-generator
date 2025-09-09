/**
 * @file lib/utils.js
 * @description Utility functions for the multi-agent system
 */

const clsx = require('clsx');
const { twMerge } = require('tailwind-merge');

/**
 * Combine and merge Tailwind CSS classes
 * @param {...any} inputs - Class names or conditional objects
 * @returns {string} Merged class string
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

module.exports = { cn };