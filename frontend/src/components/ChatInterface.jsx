/**
 * @file frontend/src/components/ChatInterface.jsx
 * @description This component provides the main chat interface for the user to interact with the AI design assistant.
 * It displays the conversation history, including user prompts and AI responses, and provides an input field for the user to type their requests.
 * The component also includes buttons for accessing advanced features like the Advanced Prompt Builder and the Expert Designer.
 * When the user submits a prompt, this component is responsible for initiating the UI generation process and displaying the results.
 */
import React, { useRef, useEffect, useState } from 'react';

// 3-dot loading spinner component
const ThreeDotLoader = ({ className = "" }) => (
  <div className={`inline-flex items-center gap-1 ${className}`}>
    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
  </div>
);

const ChatInterface = ({ 
  messages = [], 
  loading, 
  prompt, 
  onPromptChange, 
  onSubmit, 
  onLoadToPreview,
  onSystemMessage,
  onAdvancedBuilder,
  onExpertBuilder,
  onRefineComponent,
  width 
}) => {
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      // Reset height to get accurate scrollHeight only if there's content
      if (prompt.trim()) {
        textareaRef.current.style.height = 'auto';
        
        const scrollHeight = textareaRef.current.scrollHeight;
        const minHeight = 44; // Single line height
        const maxHeight = 150; // Maximum height (about 6 lines)
        
        // Calculate new height
        const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
        
        textareaRef.current.style.height = newHeight + 'px';
        textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
      } else {
        // When empty, keep single line height
        textareaRef.current.style.height = '44px';
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  };

  // Auto-resize when prompt changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  // Also adjust height on component mount
  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !loading) {
      onSubmit(e);
      // Reset textarea height after submission
      setTimeout(() => adjustTextareaHeight(), 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Enter without Shift submits the form
      e.preventDefault();
      handleSubmit(e);
    }
    // Shift + Enter allows new line (default behavior)
  };

  const handleTextareaChange = (e) => {
    onPromptChange(e.target.value);
    // Use requestAnimationFrame to ensure the DOM has updated before calculating height
    requestAnimationFrame(() => {
      adjustTextareaHeight();
    });
  };

  return (
    <div 
      className="flex flex-col bg-white/50 backdrop-blur-sm border-r border-slate-200/60"
      style={{ width: `${width}%` }}
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200/50 bg-white/70 backdrop-blur-sm">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          💬 AI Design Assistant
        </h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Ready to Create</h3>
              <p className="text-slate-600 max-w-sm mx-auto">
                Type your request below or choose a structured builder!
              </p>
            </div>

            {/* Creation Mode Buttons */}
            <div className="text-center mb-6 space-y-4">
              {/* Advanced Builder Button */}
              <div>
                <button
                  onClick={onAdvancedBuilder}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 mx-auto"
                >
                  <span>🎯</span>
                  <span>Advanced Builder</span>
                </button>
                <p className="text-xs text-slate-500 mt-2">Structured component builder with customization</p>
              </div>
              
              {/* Divider */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-xs text-slate-400 bg-white">OR</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>
              
              {/* Expert Designer Button */}
              <div>
                <button
                  onClick={onExpertBuilder}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 mx-auto"
                >
                  <span>🧠</span>
                  <span>Expert Designer</span>
                </button>
                <p className="text-xs text-slate-500 mt-2">Professional design system with 2-stage AI generation</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                }`}>
                  {message.type === 'ai' ? (
                    <div className="space-y-3">
                      <div className="prose prose-sm max-w-none">
                        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                            <code className="language-jsx">
                              {message.jsxCode && !message.isGenerating ? 
                                "🎉Your component is ready! Generated using our MultiAgent AI system" : 
                                message.content
                              }
                              {message.isGenerating && (
                                <ThreeDotLoader className="text-gray-400 ml-2" />
                              )}
                            </code>
                          </pre>
                        </div>
                      </div>
                      {message.timestamp && (
                        <div className="text-[10px] text-gray-400 text-right -mt-2 pr-1">
                          {message.timestamp}
                        </div>
                      )}
                      {message.jsxCode && (
                        <div className="border-t border-slate-200 pt-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                console.log('🔍 [ChatInterface] Load to Preview clicked');
                                console.log('🔍 [ChatInterface] JSX code exists:', !!message.jsxCode);
                                console.log('🔍 [ChatInterface] JSX code length:', message.jsxCode?.length || 0);
                                if (message.jsxCode) {
                                  console.log('🔍 [ChatInterface] JSX code preview:', message.jsxCode.substring(0, 100) + '...');
                                }
                                console.log('🔍 [ChatInterface] Calling onLoadToPreview with code');
                                onLoadToPreview(message.jsxCode);
                              }}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2"
                            >
                              <span>🔍</span><span>Load to Preview</span>
                            </button>
                            <button
                              onClick={onRefineComponent}
                              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                            >
                              <span>🔄</span><span>Refine</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.timestamp && (
                        <div className={`text-[10px] text-right mt-1 pr-1 ${
                          message.type === 'user' ? 'text-white/70' : 
                          message.type === 'error' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {message.timestamp}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200/50 bg-white/70 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                requestAnimationFrame(() => adjustTextareaHeight());
              }}
              onPaste={(e) => {
                // Handle paste events which might add multiple lines
                // Need to wait for the paste content to be actually inserted into the DOM
                setTimeout(() => {
                  if (textareaRef.current) {
                    // Force recalculation using actual textarea value (not prompt state)
                    textareaRef.current.style.height = 'auto';
                    const scrollHeight = textareaRef.current.scrollHeight;
                    const minHeight = 44;
                    const maxHeight = 150;
                    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
                    textareaRef.current.style.height = newHeight + 'px';
                    textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
                  }
                }, 10);
              }}
              placeholder="Describe the UI component you want to create..."
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-none bg-white/80 resize-none leading-6"
              disabled={loading}
              rows={1}
              style={{ height: '44px', minHeight: '44px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 self-end"
          >
            {loading ? (
              <>
                <ThreeDotLoader className="text-white" />
                <span>Generating</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generate</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;