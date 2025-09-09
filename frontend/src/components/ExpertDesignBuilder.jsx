/**
 * @file frontend/src/components/ExpertDesignBuilder.jsx
 * @description This component provides a comprehensive, multi-step workflow for creating expert-level design briefs.
 * It guides the user through a series of detailed questions about their project, including context, design system, content strategy, and technical specifications.
 * This structured approach ensures that the AI receives a rich and detailed set of requirements, which is essential for generating high-quality, professional-grade UI components.
 * The component is designed as a modal with a clear, step-by-step progression, making it easy for users to provide the necessary information without feeling overwhelmed.
 */
import React, { useState } from 'react';

const ExpertDesignBuilder = ({ onGenerateExpert, onCancel, loading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [designBrief, setDesignBrief] = useState({
    // Step 1: Project Context
    projectType: '',
    targetAudience: '',
    useCaseCategory: '',
    brandPersonality: '',
    
    // Step 2: Design System
    designSystem: 'modern',
    colorScheme: 'blue',
    customColors: [],
    typography: 'sans-serif',
    spacingSystem: 'comfortable',
    
    // Step 3: Content Strategy
    industry: '',
    contentTone: 'professional',
    contentComplexity: 'medium',
    useRealData: true,
    
    // Step 4: Technical Specs
    layoutPattern: 'card-grid',
    componentComplexity: 'medium',
    interactionLevel: 'basic',
    responsivePriority: 'mobile-first',
    
    // Step 5: User Prompt
    prompt: ''
  });

  const steps = [
    { id: 1, title: 'Project Context', icon: '🎯' },
    { id: 2, title: 'Design System', icon: '🎨' },
    { id: 3, title: 'Content Strategy', icon: '📝' },
    { id: 4, title: 'Technical Specs', icon: '⚙️' },
    { id: 5, title: 'Your Request', icon: '💬' }
  ];

  const updateDesignBrief = (key, value) => {
    setDesignBrief(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleGenerate = () => {
    // Create user-friendly summary for chat display
    const userSummary = `🧠 Expert Design Request:

**Project Type:** ${designBrief.projectType}
**Target Audience:** ${designBrief.targetAudience}
**Brand Personality:** ${designBrief.brandPersonality}
**Design System:** ${designBrief.designSystem}
**Color Scheme:** ${designBrief.colorScheme}
**Layout Pattern:** ${designBrief.layoutPattern}
**Component Complexity:** ${designBrief.componentComplexity}
**Responsive Priority:** ${designBrief.responsivePriority}

**User Prompt:** ${designBrief.prompt}`;

    const expertPrompt = {
      brief: designBrief,
      prompt: designBrief.prompt,
      userSummary: userSummary,
      mode: 'expert'
    };
    
    onGenerateExpert(expertPrompt);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Project Context</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                <select
                  value={designBrief.projectType}
                  onChange={(e) => updateDesignBrief('projectType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select project type...</option>
                  <option value="dashboard">Dashboard / Analytics</option>
                  <option value="landing">Landing Page</option>
                  <option value="ecommerce">E-commerce / Product</option>
                  <option value="saas">SaaS Application</option>
                  <option value="portfolio">Portfolio / Personal</option>
                  <option value="blog">Blog / Content</option>
                  <option value="admin">Admin Panel</option>
                  <option value="mobile-app">Mobile App UI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <select
                  value={designBrief.targetAudience}
                  onChange={(e) => updateDesignBrief('targetAudience', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select target audience...</option>
                  <option value="business-users">Business Users / Professionals</option>
                  <option value="consumers">General Consumers</option>
                  <option value="developers">Developers / Technical Users</option>
                  <option value="executives">Executives / Decision Makers</option>
                  <option value="creative">Creative Professionals</option>
                  <option value="students">Students / Educators</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Use Case Category</label>
                <select
                  value={designBrief.useCaseCategory}
                  onChange={(e) => updateDesignBrief('useCaseCategory', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select use case...</option>
                  <option value="data-visualization">Data Visualization</option>
                  <option value="content-management">Content Management</option>
                  <option value="user-onboarding">User Onboarding</option>
                  <option value="product-showcase">Product Showcase</option>
                  <option value="user-profile">User Profile / Settings</option>
                  <option value="collaboration">Team Collaboration</option>
                  <option value="marketing">Marketing / Conversion</option>
                  <option value="communication">Communication / Social</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Personality</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'professional', label: 'Professional & Corporate' },
                    { value: 'modern', label: 'Modern & Innovative' },
                    { value: 'minimal', label: 'Minimal & Clean' },
                    { value: 'playful', label: 'Playful & Creative' },
                    { value: 'luxurious', label: 'Luxurious & Premium' },
                    { value: 'friendly', label: 'Friendly & Approachable' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateDesignBrief('brandPersonality', option.value)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        designBrief.brandPersonality === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Design System</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Design System Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'modern', label: 'Modern & Contemporary' },
                    { value: 'material', label: 'Material Design' },
                    { value: 'apple', label: 'Apple HIG Style' },
                    { value: 'minimal', label: 'Minimal & Clean' },
                    { value: 'corporate', label: 'Corporate & Professional' },
                    { value: 'creative', label: 'Creative & Artistic' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateDesignBrief('designSystem', option.value)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        designBrief.designSystem === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color Scheme</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
                    { value: 'green', label: 'Green', color: 'bg-green-500' },
                    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
                    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
                    { value: 'red', label: 'Red', color: 'bg-red-500' },
                    { value: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
                    { value: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
                    { value: 'neutral', label: 'Neutral', color: 'bg-gray-500' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateDesignBrief('colorScheme', option.value)}
                      className={`p-3 rounded-lg border flex flex-col items-center space-y-1 transition-colors ${
                        designBrief.colorScheme === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${option.color}`}></div>
                      <span className="text-xs">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typography Style</label>
                <select
                  value={designBrief.typography}
                  onChange={(e) => updateDesignBrief('typography', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sans-serif">Sans-serif (Modern & Clean)</option>
                  <option value="serif">Serif (Traditional & Elegant)</option>
                  <option value="mono">Monospace (Technical & Code)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spacing System</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'compact', label: 'Compact', desc: 'Dense layouts' },
                    { value: 'comfortable', label: 'Comfortable', desc: 'Balanced spacing' },
                    { value: 'spacious', label: 'Spacious', desc: 'Generous spacing' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateDesignBrief('spacingSystem', option.value)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        designBrief.spacingSystem === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Content Strategy</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry/Domain</label>
                <select
                  value={designBrief.industry}
                  onChange={(e) => updateDesignBrief('industry', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select industry...</option>
                  <option value="technology">Technology / Software</option>
                  <option value="finance">Finance / Fintech</option>
                  <option value="healthcare">Healthcare / Medical</option>
                  <option value="ecommerce">E-commerce / Retail</option>
                  <option value="education">Education / Learning</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="marketing">Marketing / Agency</option>
                  <option value="travel">Travel / Hospitality</option>
                  <option value="food">Food / Restaurant</option>
                  <option value="fitness">Fitness / Wellness</option>
                  <option value="creative">Creative / Design</option>
                  <option value="generic">Generic / Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Tone</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'professional', label: 'Professional & Formal' },
                    { value: 'friendly', label: 'Friendly & Conversational' },
                    { value: 'technical', label: 'Technical & Precise' },
                    { value: 'creative', label: 'Creative & Inspiring' },
                    { value: 'casual', label: 'Casual & Relaxed' },
                    { value: 'authoritative', label: 'Authoritative & Expert' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateDesignBrief('contentTone', option.value)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        designBrief.contentTone === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Complexity</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'simple', label: 'Simple', desc: 'Basic content, minimal text' },
                    { value: 'medium', label: 'Medium', desc: 'Balanced content depth' },
                    { value: 'complex', label: 'Complex', desc: 'Rich content, detailed info' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateDesignBrief('contentComplexity', option.value)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        designBrief.contentComplexity === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={designBrief.useRealData}
                    onChange={(e) => updateDesignBrief('useRealData', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Use realistic data and content (recommended)
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-7">
                  Generates contextual names, companies, and realistic content instead of generic placeholders
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Technical Specifications</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layout Pattern</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'card-grid', label: 'Card Grid', desc: 'Grid of cards/tiles' },
                    { value: 'sidebar', label: 'Sidebar Layout', desc: 'Main content + sidebar' },
                    { value: 'full-width', label: 'Full Width', desc: 'Full screen layout' },
                    { value: 'centered', label: 'Centered', desc: 'Centered content area' },
                    { value: 'dashboard', label: 'Dashboard', desc: 'Multi-section dashboard' },
                    { value: 'landing', label: 'Landing Page', desc: 'Marketing page layout' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateDesignBrief('layoutPattern', option.value)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        designBrief.layoutPattern === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Component Complexity</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'simple', label: 'Simple', desc: 'Basic components' },
                    { value: 'medium', label: 'Medium', desc: 'Moderate complexity' },
                    { value: 'advanced', label: 'Advanced', desc: 'Complex components' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateDesignBrief('componentComplexity', option.value)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        designBrief.componentComplexity === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interaction Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'static', label: 'Static', desc: 'No interactions' },
                    { value: 'basic', label: 'Basic', desc: 'Hover effects' },
                    { value: 'interactive', label: 'Interactive', desc: 'Rich interactions' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateDesignBrief('interactionLevel', option.value)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        designBrief.interactionLevel === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsive Priority</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'mobile-first', label: 'Mobile First', desc: 'Optimize for mobile' },
                    { value: 'desktop-first', label: 'Desktop First', desc: 'Optimize for desktop' },
                    { value: 'tablet-focus', label: 'Tablet Focus', desc: 'Optimize for tablets' },
                    { value: 'universal', label: 'Universal', desc: 'Equal optimization' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateDesignBrief('responsivePriority', option.value)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        designBrief.responsivePriority === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Design Request</h3>
            <p className="text-gray-600">
              Describe what you want to create. Our expert system will use your specifications above to generate a comprehensive design.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What component or interface would you like to create?
              </label>
              <textarea
                value={designBrief.prompt}
                onChange={(e) => updateDesignBrief('prompt', e.target.value)}
                placeholder="Example: Create a user dashboard for a project management app with task cards, progress charts, and team member avatars..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                rows={6}
              />
            </div>

            {/* Design Brief Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Design Brief Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium">Project:</span> {designBrief.projectType || 'Not specified'}</div>
                <div><span className="font-medium">Audience:</span> {designBrief.targetAudience || 'Not specified'}</div>
                <div><span className="font-medium">Style:</span> {designBrief.designSystem || 'Modern'}</div>
                <div><span className="font-medium">Colors:</span> {designBrief.colorScheme || 'Blue'}</div>
                <div><span className="font-medium">Industry:</span> {designBrief.industry || 'Generic'}</div>
                <div><span className="font-medium">Layout:</span> {designBrief.layoutPattern || 'Card grid'}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Expert Design Builder</h2>
              <p className="text-purple-100">Advanced 2-stage AI design generation</p>
            </div>
            <button
              onClick={onCancel}
              className="text-purple-200 hover:text-white text-xl transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    currentStep === step.id
                      ? 'bg-white text-purple-600'
                      : currentStep > step.id
                      ? 'bg-purple-400 text-white'
                      : 'bg-purple-700 text-purple-300'
                  }`}
                >
                  <span className="text-sm font-bold">{step.icon}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-8 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-purple-400' : 'bg-purple-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 mt-auto">
          <div className="text-sm text-gray-600">
            Step {currentStep} of {steps.length}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={loading || !designBrief.prompt.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Expert Design'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertDesignBuilder;