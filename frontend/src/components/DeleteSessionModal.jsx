/**
 * @file frontend/src/components/DeleteSessionModal.jsx
 * @description This component provides a confirmation modal for deleting a session.
 * It displays a warning message to the user, making it clear that the action is irreversible.
 * The modal is designed to prevent accidental deletions by requiring the user to explicitly confirm their choice.
 * It also provides clear visual feedback during the deletion process, such as a loading indicator.
 */
import React from 'react';

const DeleteSessionModal = ({ 
  show, 
  session, 
  onConfirm, 
  onCancel, 
  loading 
}) => {
  if (!show || !session) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      onConfirm();
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
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🗑️</span>
            Delete Session
          </h3>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Are you sure?
              </h4>
              <p className="text-gray-600 mb-4">
                You're about to delete the session:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <p className="font-medium text-gray-900">"{session.title}"</p>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(session.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> This action cannot be undone. All chat history and generated components in this session will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>↩️</span>
              <span>Cancel</span>
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <span>🗑️</span>
                  <span>Delete Session</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">Enter</kbd> to delete • <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">Esc</kbd> to cancel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSessionModal;