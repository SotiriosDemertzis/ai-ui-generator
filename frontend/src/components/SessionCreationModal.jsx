/**
 * @file frontend/src/components/SessionCreationModal.jsx
 * @description This component provides a modal interface for creating new design sessions.
 * It allows users to enter a title for their new session, which helps in organizing their AI-generated UI components.
 * The modal includes input validation, loading indicators, and keyboard shortcuts for a smooth user experience.
 * It is designed to be a clear and intuitive way for users to start new design projects within the application.
 */
import React from 'react';

const SessionCreationModal = ({ 
  show, 
  title, 
  onTitleChange, 
  onCreate, 
  onCancel, 
  loading 
}) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && !loading) {
      onCreate();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>✨</span>
            Create New Session
          </h3>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-600 text-2xl">🎨</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Start a New Design Session
              </h4>
              <p className="text-gray-600 mb-4">
                Give your session a memorable name to organize your AI-generated components
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="session-title" className="block text-sm font-medium text-gray-700 mb-2">
                Session Title
              </label>
              <input
                id="session-title"
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Dashboard Components, Login Forms, Product Cards..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-sm text-emerald-700">
                <strong>💡 Tips:</strong> Use descriptive names like "E-commerce Checkout Flow" or "Mobile App Navigation" to easily find your sessions later.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>↩️</span>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Create Session</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">Enter</kbd> to create • <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">Esc</kbd> to cancel
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionCreationModal;