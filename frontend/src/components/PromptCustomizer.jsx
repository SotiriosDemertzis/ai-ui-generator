import React, { useState } from 'react';

const PromptCustomizer = ({ onCustomPrompt, onCancel, loading }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // A. General Customization
    pageType: '',
    customPageType: '',
    purpose: '',
    customPurpose: '',
    
    // B. Visual Style
    designStyle: '',
    customDesignStyle: '',
    colorTheme: 'light',
    brandColors: '',
    
    // C. Functional Components
    functionalElements: [],
    
    // D. Accessibility & Performance
    accessibility: [],
    performance: [],
    
    // Custom prompt
    customPrompt: ''
  });

  const pageTypes = [
    'Landing Page', 'Login/Signup Form', 'Dashboard', 'Navbar', 
    'Hero Section', 'Profile Card', 'Product Page', 'Blog Post', 
    'Contact Form', 'Pricing Table', 'Custom'
  ];

  const purposes = [
    'Lead generation', 'Showcase product/service', 'User authentication',
    'Data visualization', 'Content consumption', 'E-commerce', 'Other'
  ];

  const designStyles = [
    'Minimal', 'Corporate', 'Playful', 'Dark mode', 'Neumorphism',
    'Glassmorphism', 'Modern Flat', 'Material Design', 'Custom'
  ];

  const functionalOptions = [
    'Forms (contact, login, signup)', 'Charts or graphs', 'Tabs or accordions',
    'Modal or popups', 'Sidebar or navbar', 'CTA buttons', 'Image gallery',
    'Search bar', 'Pagination', 'Filters', 'Notifications', 'Loading states'
  ];

  const accessibilityOptions = [
    'WCAG Compliance', 'Screen reader support', 'Keyboard navigation',
    'High contrast support', 'Focus indicators'
  ];

  const performanceOptions = [
    'Lightweight', 'Fast-loading (avoid unnecessary libraries)',
    'Optimized for mobile', 'SEO friendly'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field, option) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(option)
        ? prev[field].filter(item => item !== option)
        : [...prev[field], option]
    }));
  };

  const generatePrompt = () => {
    const pageType = formData.pageType === 'Custom' ? formData.customPageType : formData.pageType;
    const purpose = formData.purpose === 'Other' ? formData.customPurpose : formData.purpose;
    const designStyle = formData.designStyle === 'Custom' ? formData.customDesignStyle : formData.designStyle;
    
    const colorInfo = formData.colorTheme === 'brand' 
      ? `Brand colors: ${formData.brandColors}` 
      : `${formData.colorTheme} theme`;

    const functionalElements = formData.functionalElements.length > 0 
      ? formData.functionalElements.join(', ') 
      : 'Standard UI elements';

    const accessibilityReqs = formData.accessibility.length > 0 
      ? formData.accessibility.join(', ') 
      : 'Basic accessibility';

    const performanceGoals = formData.performance.length > 0 
      ? formData.performance.join(', ') 
      : 'Standard performance';

  const prompt = `You are a world-class UI/UX designer specializing in responsive web design using React and Tailwind CSS. Design a ${pageType} that is:

  Purpose: ${purpose}
  Style: ${designStyle}
  Color Theme: ${colorInfo}
  Functional Elements: ${functionalElements}
  Accessibility Goals: ${accessibilityReqs}
  Performance Focus: ${performanceGoals}

  IMPORTANT CONSTRAINTS:
  - Use ONLY React and Tailwind CSS - no external libraries or icon libraries
  - For images, use placeholder URLs from Unsplash (https://images.unsplash.com/) or Picsum (https://picsum.photos/)
  - Ensure that all images are rendered properly in all screen sizes and the URLs used are valid and not broken
  - For icons, use Unicode symbols (✓, ×, ←, →, ☰, etc.) or create simple CSS/SVG shapes
  - Do not import any external dependencies beyond React

  Follow modern UI/UX standards, focusing on mobile-first, user-centered design. Ensure visual hierarchy, proper spacing, and component consistency using Tailwind CSS. Maintain semantic HTML structure, responsive breakpoints, and accessibility compliance.

  Your Deliverable:
  Provide a complete React functional component using Tailwind CSS with clean, well-commented code. Include realistic placeholder data/content where needed. All elements must be fully responsive, accessible, and aligned with the provided specifications.

  ${formData.customPrompt ? `\nAdditional Requirements: ${formData.customPrompt}` : ''}`;


    return prompt;
  };

  const handleSubmit = () => {
    const customPrompt = generatePrompt();
    onCustomPrompt(customPrompt);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔹 General Customization</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of page/component do you want?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {pageTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => handleInputChange('pageType', type)}
                      className={`p-3 text-left rounded-lg border text-sm transition-all ${
                        formData.pageType === type
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {formData.pageType === 'Custom' && (
                  <input
                    type="text"
                    placeholder="Describe your custom component..."
                    value={formData.customPageType}
                    onChange={(e) => handleInputChange('customPageType', e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Purpose/Goal?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {purposes.map(purpose => (
                    <button
                      key={purpose}
                      onClick={() => handleInputChange('purpose', purpose)}
                      className={`p-3 text-left rounded-lg border text-sm transition-all ${
                        formData.purpose === purpose
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {purpose}
                    </button>
                  ))}
                </div>
                {formData.purpose === 'Other' && (
                  <input
                    type="text"
                    placeholder="Describe the purpose..."
                    value={formData.customPurpose}
                    onChange={(e) => handleInputChange('customPurpose', e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔹 Visual Style</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Design Style?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {designStyles.map(style => (
                    <button
                      key={style}
                      onClick={() => handleInputChange('designStyle', style)}
                      className={`p-3 text-left rounded-lg border text-sm transition-all ${
                        formData.designStyle === style
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                {formData.designStyle === 'Custom' && (
                  <input
                    type="text"
                    placeholder="Describe your design style..."
                    value={formData.customDesignStyle}
                    onChange={(e) => handleInputChange('customDesignStyle', e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme:
                </label>
                <div className="space-y-2">
                  {['light', 'dark', 'brand'].map(theme => (
                    <label key={theme} className="flex items-center">
                      <input
                        type="radio"
                        name="colorTheme"
                        value={theme}
                        checked={formData.colorTheme === theme}
                        onChange={(e) => handleInputChange('colorTheme', e.target.value)}
                        className="mr-2"
                      />
                      <span className="capitalize">{theme === 'brand' ? 'Brand colors' : theme}</span>
                    </label>
                  ))}
                </div>
                {formData.colorTheme === 'brand' && (
                  <input
                    type="text"
                    placeholder="Enter HEX colors (e.g., #3B82F6, #10B981)"
                    value={formData.brandColors}
                    onChange={(e) => handleInputChange('brandColors', e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔹 Functional Components</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you need any of the following? (Select all that apply)
                </label>
                <div className="space-y-2">
                  {functionalOptions.map(option => (
                    <label key={option} className="flex items-center p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.functionalElements.includes(option)}
                        onChange={() => handleMultiSelectChange('functionalElements', option)}
                        className="mr-3"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔹 Accessibility & Performance</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accessibility Priority? (Select all that apply)
                </label>
                <div className="space-y-2">
                  {accessibilityOptions.map(option => (
                    <label key={option} className="flex items-center p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.accessibility.includes(option)}
                        onChange={() => handleMultiSelectChange('accessibility', option)}
                        className="mr-3"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Performance Focus? (Select all that apply)
                </label>
                <div className="space-y-2">
                  {performanceOptions.map(option => (
                    <label key={option} className="flex items-center p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.performance.includes(option)}
                        onChange={() => handleMultiSelectChange('performance', option)}
                        className="mr-3"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  placeholder="Any specific requirements, features, or constraints..."
                  value={formData.customPrompt}
                  onChange={(e) => handleInputChange('customPrompt', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return formData.pageType && formData.purpose && 
               (formData.pageType !== 'Custom' || formData.customPageType) &&
               (formData.purpose !== 'Other' || formData.customPurpose);
      case 2:
        return formData.designStyle && 
               (formData.designStyle !== 'Custom' || formData.customDesignStyle) &&
               (formData.colorTheme !== 'brand' || formData.brandColors);
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎯</span>
            Customize Your Design Prompt
          </h3>
          <div className="flex items-center mt-2 space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <p className="text-indigo-100 text-sm mt-2">
            Step {step} of 4: {
              step === 1 ? 'General Info' :
              step === 2 ? 'Visual Style' :
              step === 3 ? 'Functionality' :
              'Accessibility & Performance'
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderStep()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            {step === 1 ? '❌ Cancel' : '← Back'}
          </button>

          <div className="flex space-x-3">
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!isStepComplete() || loading}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Generate Design</span>
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

export default PromptCustomizer;