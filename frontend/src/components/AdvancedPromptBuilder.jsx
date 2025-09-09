/**
 * @file frontend/src/components/AdvancedPromptBuilder.jsx
 * @description This component provides a step-by-step guided interface for users to construct detailed and structured prompts for UI generation.
 * It breaks down the process of defining a component into a series of manageable steps, asking the user for information about the component type, application context, functionality, and styling preferences.
 * This ensures that the AI receives a high-quality, well-defined prompt, which in turn leads to better and more accurate results.
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

const AdvancedPromptBuilder = ({ onGeneratePrompt, onCancel, loading }) => {
  const [step, setStep] = useState(1);
  const [responses, setResponses] = useState({
    componentType: '',
    applicationType: '',
    customApplicationType: '',
    specificFunctionality: [],
    dataStructure: '',
    uiuxPreferences: [],
    visualEnhancements: []
  });

  // Component type options
  const componentTypes = [
    'User Authentication (login, signup, forgot password)',
    'Dashboard/Analytics (charts, metrics, data overview)',
    'Data Management (tables, lists, CRUD operations)',
    'User Profile/Settings (forms, preferences, account)',
    'E-commerce (product pages, checkout, cart)',
    'Content Management (blog, articles, media)',
    'Communication (chat, messaging, notifications)',
    'Landing/Marketing Pages (hero, features, pricing)'
  ];

  // Application type options
  const applicationTypes = [
    'SaaS Platform',
    'E-commerce Store',
    'Portfolio/Agency Site',
    'Internal Business Tool',
    'Social/Community Platform',
    'Educational Platform',
    'Healthcare/Medical App',
    'Financial/Banking App',
    'Other'
  ];

  // UI/UX design options based on component type  
  const functionalityOptions = {
    'Dashboard/Analytics (charts, metrics, data overview)': [
      'Visual chart layouts and styling',
      'Data visualization cards design',
      'Metric display formatting',
      'Dashboard grid arrangements',
      'Interactive hover states'
    ],
    'Data Management (tables, lists, CRUD operations)': [
      'Table layout and styling',
      'List item visual design',
      'Button and action layouts',
      'Form input styling',
      'Status indicator designs'
    ],
    'User Authentication (login, signup, forgot password)': [
      'Login form layout and styling',
      'Social login button designs',
      'Input field visual states',
      'Form validation messaging',
      'Brand integration elements'
    ],
    'User Profile/Settings (forms, preferences, account)': [
      'Profile card layouts',
      'Settings panel organization',
      'Form section groupings',
      'Toggle and switch designs',
      'Avatar and image layouts'
    ],
    'E-commerce (product pages, checkout, cart)': [
      'Product card designs',
      'Image gallery layouts',
      'Pricing display formats',
      'Shopping cart UI elements',
      'Checkout flow styling'
    ],
    'Content Management (blog, articles, media)': [
      'Article card layouts',
      'Media grid arrangements',
      'Navigation menu designs',
      'Content hierarchy styling',
      'Tag and category displays'
    ],
    'Communication (chat, messaging, notifications)': [
      'Message bubble designs',
      'Chat interface layouts',
      'Notification badge styling',
      'User avatar arrangements',
      'Status indicator designs'
    ],
    'Landing/Marketing Pages (hero, features, pricing)': [
      'Hero section layouts',
      'Feature highlight cards',
      'Pricing table designs',
      'Testimonial card styling',
      'Call-to-action button designs'
    ]
  };

  // UI/UX preferences
  const uiuxPreferences = [
    'Add loading and error states',
    'Include hover animations and transitions',
    'Add focus states and accessibility features',
    'Include responsive breakpoints',
    'Add visual feedback for interactions'
  ];

  // Visual enhancements
  const visualEnhancements = [
    'Dark mode support',
    'Smooth animations and micro-interactions',
    'Advanced visual effects (glassmorphism, gradients)',
    'Custom icon designs',
    'Print-friendly styles',
    'High contrast accessibility mode'
  ];

  // Content examples for UI/UX design
  const contentExamples = {
    'User Authentication (login, signup, forgot password)': 'Login forms with email/password fields, social login buttons, forgot password links, validation messages',
    'Dashboard/Analytics (charts, metrics, data overview)': 'Metric cards, chart placeholders, data visualization areas, filter controls, navigation elements',
    'Data Management (tables, lists, CRUD operations)': 'Table headers, list items, action buttons, search bars, pagination controls, status indicators',
    'User Profile/Settings (forms, preferences, account)': 'Profile sections, settings panels, form layouts, toggle switches, preference categories',
    'E-commerce (product pages, checkout, cart)': 'Product cards, pricing displays, image galleries, add-to-cart buttons, checkout flows',
    'Content Management (blog, articles, media)': 'Article layouts, media galleries, content organization, navigation menus, content cards',
    'Communication (chat, messaging, notifications)': 'Message bubbles, notification badges, user avatars, chat interfaces, status indicators',
    'Landing/Marketing Pages (hero, features, pricing)': 'Hero sections, feature highlights, pricing tables, testimonials, call-to-action buttons'
  };

  const handleInputChange = (field, value) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field, option) => {
    setResponses(prev => ({
      ...prev,
      [field]: prev[field].includes(option)
        ? prev[field].filter(item => item !== option)
        : [...prev[field], option]
    }));
  };

  const generateAdvancedPrompt = () => {
    const componentType = responses.componentType;
    const applicationType = responses.applicationType === 'Other' 
      ? responses.customApplicationType 
      : responses.applicationType;
    
    const uiElementsList = responses.specificFunctionality.length > 0 
      ? responses.specificFunctionality.join(', ') 
      : 'Standard UI elements';
    
    const uiuxFeatures = responses.uiuxPreferences.length > 0 
      ? responses.uiuxPreferences.join(', ') 
      : 'Standard UI/UX features';
    
    const visualFeatures = responses.visualEnhancements.length > 0 
      ? responses.visualEnhancements.join(', ') 
      : 'Standard visual design';

    // SIMPLIFIED: Just send user choices, let backend handle implementation details
    return `Create a production-ready ${componentType} component for a ${applicationType} application.

**COMPONENT SPECIFICATIONS:**
- **Component Type**: ${componentType}
- **Application Context**: ${applicationType}
- **UI Elements & Layout**: ${uiElementsList}
- **Content & Structure**: ${responses.dataStructure || 'Standard content layout'}
- **UI/UX Features**: ${uiuxFeatures}
- **Visual Features**: ${visualFeatures}`;
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return responses.componentType !== '';
      case 2:
        return responses.applicationType !== '' && 
               (responses.applicationType !== 'Other' || responses.customApplicationType !== '');
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      case 5:
        return true; // Optional step
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 What do you need to build?
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {componentTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleInputChange('componentType', type)}
                    className={`p-4 text-left rounded-lg border text-sm transition-all ${
                      responses.componentType === type
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🏢 What's your application type?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {applicationTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleInputChange('applicationType', type)}
                    className={`p-3 text-left rounded-lg border text-sm transition-all ${
                      responses.applicationType === type
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {responses.applicationType === 'Other' && (
                <input
                  type="text"
                  placeholder="Describe your application type..."
                  value={responses.customApplicationType}
                  onChange={(e) => handleInputChange('customApplicationType', e.target.value)}
                  className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎨 What UI elements and layouts do you need?
              </h3>
              {responses.componentType && functionalityOptions[responses.componentType] ? (
                <div className="space-y-2">
                  {functionalityOptions[responses.componentType].map(option => (
                    <label key={option} className="flex items-center p-3 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={responses.specificFunctionality.includes(option)}
                        onChange={() => handleMultiSelectChange('specificFunctionality', option)}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Please select a component type first.</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎨 What content and elements will this display?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Describe the UI elements, content sections, and visual components
              </p>
              <textarea
                placeholder={responses.componentType && contentExamples[responses.componentType] 
                  ? contentExamples[responses.componentType]
                  : "Describe the UI elements and content (e.g., Navigation menus, content cards, buttons, forms)"}
                value={responses.dataStructure}
                onChange={(e) => handleInputChange('dataStructure', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔧 Customization Options
              </h3>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">UI/UX Features:</h4>
                <div className="space-y-2">
                  {uiuxPreferences.map(option => (
                    <label key={option} className="flex items-center p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={responses.uiuxPreferences.includes(option)}
                        onChange={() => handleMultiSelectChange('uiuxPreferences', option)}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">Visual Enhancements:</h4>
                <div className="space-y-2">
                  {visualEnhancements.map(option => (
                    <label key={option} className="flex items-center p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={responses.visualEnhancements.includes(option)}
                        onChange={() => handleMultiSelectChange('visualEnhancements', option)}
                        className="mr-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const generateUserFriendlySummary = () => {
    const { componentType, applicationType, customApplicationType, specificFunctionality, uiuxPreferences, visualEnhancements } = responses;
    
    const appType = applicationType === 'Other' ? customApplicationType : applicationType;
    const functionalityList = specificFunctionality.length > 0 ? specificFunctionality.join(', ') : 'basic functionality';
    const uiFeatures = uiuxPreferences.length > 0 ? uiuxPreferences.join(', ') : 'standard UI elements';
    const visualFeatures = visualEnhancements.length > 0 ? visualEnhancements.join(', ') : 'standard styling';
    
    return `Create a production-ready ${componentType} component for a ${appType} application.

**COMPONENT SPECIFICATIONS:**
- **Component Type**: ${componentType}
- **Application Context**: ${appType}
- **UI Elements & Layout**: ${functionalityList}
- **Content & Structure**: ${responses.dataStructure || 'Standard component structure'}

- **UI/UX Features**: ${uiFeatures}
- **Visual Features**: ${visualFeatures}`;
  };

  const handleSubmit = () => {
    const fullPrompt = generateAdvancedPrompt();
    const userSummary = generateUserFriendlySummary();
    
    // Return both full prompt for backend and summary for chat display
    onGeneratePrompt({ fullPrompt, userSummary });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎯</span>
              Advanced Component Builder
            </h3>
            <button
              onClick={onCancel}
              className="text-blue-200 hover:text-white text-xl transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center mt-2 space-x-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <p className="text-blue-100 text-sm mt-2">
            Step {step} of 5: {
              step === 1 ? 'Component Type' :
              step === 2 ? 'Application Type' :
              step === 3 ? 'UI Elements' :
              step === 4 ? 'Content & Layout' :
              'Visual Styling'
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {renderStep()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 pb-8 border-t bg-gray-50 mb-4">
          <button
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            {step === 1 ? '❌ Cancel' : '← Back'}
          </button>

          <div className="flex space-x-3">
            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!isStepComplete() || loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <ThreeDotLoader className="text-white" />
                    <span>Generating</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Generate Component</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPromptBuilder;