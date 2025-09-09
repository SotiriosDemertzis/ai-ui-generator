/**
 * @file frontend/src/components/EnhancedDashboard.jsx
 * @description This is the main component for the application's dashboard.
 * It orchestrates the entire user interface, bringing together various sub-components to create a seamless and interactive experience.
 * The component manages the application's core state, including sessions, messages, and the currently displayed JSX code.
 * It also handles all business logic, such as fetching data from the API, creating and deleting sessions, and submitting prompts for UI generation.
 * The dashboard is designed with a responsive and resizable layout, allowing users to customize their workspace.
 * It also includes modals for creating and deleting sessions, as well as advanced prompt builders for more complex UI generation tasks.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sessionAPI, pagesAPI } from '../utils/api';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';
import { processComponentForDownload } from '../utils/componentProcessor';

// Import modular components
import SessionSidebar from './SessionSidebar';
import DashboardHeader from './DashboardHeader';
import ChatInterface from './ChatInterface';
import PreviewPanel from './PreviewPanel';
import ResizablePanels from './ResizablePanels';
import DeleteSessionModal from './DeleteSessionModal';
import SessionCreationModal from './SessionCreationModal';
import WelcomeScreen from './WelcomeScreen';
import AdvancedPromptBuilder from './AdvancedPromptBuilder';
import ExpertDesignBuilder from './ExpertDesignBuilder';
import IterativeRefinement from './IterativeRefinement';


const EnhancedDashboard = ({ setIsAuthenticated }) => {
  // Core business logic state
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentJSX, setCurrentJSX] = useState('');
  const [previewFiles, setPreviewFiles] = useState(null);
  const [previewMainFile, setPreviewMainFile] = useState(null);
  const [loading, setLoading] = useState(false); // For component generation
  const [isGeneratingComponent, setIsGeneratingComponent] = useState(false); // Clearer name for component generation
  // Track which sessions have an in-flight generation so we can restore UI when switching back
  const loadingSessionsRef = useRef(new Set());
  const [sessionCreationLoading, setSessionCreationLoading] = useState(false);
  const [sessionDeletionLoading, setSessionDeletionLoading] = useState(false);
  const [sessionDataLoading, setSessionDataLoading] = useState(false);

  // UI state for child components
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [chatWidth, setChatWidth] = useState(50);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  
  // Advanced prompt builder state
  const [showAdvancedBuilder, setShowAdvancedBuilder] = useState(false);
  const [showExpertBuilder, setShowExpertBuilder] = useState(false);
  const [showRefinement, setShowRefinement] = useState(false);
  
  // Refs to prevent double session creation in StrictMode
  const isCreatingSession = useRef(false);
  const isCreatingGuidedSession = useRef(false);
  const isCreatingAdvancedSession = useRef(false);
  const isCreatingExpertSession = useRef(false);
  // Keep a pending user message per session to restore UX on session switch
  const pendingUserPromptsRef = useRef({});
  const PENDING_PROMPTS_STORAGE_KEY = 'PENDING_PROMPTS';

  const persistPendingPrompt = useCallback((sessionId, text) => {
    try {
      const store = JSON.parse(localStorage.getItem(PENDING_PROMPTS_STORAGE_KEY) || '{}');
      store[String(sessionId)] = text;
      localStorage.setItem(PENDING_PROMPTS_STORAGE_KEY, JSON.stringify(store));
    } catch (_) {}
  }, []);

  const readPendingPrompt = useCallback((sessionId) => {
    try {
      const store = JSON.parse(localStorage.getItem(PENDING_PROMPTS_STORAGE_KEY) || '{}');
      return store[String(sessionId)] || null;
    } catch (_) { return null; }
  }, []);

  const clearPendingPrompt = useCallback((sessionId) => {
    try {
      const store = JSON.parse(localStorage.getItem(PENDING_PROMPTS_STORAGE_KEY) || '{}');
      delete store[String(sessionId)];
      localStorage.setItem(PENDING_PROMPTS_STORAGE_KEY, JSON.stringify(store));
    } catch (_) {}
  }, []);

  // Load sessions on mount
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchSessions();
      
      try {
        const savedSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
        if (savedSession) {
          const session = JSON.parse(savedSession);
          setCurrentSession(session);
          // Load messages immediately for the saved session
          await loadSessionMessages(session.id);
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      }
    };
    
    loadInitialData();
  }, []);

  // Auto-select most recent session if none is selected
  useEffect(() => {
    if (!currentSession && sessions.length > 0) {
      const mostRecentSession = sessions[0]; // Sessions should be sorted by date
      setCurrentSession(mostRecentSession);
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(mostRecentSession));
    }
  }, [sessions, currentSession]);

  // Load messages when session changes - Fix: Add proper dependencies and prevent infinite loops
  useEffect(() => {
    if (currentSession) {
      console.log('🔄 [Dashboard] useEffect: Session changed to:', currentSession.id, currentSession.title);
      // Load messages for the new session
      loadSessionMessages(currentSession.id);
      // Only set generation loading if this session actually has an in-flight generation with a pending prompt
      const hasPendingPrompt = pendingUserPromptsRef.current[currentSession.id] || readPendingPrompt(currentSession.id);
      const hasInFlightGeneration = loadingSessionsRef.current.has(currentSession.id);
      setIsGeneratingComponent(hasInFlightGeneration && hasPendingPrompt);
      setLoading(hasInFlightGeneration && hasPendingPrompt);
    } else {
      console.log('🔄 [Dashboard] useEffect: No session selected, clearing data');
      setMessages([]);
      setCurrentJSX('');
      setLoading(false);
      setIsGeneratingComponent(false);
    }
  }, [currentSession?.id]); // Fix: Use currentSession.id instead of entire object

  // Business logic functions
  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getAll();
      const rawSessions = Array.isArray(response.data) ? response.data : (response.data.sessions || []);
      const sessionsArray = rawSessions.filter(session => session && session.id);
      setSessions(sessionsArray);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const loadSessionMessages = useCallback(async (sessionId) => {
    try {
      console.log('📖 [Dashboard] Loading messages for session:', sessionId);
      
      // Set loading state for data fetching (not generation loading)
      setSessionDataLoading(true);
      
      // Fetch pages associated with the session
      const response = await pagesAPI.getPagesBySessionId(sessionId);

      // The backend /api/pages endpoint returns an array of pages
      let pages = response.data.pages || response.data || [];

      // Ensure newest first ordering (by createdAt or id)
      try {
        pages = [...pages].sort((a, b) => {
          const aTime = new Date(a.createdAt || a.created_at || 0).getTime();
          const bTime = new Date(b.createdAt || b.created_at || 0).getTime();
          if (aTime && bTime) return bTime - aTime;
          // Fallback to id desc
          return (b.id || 0) - (a.id || 0);
        });
      } catch (_) {}

      console.log('📄 [Dashboard] Found pages for session:', sessionId, 'count:', pages.length);
      if (pages.length > 0) {
        console.log('📄 [Dashboard] Sample page data:', pages[0]);
      } else {
        console.warn('⚠️ [Dashboard] No pages found for session:', sessionId);
      }

      let loadedMessages = pages.map(page => {
        // Try to get component code from multiple sources
        const componentCode = page.finalCode || 
          (page.result && typeof page.result === 'string' ? JSON.parse(page.result).reactCode : null) ||
          (page.result && page.result.reactCode) || '';
        // Normalize reviewResult to object if it's a JSON string
        let reviewResult = page.reviewResult;
        try {
          if (typeof reviewResult === 'string' && reviewResult.trim().startsWith('{')) {
            reviewResult = JSON.parse(reviewResult);
          }
        } catch (_) {}
        
        return [
          { type: 'user', content: page.userPrompt, timestamp: page.createdAt ? new Date(page.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString() },
          { type: 'ai', content: reviewResult?.decision || 'Component generated successfully', jsxCode: componentCode, timestamp: page.createdAt ? new Date(page.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString() }
        ];
      }).flat();

      // Ensure no stale loading placeholders
      loadedMessages = loadedMessages.filter(m => !m.isGenerating);

      // If we have a pending user prompt for this session, append a synthetic user message
      // Always append as a distinct pending message to avoid content-based de-duplication
      const pendingPrompt = pendingUserPromptsRef.current[sessionId] || readPendingPrompt(sessionId);
      if (pendingPrompt) {
        // Remove any existing synthetic pending user placeholder
        loadedMessages = loadedMessages.filter(m => !(m.type === 'user' && m.isPendingUser));

        loadedMessages = [
          ...loadedMessages,
          { type: 'user', content: pendingPrompt, id: `pending-user-${sessionId}` , isPendingUser: true, timestamp: new Date().toLocaleTimeString() }
        ];
      }

      console.log('💬 [Dashboard] Setting messages for session:', sessionId, 'message count:', loadedMessages.length);
      // If this session has an in-flight generation AND has a pending prompt, append a synthetic loading message
      if (loadingSessionsRef.current.has(sessionId) && pendingPrompt) {
        const hasLoading = loadedMessages.some(m => m.isGenerating);
        if (!hasLoading) {
          const pendingIndex = loadedMessages.findIndex(m => m.isPendingUser);
          const loadingMsg = { type: 'ai', content: 'Generating your component', isGenerating: true, id: `loading-${sessionId}`, timestamp: new Date().toLocaleTimeString() };
          if (pendingIndex >= 0) {
            // Insert right after the pending user message
            loadedMessages = [
              ...loadedMessages.slice(0, pendingIndex + 1),
              loadingMsg,
              ...loadedMessages.slice(pendingIndex + 1)
            ];
          } else {
            loadedMessages = [
              ...loadedMessages,
              loadingMsg
            ];
          }
        }
      }

      setMessages(loadedMessages);

      // Set the latest JSX code if available (pages are ordered newest first, so take index 0)
      const latestPage = pages[0]; // Get the newest page
      const latestCode = latestPage?.finalCode || 
        (latestPage?.result && typeof latestPage.result === 'string' ? JSON.parse(latestPage.result).reactCode : null) ||
        (latestPage?.result && latestPage.result.reactCode) || '';
        
      console.log('📦 [Dashboard] Loading existing session JSX:', {
        sessionId,
        hasLatestPage: !!latestPage,
        hasLatestCode: !!latestCode,
        latestCodeLength: latestCode?.length || 0,
        latestCodePreview: latestCode ? latestCode.substring(0, 100) + '...' : 'None'
      });
        
      if (latestCode) {
        console.log('📦 [Dashboard] Setting latest component code for session:', sessionId, 'length:', latestCode.length);
        setCurrentJSX(latestCode);
      } else {
        console.log('📦 [Dashboard] No component code found for session:', sessionId);
      }

      // Also set multi-file preview if available on the latest page
      try {
        let filesManifest = latestPage?.filesManifest || latestPage?.files_manifest || latestPage?.files || null;
        const mainFile = latestPage?.mainFile || latestPage?.main_file || null;
        // Parse stringified manifest if necessary
        if (filesManifest && typeof filesManifest === 'string') {
          try { filesManifest = JSON.parse(filesManifest); } catch (_) { /* keep as is */ }
        }
        if (filesManifest && typeof filesManifest === 'object' && Object.keys(filesManifest).length > 0) {
          setPreviewFiles(filesManifest);
          setPreviewMainFile(mainFile || Object.keys(filesManifest)[0]);
        } else {
          setPreviewFiles(null);
          setPreviewMainFile(null);
        }
      } catch (e) {
        console.warn('⚠️ [Dashboard] Error applying files manifest from latest page:', e);
        setPreviewFiles(null);
        setPreviewMainFile(null);
      }
      
    } catch (error) {
      console.error('❌ [Dashboard] Error loading session messages/pages:', error);
    } finally {
      setSessionDataLoading(false);
    }
  }, []); // Add useCallback dependency array

  const createNewSession = async () => {
    if (!newSessionTitle.trim() || sessionCreationLoading || isCreatingSession.current) return;

    isCreatingSession.current = true;
    setSessionCreationLoading(true);
    try {
      const response = await sessionAPI.create({ title: newSessionTitle.trim() });
      const newSession = response.data.session || response.data;
      
      if (newSession && newSession.id) {
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        setCurrentJSX(''); // Clear preview for new session
        setMessages([]); // Clear messages for new session
      }
      
      setShowCreateSession(false);
      setNewSessionTitle('');
      
      setTimeout(() => {
        setSessionCreationLoading(false);
        isCreatingSession.current = false;
      }, 500);
    } catch (error) {
      console.error('Error creating session:', error);
      setSessionCreationLoading(false);
      isCreatingSession.current = false;
    }
  };

  const loadSession = async (session) => {
    console.log('🔄 [Dashboard] Loading session:', session?.id, session?.title);
    
    // Clear previous session's data immediately
    setMessages([]);
    setCurrentJSX('');
    setPreviewFiles(null);
    setPreviewMainFile(null);
    
    // Clear loading states for session switch - important to prevent "Generating" message persisting
    setLoading(false);
    setIsGeneratingComponent(false);
    
    // Also clear any stale loading references for sessions that don't actually have pending prompts
    if (session?.id && !readPendingPrompt(session.id)) {
      loadingSessionsRef.current.delete(session.id);
    }
    
    // Set new session (this will trigger the useEffect to load new session's messages)
    setCurrentSession(session);
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  };

  const handleDeleteSession = (session) => {
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete || sessionDeletionLoading) return;

    setSessionDeletionLoading(true);
    
    try {
      await sessionAPI.delete(sessionToDelete.id);
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));
      
      if (currentSession?.id === sessionToDelete.id) {
        setCurrentSession(null);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      }
      
      setShowDeleteModal(false);
      setSessionToDelete(null);
      setSessionDeletionLoading(false);
    } catch (error) {
      console.error('Error deleting session:', error);
      setSessionDeletionLoading(false);
    }
  };

  const cancelDeleteSession = () => {
    setShowDeleteModal(false);
    setSessionToDelete(null);
  };

  const handleSubmit = async (e, guidedPrompt = null, sessionOverride = null, expertBrief = null, isAdvancedBuilder = false, userDisplayPrompt = null) => {
    if (e) e.preventDefault();

    // Ensure promptToUse is always a string
    let promptToUse = guidedPrompt || prompt;
    
    // Handle case where promptToUse might be an object (from advanced builder)
    if (typeof promptToUse === 'object' && promptToUse !== null) {
      promptToUse = promptToUse.fullPrompt || promptToUse.userSummary || '';
    }
    
    // Ensure promptToUse is a string before calling trim
    if (typeof promptToUse !== 'string' || !promptToUse.trim() || loading) return;

    let sessionToUse = sessionOverride || currentSession;

    // Only create a new session if we have guidedPrompt but no sessionOverride and no currentSession
    if (guidedPrompt && !sessionOverride && !sessionToUse) {
      if (isCreatingGuidedSession.current || sessionCreationLoading) {
        console.log('⚠️ Guided session creation already in progress, skipping');
        return;
      }
      
      try {
        isCreatingGuidedSession.current = true;
        setSessionCreationLoading(true);
        
        console.log('🏗️ Creating guided design session...');
        
        const response = await sessionAPI.create({ 
          title: 'Guided Design' 
        });
        const newSession = response.data.session || response.data;
        if (newSession?.id) {
          console.log('✅ Guided session created:', newSession.id);
          setSessions(prev => [newSession, ...prev]);
          setCurrentSession(newSession);
          localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(newSession));
          sessionToUse = newSession;
        }
        
        setTimeout(() => {
          setSessionCreationLoading(false);
        }, 300);
        
        setTimeout(() => {
          isCreatingGuidedSession.current = false;
          console.log('🔓 Guided session creation lock released');
        }, 1000);
      } catch (error) {
        console.error('❌ Error creating session for guided mode:', error);
        setSessionCreationLoading(false);
        isCreatingGuidedSession.current = false;
        return;
      }
    } else if (!currentSession && !guidedPrompt) {
      console.warn('Please create or select a session first');
      return;
    }

    // Use userDisplayPrompt for chat display if provided (for advanced/expert modes)
    const displayPrompt = userDisplayPrompt || promptToUse;
    setMessages(prev => [...prev, { type: 'user', content: displayPrompt, timestamp: new Date().toLocaleTimeString() }]);
    if (!guidedPrompt) setPrompt('');

    // Mark this session as generating (persist across route switches)
    if (sessionToUse?.id) {
      loadingSessionsRef.current.add(sessionToUse.id);
      // Record pending user message for this session
      pendingUserPromptsRef.current[sessionToUse.id] = displayPrompt;
      persistPendingPrompt(sessionToUse.id, displayPrompt);
    }
    setLoading(true);
    setIsGeneratingComponent(true);
    
    // Add loading message to chat
    const loadingMessage = { 
      type: 'ai', 
      content: 'Generating your component',
      isGenerating: true,
      id: Date.now(), // Unique ID to remove later
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Use our enhanced prompt engineering system
      console.log('🚀 Using enhanced prompt engineering system...');
      
      // Prepare request data
      const requestData = { 
        prompt: promptToUse, 
        sessionId: sessionToUse.id 
      };
      
      // Add expert design brief if provided
      if (expertBrief) {
        requestData.expertBrief = expertBrief;
        requestData.mode = 'expert';
      }
      
      // Add advanced builder customization if provided
      if (isAdvancedBuilder) {
        // Extract customization data from the advanced prompt
        const customization = {
          layout: { type: 'advanced', spacing: 'professional' },
          styling: { theme: 'professional', quality: 'high' },
          components: { advanced: true },
          responsiveness: { mobileFirst: true },
          isAdvancedBuilder: true // Clear flag for backend detection
        };
        requestData.customization = customization;
        requestData.mode = 'advanced'; // Explicit mode flag
      }
      
      console.log('🔍 Request data being sent:', {
        prompt: promptToUse.substring(0, 100) + '...',
        sessionId: sessionToUse.id,
        mode: requestData.mode,
        isAdvancedBuilder: isAdvancedBuilder,
        hasCustomization: !!requestData.customization,
        hasExpertBrief: !!requestData.expertBrief
      });
      
      const response = await pagesAPI.generatePage(requestData);
      
  const { page, metadata, result, success } = response.data;
      
      console.log('🚀 [Frontend] Received API response:', {
        success: success,
        hasResult: !!result,
        hasReactCode: !!result?.reactCode,
        reactCodeLength: result?.reactCode?.length || 0,
        hasFiles: !!result?.files,
        mainFile: result?.mainFile
      });
      
      if (result?.reactCode) {
        console.log('🚀 [Frontend] ReactCode preview:', result.reactCode.substring(0, 200) + '...');
      }
      
  // Support both camelCase (GET responses) and snake_case (POST insert returns)
  const ai_response = page.userPrompt || page.user_prompt; // Or another suitable field from 'page'
      const jsx_code = result.reactCode; // Get reactCode from the 'result' object

      console.log('🔍 [Frontend] Extracted jsx_code:', {
        hasJsxCode: !!jsx_code,
        jsxCodeLength: jsx_code?.length || 0,
        jsxCodePreview: jsx_code ? jsx_code.substring(0, 100) + '...' : 'None'
      });

      // Log essential info only
      console.log('🤖 Full AI Response:', response.data);
      console.log('⚙️ Generation Strategy:', metadata?.strategy || 'N/A');

      // Check if page was actually stored in database
  // no-op

      // For chat display, use ai_response if available, otherwise use jsxCode
      // For component code, always use the cleaned componentCode
      const aiMessage = {
        type: 'ai',
        content: ai_response ||'Component generated successfully',
        jsxCode: jsx_code,
        timestamp: new Date().toLocaleTimeString()
      };

      // Update both messages and JSX only if we're still on the same session
      if (currentSession?.id === sessionToUse.id) {
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => !msg.isGenerating);
          return [...withoutLoading, aiMessage];
        });
        
        // Set JSX after messages to ensure proper order
        console.log('🔍 [Frontend] About to set JSX code for preview:', {
          hasJsxCode: !!jsx_code,
          jsxCodeLength: jsx_code?.length || 0,
          currentSessionId: currentSession?.id,
          sessionToUseId: sessionToUse?.id
        });
        
        if (jsx_code) {
          console.log('✅ [Frontend] Setting currentJSX with code:', jsx_code.substring(0, 100) + '...');
          setCurrentJSX(jsx_code);
        } else {
          console.log('⚠️ [Frontend] No jsx_code available, not setting currentJSX');
        }
        
        // Apply multi-file manifest when provided
        if (result?.files && ((typeof result.files === 'object' && Object.keys(result.files).length > 0) || (typeof result.files === 'string' && result.files.trim().startsWith('{')))) {
          const filesObj = typeof result.files === 'string' ? (() => { try { return JSON.parse(result.files); } catch { return null; } })() : result.files;
          console.log('📁 [Frontend] Setting preview files:', Object.keys(filesObj || {}));
          setPreviewFiles(filesObj);
          setPreviewMainFile(result.mainFile || (filesObj ? Object.keys(filesObj)[0] : null));
        } else {
          console.log('📁 [Frontend] No files in result, clearing preview files');
          setPreviewFiles(null);
          setPreviewMainFile(null);
        }
      }
    } catch (error) {
      console.error('Error generating UI:', error);
      // Only mutate messages for the active session
      if (currentSession?.id === (sessionToUse?.id || currentSession?.id)) {
        // Remove loading message and add error message
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => !msg.isGenerating);
          return [...withoutLoading, {
            type: 'error',
            content: error.response?.data?.error || ERROR_MESSAGES.GENERATION_FAILED,
            timestamp: new Date().toLocaleTimeString()
          }];
        });
      }
    } finally {
      // Clear loading for this session only
      if (sessionToUse?.id) {
        loadingSessionsRef.current.delete(sessionToUse.id);
        delete pendingUserPromptsRef.current[sessionToUse.id];
        clearPendingPrompt(sessionToUse.id);
        if (currentSession?.id === sessionToUse.id) {
          setLoading(false);
          setIsGeneratingComponent(false);
        }
      } else {
        setLoading(false);
        setIsGeneratingComponent(false);
      }
    }
  };

  const cleanupComponentCode = (rawCode) => {
    if (!rawCode) return '';
    
    try {
      // Check if the rawCode is a JSON string containing component metadata
      if (typeof rawCode === 'string' && rawCode.trim().startsWith('{') && rawCode.includes('"component"')) {
        const parsed = JSON.parse(rawCode);
        return parsed.component || rawCode;
      }
      
      // Check if it's already a parsed object with component property
      if (typeof rawCode === 'object' && rawCode.component) {
        return rawCode.component;
      }
      
      // Return as-is if it's already clean component code
      return rawCode;
    } catch (error) {
      console.warn('Error parsing component JSON, using raw code:', error);
      return rawCode;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    setIsAuthenticated(false);
  };

  // Welcome screen handlers
  const handleCreateSessionFromWelcome = () => {
    setShowCreateSession(true);
  };

  const handleExpertBuilderFromWelcome = () => {
    setShowExpertBuilder(true);
  };

  const handleAdvancedPromptGenerate = async (promptData) => {
    // Enhanced protection against duplicate session creation
    if (isCreatingAdvancedSession.current || sessionCreationLoading) {
      console.log('⚠️ Advanced session creation already in progress, skipping');
      return;
    }
    
    // Close the builder immediately to prevent multiple clicks
    setShowAdvancedBuilder(false);
    
    // Handle both old format (string) and new format (object)
    const fullPrompt = typeof promptData === 'string' ? promptData : promptData.fullPrompt;
    const userSummary = typeof promptData === 'string' ? promptData : promptData.userSummary;
    
    // Check if we already have a session - if so, use it instead of creating new one
    if (currentSession?.id) {
      console.log('✅ Using existing session for advanced prompt:', currentSession.id);
      
      // Use existing session directly
      setTimeout(() => {
        handleSubmit(null, fullPrompt, currentSession, null, true, userSummary);
      }, 100);
      return;
    }
    
    // Create a new session only if no current session exists
    try {
      // Set flags immediately to prevent race conditions
      isCreatingAdvancedSession.current = true;
      setSessionCreationLoading(true);
      
      console.log('🏗️ Creating advanced design session (no current session)...');
      
      const response = await sessionAPI.create({ 
        title: 'Advanced Design' 
      });
      const newSession = response.data.session || response.data;
      
      if (newSession?.id) {
        console.log('✅ Advanced session created:', newSession.id);
        
        // Update state atomically
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(newSession));
        
        // Auto-send the advanced prompt with customization flag
        // Use userSummary for chat display, fullPrompt for backend
        setTimeout(() => {
          handleSubmit(null, fullPrompt, newSession, null, true, userSummary);
        }, 200);
      }
      
    } catch (error) {
      console.error('❌ Error creating session for advanced prompt:', error);
    } finally {
      // More conservative cleanup timing
      setTimeout(() => {
        setSessionCreationLoading(false);
      }, 300);
      
      setTimeout(() => {
        isCreatingAdvancedSession.current = false;
        console.log('🔓 Advanced session creation lock released');
      }, 1000); // Longer delay to prevent rapid re-triggering
    }
  };

  const handleRefinementGenerate = async (refinementData) => {
    setShowRefinement(false);
    
    if (!currentSession) {
      console.error('No current session for refinement');
      return;
    }

    // Mark this session as generating for refinement as well
    if (currentSession?.id) {
      loadingSessionsRef.current.add(currentSession.id);
    }
    setLoading(true);
    setIsGeneratingComponent(true);
  setCurrentJSX(''); // Clear current component while processing
  setPreviewFiles(null);
  setPreviewMainFile(null);
    
    // Add user refinement message to chat
    const refinementSummary = refinementData.refinementSelections.join(', ');
    const refinementPrompt = `🔄 Refine component: ${refinementSummary}`;
    setMessages(prev => [...prev, {
      type: 'user',
      content: refinementPrompt,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    try {
      console.log('🔄 Starting user refinement via multi-agent system:', refinementData.refinementSelections);
      
      // Record pending user message for this session
      if (currentSession?.id) {
        pendingUserPromptsRef.current[currentSession.id] = refinementPrompt;
      }

      const response = await pagesAPI.generatePage({
        prompt: `Refine component with user specifications: ${refinementSummary}`,
        sessionId: currentSession.id,
        isRefinement: true,
        originalComponent: refinementData.originalComponent,
        userRefinements: refinementData.refinementSelections,
        mode: 'refinement'
      });

      const { page, metadata, result, success } = response.data; // Destructure new response structure
      // Use top-level success from backend
      if (!success) {
        throw new Error(response.data?.error || 'Refinement failed');
      }

      console.log('✅ Multi-agent refinement completed successfully');
      
      // Update the component with the refined version
      setCurrentJSX(result.reactCode || ''); // Get reactCode from result
      // Apply multi-file manifest when provided
      if (result?.files && ((typeof result.files === 'object' && Object.keys(result.files).length > 0) || (typeof result.files === 'string' && result.files.trim().startsWith('{')))) {
        const filesObj = typeof result.files === 'string' ? (() => { try { return JSON.parse(result.files); } catch { return null; } })() : result.files;
        setPreviewFiles(filesObj);
        setPreviewMainFile(result.mainFile || (filesObj ? Object.keys(filesObj)[0] : null));
      } else {
        setPreviewFiles(null);
        setPreviewMainFile(null);
      }
      
      // Add success message to chat showing multi-agent processing results
      setMessages(prev => [...prev, {
        type: 'ai',
        content: `✨ Component refined successfully via multi-agent processing!\n\n**Applied Improvements:**\n${refinementData.refinementSelections.map(spec => `• ${spec}`).join('\n')}\n\n**Quality Score:** ${metadata?.qualityScore || 'N/A'}/10\n**Strategy:** ${metadata?.strategy || 'Multi-agent refinement'}\n**Iterations:** ${metadata?.iterations || 'N/A'}`,
        timestamp: new Date().toLocaleTimeString(),
        jsxCode: result.reactCode || '' // Add jsxCode to enable Load to Preview and Refine buttons
      }]);

    } catch (error) {
      console.error('❌ Multi-agent refinement error:', error);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        type: 'ai',
        content: `❌ Multi-agent refinement failed: ${error.message}. Please try again with different selections.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      // Clear loading for this session only
      if (currentSession?.id) {
        loadingSessionsRef.current.delete(currentSession.id);
        delete pendingUserPromptsRef.current[currentSession.id];
        // Ensure we only toggle loading for the active session
        setLoading(loadingSessionsRef.current.has(currentSession.id));
        setIsGeneratingComponent(false);
      } else {
        setLoading(false);
        setIsGeneratingComponent(false);
      }
    }
  };

  const handleExpertDesignGenerate = async (expertData) => {
    if (isCreatingExpertSession.current || sessionCreationLoading) {
      console.log('⚠️ Expert session creation already in progress, skipping');
      return;
    }
    
    setShowExpertBuilder(false);
    
    // Check if we already have a session - if so, use it instead of creating new one
    if (currentSession?.id) {
      console.log('✅ Using existing session for expert prompt:', currentSession.id);
      
      // Use existing session directly
      setTimeout(() => {
        handleSubmit(null, expertData.prompt, currentSession, expertData.brief, false, expertData.userSummary);
      }, 100);
      return;
    }
    
    // Create a new session only if no current session exists
    try {
      isCreatingExpertSession.current = true;
      setSessionCreationLoading(true);
      
      console.log('🏗️ Creating expert design session (no current session)...');
      
      const response = await sessionAPI.create({ 
        title: 'Expert Design' 
      });
      const newSession = response.data.session || response.data;
      
      if (newSession?.id) {
        console.log('✅ Expert session created:', newSession.id);
        
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(newSession));
        
        // Send expert prompt with design brief data
        setTimeout(() => {
          handleSubmit(null, expertData.prompt, newSession, expertData.brief, false, expertData.userSummary);
        }, 100);
      }
      
    } catch (error) {
      console.error('❌ Error creating session for expert design:', error);
    } finally {
      setTimeout(() => {
        setSessionCreationLoading(false);
      }, 300);
      
      setTimeout(() => {
        isCreatingExpertSession.current = false;
        console.log('🔓 Expert session creation lock released');
      }, 1000);
    }
  };

  const downloadComponentCode = (jsxCode = currentJSX) => {
    if (!jsxCode) return;
    
    const finalCode = processComponentForDownload(jsxCode);
    const componentName = finalCode.match(/export default (\w+)/)?.[1] || 'GeneratedComponent';

    const blob = new Blob([finalCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${componentName}.jsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Component downloaded successfully');
  };

  const copyToClipboard = (jsxCode = currentJSX) => {
    if (jsxCode) {
      navigator.clipboard.writeText(jsxCode);
      console.log('Code copied to clipboard');
    }
  };

  const handleToggleSidebar = useCallback(() => {
    const newHiddenState = !sidebarHidden;
    setSidebarHidden(newHiddenState);
    setSidebarWidth(newHiddenState ? 0 : 280);
  }, [sidebarHidden]);

  const handleSidebarResize = useCallback((width) => {
    setSidebarWidth(width);
  }, []);

  const handleChatResize = useCallback((width) => {
    setChatWidth(width);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden flex flex-col">
      
      {/* Header - stays at top */}
      <DashboardHeader
        currentSession={currentSession}
        onLogout={handleLogout}
        sidebarHidden={sidebarHidden}
        onShowSidebar={handleToggleSidebar}
      />
      
      {/* Main content area with resizable panels */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanels
          sidebarWidth={sidebarWidth}
          chatWidth={chatWidth}
          onSidebarResize={handleSidebarResize}
          onChatResize={handleChatResize}
        >
          <SessionSidebar
            sessions={sessions}
            currentSession={currentSession}
            onSessionSelect={loadSession}
            onSessionDelete={handleDeleteSession}
            onNewSessionClick={() => setShowCreateSession(true)}
            width={sidebarWidth}
            onWidthChange={setSidebarWidth}
            isHidden={sidebarHidden}
            onToggleSidebar={handleToggleSidebar}
          />
        
        {currentSession ? (
          <ChatInterface
            messages={messages}
            loading={loading}
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
            onLoadToPreview={(code) => { 
              console.log('🔍 [Dashboard] Loading code to preview:', code.substring(0, 100) + '...');
              setPreviewFiles(null); 
              setPreviewMainFile(null); 
              setCurrentJSX(code); 
            }}
            onSystemMessage={(message) => setMessages(prev => [...prev, message])}
            onAdvancedBuilder={() => setShowAdvancedBuilder(true)}
            onExpertBuilder={() => setShowExpertBuilder(true)}
            onRefineComponent={() => setShowRefinement(true)}
            width={chatWidth}
          />
        ) : (
          <WelcomeScreen
            onCreateSession={handleCreateSessionFromWelcome}
            onAdvancedBuilder={() => setShowAdvancedBuilder(true)}
            onExpertBuilder={handleExpertBuilderFromWelcome}
          />
        )}
        
        <PreviewPanel
          currentJSX={currentJSX}
          width={100 - chatWidth}
          isGenerating={isGeneratingComponent}
          files={previewFiles}
          mainFile={previewMainFile}
        />
        </ResizablePanels>
      </div>
      
      {/* Create Session Modal */}
      <SessionCreationModal
        show={showCreateSession}
        title={newSessionTitle}
        onTitleChange={setNewSessionTitle}
        onCreate={createNewSession}
        onCancel={() => {
          setShowCreateSession(false);
          setNewSessionTitle('');
        }}
        loading={sessionCreationLoading}
      />
      
      {/* Delete Session Modal */}
      <DeleteSessionModal
        show={showDeleteModal}
        session={sessionToDelete}
        onConfirm={confirmDeleteSession}
        onCancel={cancelDeleteSession}
        loading={sessionDeletionLoading}
      />
      
      {/* Advanced Prompt Builder Modal */}
      {showAdvancedBuilder && (
        <AdvancedPromptBuilder
          onGeneratePrompt={handleAdvancedPromptGenerate}
          onCancel={() => setShowAdvancedBuilder(false)}
          loading={loading}
        />
      )}
      
      {/* Expert Design Builder Modal */}
      {showExpertBuilder && (
        <ExpertDesignBuilder
          onGenerateExpert={handleExpertDesignGenerate}
          onCancel={() => setShowExpertBuilder(false)}
          loading={loading}
        />
      )}
      
      {/* Iterative Refinement Modal */}
      {showRefinement && (
        <IterativeRefinement
          onRefineComponent={handleRefinementGenerate}
          onCancel={() => setShowRefinement(false)}
          loading={loading}
          currentComponent={currentJSX}
        />
      )}
    </div>
  );
};

export default EnhancedDashboard;
