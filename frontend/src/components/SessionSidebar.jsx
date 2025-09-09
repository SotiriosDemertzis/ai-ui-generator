/**
 * @file frontend/src/components/SessionSidebar.jsx
 * @description This component renders the sidebar for managing design sessions.
 * It displays a list of all available sessions, allows users to select a session to view its history, and provides options to create new sessions or delete existing ones.
 * The sidebar is designed to be intuitive and easy to navigate, providing quick access to different design projects.
 * It also includes visual cues for the currently selected session and a confirmation step for deleting sessions.
 */
import React, { useState } from 'react';

const SessionSidebar = ({ 
  sessions = [], 
  currentSession, 
  onSessionSelect, 
  onSessionDelete, 
  onNewSessionClick,
  width,
  onWidthChange,
  isHidden,
  onToggleSidebar
}) => {
  const handleDeleteClick = (e, session) => {
    e.stopPropagation(); // Prevent session selection when clicking delete
    onSessionDelete(session);
  };
  // If sidebar is hidden, render nothing
  if (isHidden) {
    return null;
  }

  return (
    <div 
      className="bg-white/70 backdrop-blur-sm border-r border-slate-200/60 flex flex-col shadow-lg"
      style={{ 
        width: `${width}px`,
        willChange: 'width',
        transition: 'none'
      }}
    >
      {/* Header with Sessions title and controls */}
      <div className="p-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-800">Sessions</h2>
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Hide sidebar"
          >
            ←
          </button>
        </div>
        
        {/* New Session Button */}
        <button
          onClick={onNewSessionClick}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
        >
          <span>✨</span>
          <span>New Session</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2">
        {!sessions || sessions.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            <div className="text-4xl mb-2">💭</div>
            <p className="text-sm">No sessions yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.filter(session => session && session.id).map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentSession?.id === session.id
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
                onClick={() => onSessionSelect(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate mb-1">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteClick(e, session)}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-slate-400 hover:text-red-500 transition-all duration-200"
                    title="Delete session"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSidebar;