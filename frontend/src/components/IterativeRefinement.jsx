/**
 * @file frontend/src/components/IterativeRefinement.jsx
 * @description This component provides a user interface for iteratively refining a generated UI component.
 * It offers a set of pre-defined refinement options, such as adjusting layout, enhancing visuals, and improving styling, as well as a field for custom requests.
 * This allows users to provide targeted feedback to the AI, which can then be used to generate an improved version of the component.
 * The component is designed as a modal, making it easy to integrate into the main dashboard workflow.
 */
import React, { useState } from 'react';

// 3-dot loading spinner component
const ThreeDotLoader = ({ className = "" }) => (
  <div className={`inline-flex items-center gap-1 ${className}`}>
    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
  </div>
);

const IterativeRefinement = ({ onRefineComponent, onCancel, loading, currentComponent }) => {
  const [selectedRefinements, setSelectedRefinements] = useState([]);
  const [customRefinement, setCustomRefinement] = useState('');
  const [refinementCategory, setRefinementCategory] = useState('layout');

  // Quick action buttons - most common UI/UX refinements
  const quickActions = [
    { label: 'Make More Compact', category: 'layout', description: 'Reduce spacing and padding to fit more content' },
    { label: 'Make More Spacious', category: 'layout', description: 'Increase padding and margins for better readability' },
    { label: 'Improve Visual Hierarchy', category: 'visual', description: 'Better typography, headings, and content organization' },
    { label: 'Enhance Color Scheme', category: 'visual', description: 'Improve colors, contrast, and visual appeal' },
    { label: 'Improve Mobile Layout', category: 'layout', description: 'Better responsive design for mobile devices' }
  ];

  // Detailed refinement options by category - UI/UX design only
  const refinementOptions = {
    layout: [
      'Change from single to multi-column layout',
      'Add sidebar or side navigation design',
      'Include collapsible accordion visual sections',
      'Switch to card-based grid layout',
      'Make headings larger and more prominent',
      'Add clear visual sections with dividers'
    ],
    visual: [
      'Use a professional blue/gray color scheme',
      'Apply modern gradient backgrounds',
      'Add subtle shadows and depth to cards',
      'Improve button styling with rounded corners',
      'Add icons next to text labels',
      'Include brand colors and consistent theming'
    ],
    styling: [
      'Add visual hover state styling (static)',
      'Include smooth visual transitions styling',
      'Add visual loading state displays',
      'Include visual form styling and layout',
      'Add visual button effects styling',
      'Include visual state styling variations'
    ],
    content: [
      'Improve typography and text hierarchy',
      'Add visual placeholders and content areas',
      'Include better visual content organization',
      'Add visual empty state designs',
      'Include visual navigation breadcrumbs',
      'Improve visual accessibility indicators'
    ]
  };

  const categoryLabels = {
    layout: '📐 Layout Adjustments',
    visual: '🎨 Visual Enhancements',
    styling: '✨ Visual Styling & Effects',
    content: '📝 Content & Typography'
  };

  const handleQuickAction = (action) => {
    if (selectedRefinements.includes(action.label)) {
      setSelectedRefinements(prev => prev.filter(item => item !== action.label));
    } else {
      setSelectedRefinements(prev => [...prev, action.label]);
    }
  };

  const handleRefinementChange = (refinement) => {
    if (selectedRefinements.includes(refinement)) {
      setSelectedRefinements(prev => prev.filter(item => item !== refinement));
    } else {
      setSelectedRefinements(prev => [...prev, refinement]);
    }
  };

  const handleSubmit = () => {
    const allRefinements = [...selectedRefinements];
    if (customRefinement.trim()) {
      allRefinements.push(customRefinement.trim());
    }

    if (allRefinements.length > 0) {
      // Pass refinement selections directly instead of generating a text prompt
      onRefineComponent({
        refinementSelections: allRefinements,
        originalComponent: currentComponent
      });
    }
  };

  const hasSelections = selectedRefinements.length > 0 || customRefinement.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🔄</span>
            Refine Your Component
          </h3>
          <p className="text-purple-100 text-sm mt-1">
            Select the improvements you'd like to make to your component
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          
          {/* Quick Action Buttons */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              ⚡ Quick Actions (One-Click Refinements)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action)}
                  className={`p-3 text-left rounded-lg border text-sm transition-all ${ 
                    selectedRefinements.includes(action.label)
                      ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">
              📋 Detailed Refinement Options
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(refinementOptions).map(category => (
                <button
                  key={category}
                  onClick={() => setRefinementCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${ 
                    refinementCategory === category
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>

            {/* Refinement Options */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {refinementOptions[refinementCategory].map(option => (
                <label key={option} className="flex items-center p-3 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedRefinements.includes(option)}
                    onChange={() => handleRefinementChange(option)}
                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Refinement */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              ✏️ Custom Refinement Request
            </h4>
            <textarea
              placeholder="Describe any specific changes you'd like to make that aren't covered above..."
              value={customRefinement}
              onChange={(e) => setCustomRefinement(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Selected Refinements Preview */}
          {hasSelections && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Selected Refinements:</h4>
              <div className="space-y-1">
                {selectedRefinements.map((refinement, index) => (
                  <div key={index} className="text-sm text-gray-600">• {refinement}</div>
                ))}
                {customRefinement.trim() && (
                  <div className="text-sm text-gray-600">• {customRefinement.trim()}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            ❌ Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!hasSelections || loading}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <ThreeDotLoader className="text-white" />
                <span>Refining</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Apply Refinements</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IterativeRefinement;