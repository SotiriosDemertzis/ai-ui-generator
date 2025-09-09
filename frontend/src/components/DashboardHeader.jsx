/**
 * @file frontend/src/components/DashboardHeader.jsx
 * @description This component renders the header for the main dashboard.
 * It displays the application title, the name of the current session, navigation links, and a logout button.
 * The header is designed to be clean and unobtrusive, providing essential information and functionality without cluttering the user interface.
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardHeader = ({ 
  currentSession, 
  onLogout,
  sidebarHidden,
  onShowSidebar
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  
  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - App title and session info + Show button when sidebar hidden */}
        <div className="flex items-center space-x-6">
          {/* Show Sidebar Button when hidden */}
          {sidebarHidden && isDashboardPage && (
            <button
              onClick={onShowSidebar}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center space-x-2"
              title="Show sessions"
            >
              <span>→</span>
              <span className="text-sm">Sessions</span>
            </button>
          )}
          
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Prompt 2 Design
            </h1>
            {currentSession && isDashboardPage && (
              <p className="text-sm text-slate-600 mt-1">
                📁 {currentSession.title}
              </p>
            )}
          </div>

        </div>

        {/* Right side - Logout */}
        <button
          onClick={onLogout}
          className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:from-slate-200 hover:to-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          👋 Logout
        </button>
      </div>

    </div>
  );
};

export default DashboardHeader;