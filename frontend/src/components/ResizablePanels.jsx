/**
 * @file frontend/src/components/ResizablePanels.jsx
 * @description This component provides resizable panels for the dashboard layout.
 * It allows users to adjust the width of the sidebar and the chat interface, providing a flexible and customizable workspace.
 * The component uses mouse events to handle resizing and updates the width of the panels accordingly.
 * It also includes visual feedback during resizing, such as changing the background color of the resize handles.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';

const ResizablePanels = ({ 
  sidebarWidth, 
  chatWidth, 
  onSidebarResize, 
  onChatResize, 
  children 
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isChatResizing, setIsChatResizing] = useState(false);
  
  // Performance optimization refs
  const containerRef = useRef(null);
  const rafId = useRef(null);
  const lastUpdateTime = useRef(0);

  // Smooth update function using requestAnimationFrame without throttling delay
  const smoothUpdate = useCallback((updateFn) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    rafId.current = requestAnimationFrame(() => {
      updateFn();
    });
  }, []);

  // Sidebar resize handlers
  const handleSidebarMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    // Cache container reference for performance
    containerRef.current = document.querySelector('[class*="h-screen"]') || document.body;
  }, []);

  const handleSidebarMouseMove = useCallback((e) => {
    if (!isResizing) return;
    
    // Use percentage-based calculation like the smooth chat resizer
    smoothUpdate(() => {
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const mousePosition = e.clientX - containerRect.left;
      
      // Calculate as percentage of container width (like chat resizer)
      const widthPercentage = Math.max(15, Math.min(40, (mousePosition / containerRect.width) * 100));
      
      // Convert percentage to pixels for the sidebar
      const newWidth = Math.round((widthPercentage / 100) * containerRect.width);
      onSidebarResize(newWidth);
    });
  }, [isResizing, onSidebarResize, smoothUpdate]);

  const handleSidebarMouseUp = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsResizing(false);
    
    // Clean up RAF - EXACT same as working right resizer
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  // Chat resize handlers
  const handleChatMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsChatResizing(true);
    
    // Cache container reference and initial calculations for performance
    containerRef.current = document.querySelector('[class*="h-screen"]') || document.body;
  }, []);

  const handleChatMouseMove = useCallback((e) => {
    if (!isChatResizing) return;
    
    // Use smooth update for responsive performance
    smoothUpdate(() => {
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const availableWidth = containerRect.width - sidebarWidth;
      const mousePosition = e.clientX - containerRect.left - sidebarWidth;
      
      // Calculate percentage with proper bounds
      const newChatWidth = Math.max(20, Math.min(80, (mousePosition / availableWidth) * 100));
      onChatResize(newChatWidth);
    });
  }, [isChatResizing, sidebarWidth, onChatResize, smoothUpdate]);

  const handleChatMouseUp = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsChatResizing(false);
    
    // Clean up RAF
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleSidebarMouseMove);
      document.addEventListener('mouseup', handleSidebarMouseUp);
      document.addEventListener('mouseleave', handleSidebarMouseUp); // Stop resizing when mouse leaves window
    }
    
    return () => {
      document.removeEventListener('mousemove', handleSidebarMouseMove);
      document.removeEventListener('mouseup', handleSidebarMouseUp);
      document.removeEventListener('mouseleave', handleSidebarMouseUp);
    };
  }, [isResizing, handleSidebarMouseMove, handleSidebarMouseUp]);

  useEffect(() => {
    if (isChatResizing) {
      document.addEventListener('mousemove', handleChatMouseMove);
      document.addEventListener('mouseup', handleChatMouseUp);
      document.addEventListener('mouseleave', handleChatMouseUp); // Stop resizing when mouse leaves window
    }
    
    return () => {
      document.removeEventListener('mousemove', handleChatMouseMove);
      document.removeEventListener('mouseup', handleChatMouseUp);
      document.removeEventListener('mouseleave', handleChatMouseUp);
    };
  }, [isChatResizing, handleChatMouseMove, handleChatMouseUp]);

  // Stop resizing when sidebar becomes hidden
  useEffect(() => {
    if (sidebarWidth === 0 && isResizing) {
      setIsResizing(false);
    }
  }, [sidebarWidth, isResizing]);

  // Apply user-select to body during resizing
  React.useEffect(() => {
    if (isResizing || isChatResizing) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.body.style.userSelect = '';
    };
  }, [isResizing, isChatResizing]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <>
      {/* Sidebar */}
      {children[0]}
      
      {/* Sidebar Resize Handle - only show when sidebar is visible */}
      {sidebarWidth > 0 && (
        <div
          className={`w-1 bg-slate-200/60 hover:bg-blue-300 cursor-col-resize flex-shrink-0 transition-colors duration-200 ${
            isResizing ? 'bg-blue-400' : ''
          }`}
          onMouseDown={handleSidebarMouseDown}
          style={{ 
            backgroundImage: isResizing ? 'none' : 'radial-gradient(circle, rgba(148, 163, 184, 0.6) 1px, transparent 1px)',
            backgroundSize: '4px 8px',
            backgroundPosition: 'center',
            userSelect: 'none'
          }}
        />
      )}

      {/* Chat/Welcome Interface */}
      {children[1]}
      
      {/* Chat-Preview Resize Handle */}
      <div
        className={`w-1 bg-slate-200/60 hover:bg-blue-300 cursor-col-resize flex-shrink-0 transition-colors duration-200 ${
          isChatResizing ? 'bg-blue-400' : ''
        }`}
        onMouseDown={handleChatMouseDown}
        style={{ 
          backgroundImage: isChatResizing ? 'none' : 'radial-gradient(circle, rgba(148, 163, 184, 0.6) 1px, transparent 1px)',
          backgroundSize: '4px 8px',
          backgroundPosition: 'center',
          userSelect: 'none'
        }}
      />
      
      {/* Preview Panel */}
      {children[2]}
    </>
  );
};

export default ResizablePanels;