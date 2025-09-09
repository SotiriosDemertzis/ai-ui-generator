/**
 * @file frontend/src/components/PreviewPanel.jsx
 * @description Production-quality React component preview using Sandpack
 * Provides fast, reliable Sandpack-based preview with clean, minimal interface
 */
import React, { useState, memo, useCallback, useMemo } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { AlertCircle, Eye, Code, RefreshCw, FileText } from 'lucide-react';
import { processComponentForDownload } from '../utils/componentProcessor';

// Accept files and mainFile as props
const PreviewPanel = ({ currentJSX, width, files, mainFile, isGenerating = false }) => {
  const [currentView, setCurrentView] = useState('preview'); // preview, code, or both
  const [error, setError] = useState(null);
  
  // Create Sandpack files configuration
  const sandpackFiles = useMemo(() => {
    console.log('🎨 [PreviewPanel] Creating sandpack files:', {
      hasCurrentJSX: !!currentJSX,
      currentJSXLength: currentJSX?.length || 0,
      currentJSXPreview: currentJSX ? currentJSX.substring(0, 200) + '...' : 'None'
    });

    if (!currentJSX) {
      console.log('🎨 [PreviewPanel] No currentJSX provided, returning empty files');
      return {};
    }

    // Basic validation of React code
    const hasExport = currentJSX.includes('export default');
    const hasReactImport = currentJSX.includes('import React') || currentJSX.includes('from "react"');
    const hasJSXSyntax = currentJSX.includes('<') && currentJSX.includes('>');
    const hasTailwindClasses = /className=["'][^"']*(?:bg-|text-|p-|m-|flex|grid|w-|h-)/i.test(currentJSX);
    
    console.log('🎨 [PreviewPanel] Code validation:', {
      hasExport,
      hasReactImport,
      hasJSXSyntax,
      hasTailwindClasses,
      isValidReact: hasExport && hasReactImport && hasJSXSyntax
    });

    if (hasTailwindClasses) {
      console.log('🎨 [PreviewPanel] Tailwind CSS classes detected - adding Tailwind to preview');
    }

    console.log('🎨 [PreviewPanel] Building sandpack files with JSX code');

    return {
      '/App.js': currentJSX,
      '/src/styles.css': `
/* Tailwind CSS via CDN backup */
@import url('https://cdn.tailwindcss.com');

/* Basic styling fallback */
.bg-blue-500 { background-color: #3b82f6; }
.bg-blue-600 { background-color: #2563eb; }
.text-white { color: white; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.m-4 { margin: 1rem; }
.rounded { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }
.space-y-4 > * + * { margin-top: 1rem; }
.grid { display: grid; }
.gap-4 { gap: 1rem; }
.hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
`,
      '/public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/src/styles.css">
    <script>
      tailwind.config = {
        theme: {
          extend: {}
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      '/package.json': JSON.stringify({
        name: "component-preview",
        version: "1.0.0",
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "lucide-react": "^0.300.0"
        }
      }, null, 2)
    };
  }, [currentJSX]);

  // Enhanced error handling
  const handlePreviewError = useCallback((error, errorInfo) => {
    console.error('Preview Error:', error);
    setError(error?.message || 'Preview error occurred');
  }, []);

  // Copy functionality (preserving original behavior)
  const copyToClipboard = useCallback(() => {
    if (currentJSX) {
      let cleanCode = currentJSX.replace(/\bfor="/g, 'htmlFor="');
      navigator.clipboard.writeText(cleanCode)
        .then(() => console.log('✅ Component copied to clipboard'))
        .catch(err => console.error('Failed to copy:', err));
    }
  }, [currentJSX]);

  // Download functionality (FIXED - no more double imports)
  const downloadComponent = useCallback(() => {
    if (!currentJSX) return;

    const finalCode = processComponentForDownload(currentJSX);
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
  }, [currentJSX]);

  return (
    <>
      {/* Custom styles for hiding editor/preview based on view mode */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Preview only mode */
        .sandpack-preview-only .sp-layout .sp-editor,
        .sandpack-preview-only .sp-editor-wrapper {
          display: none !important;
        }
        .sandpack-preview-only .sp-layout .sp-preview,
        .sandpack-preview-only .sp-preview-wrapper {
          width: 100% !important;
          flex: 1 !important;
        }
        
        /* Code only mode */
        .sandpack-code-only .sp-layout .sp-preview,
        .sandpack-code-only .sp-preview-wrapper {
          display: none !important;
        }
        .sandpack-code-only .sp-layout .sp-editor,
        .sandpack-code-only .sp-editor-wrapper {
          width: 100% !important;
          flex: 1 !important;
        }
        
        /* Ensure full height for all elements */
        .sp-layout,
        .sp-layout .sp-editor,
        .sp-layout .sp-preview,
        .sp-layout .sp-editor-wrapper,
        .sp-layout .sp-preview-wrapper,
        .sp-wrapper {
          height: 100% !important;
          min-height: 100% !important;
        }
        `
      }} />
      
      <div 
        className="flex flex-col bg-white/30 backdrop-blur-sm"
        style={{ width: `${width}%` }}
      >
      {/* Header with controls */}
      <div className="p-4 border-b border-slate-200/50 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-800">
              🚀 Component Preview
            </h3>
            {/* View Toggle Buttons */}
            <div className="flex items-center space-x-1">
                {[
                  { key: 'preview', label: '👀 Preview', title: 'Show only preview' },
                  { key: 'code', label: '💻 Code', title: 'Show only code editor' }
                ].map(({ key, label, title }) => (
                  <button
                    key={key}
                    onClick={() => setCurrentView(key)}
                    disabled={!currentJSX}
                    title={title}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                      currentView === key
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:from-blue-600 hover:to-blue-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
            </div>
          </div>
          
          {/* Copy/Download Buttons */}
          {currentJSX && (
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:from-slate-200 hover:to-slate-300 transition-all duration-200 shadow-sm"
              >
                📋 Copy
              </button>
              <button
                onClick={downloadComponent}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
              >
                💾 Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sandpack Preview Container - Full Height */}
      <div className="flex-1 overflow-hidden relative">
        {/* Beautiful loading overlay while component is generating */}
        {isGenerating && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-md"
            aria-busy="true"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20"></div>
              </div>
              <div className="text-sm font-medium text-slate-700">Generating preview…</div>
              <div className="text-xs text-slate-500">Crafting UI with multi-agent AI</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg m-4">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Preview Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* No Component State */}
        {!currentJSX && !isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg m-4">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Component</h3>
              <p className="text-gray-500">Generate a component to see the preview</p>
            </div>
          </div>
        )}

        {/* Sandpack Preview - Full Container */}
        {currentJSX && !error && (
          <div className="absolute inset-0 w-full h-full">
            <div 
              className={`h-full w-full ${
                currentView === 'preview' ? 'sandpack-preview-only' : 'sandpack-code-only'
              }`}
            >
              <Sandpack
                template="react"
                files={sandpackFiles}
                theme="light"
                options={{
                  autorun: currentView === 'preview',
                  showNavigator: false,
                  showTabs: false,
                  showLineNumbers: currentView === 'code',
                  showConsole: false,
                  showConsoleButton: false,
                  wrapContent: true,
                  editorHeight: "100%",
                  editorWidthPercentage: currentView === 'preview' ? 0 : 100,
                  readOnly: true, // Make code editor read-only
                  externalResources: [
                    "https://cdn.tailwindcss.com"
                  ]
                }}
                customSetup={{
                  dependencies: {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0",
                    "lucide-react": "^0.300.0"
                  }
                }}
                style={{
                  height: '100%',
                  width: '100%'
                }}
                onBundlerTranspileComplete={(result) => {
                  console.log('🎨 [Sandpack] Transpile complete:', result);
                }}
                onBundlerCompiled={(result) => {
                  console.log('🎨 [Sandpack] Compiled:', { 
                    success: !result?.error,
                    hasError: !!result?.error,
                    error: result?.error?.message 
                  });
                  if (result?.error) {
                    console.error('🎨 [Sandpack] Compilation error:', result.error);
                  }
                }}
                onError={(error) => {
                  console.error('🎨 [Sandpack] Runtime error:', error);
                  setError(error?.message || 'Sandpack runtime error');
                }}
              />
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(PreviewPanel);