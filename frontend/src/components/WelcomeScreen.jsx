/**
 * @file frontend/src/components/WelcomeScreen.jsx
 * @description This component is displayed to the user when they first open the application or when no session is selected.
 * It provides a welcoming message and offers several options for getting started, including creating a new session, using the Advanced Prompt Builder, or using the Expert Designer.
 * The component is designed to be visually appealing and to guide the user towards the most appropriate workflow for their needs.
 */
const WelcomeScreen = ({ 
  onCreateSession,
  onAdvancedBuilder,
  onExpertBuilder 
}) => {
  return (
    <div className="h-full overflow-y-auto scrollbar-hide pt-8 pb-8">
      <div className="max-w-4xl mx-auto text-center space-y-8 px-8">
        {/* Welcome Header */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <span className="text-white text-4xl">🎨</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to AI UI Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create beautiful, responsive UI components with AI. Start a new session or continue where you left off.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onCreateSession}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="text-xl">💬</span>
            <span>Simple Chat</span>
          </button>
          <button
            onClick={onAdvancedBuilder}
            className="flex items-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="text-xl">🎯</span>
            <span>Advanced Builder</span>
          </button>
          <button
            onClick={onExpertBuilder}
            className="flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="text-xl">🧠</span>
            <span>Expert Designer</span>
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div><strong>Simple Chat:</strong> Quick component generation with natural language</div>
          <div><strong>Advanced Builder:</strong> Structured component builder with 2-stage AI</div>
          <div><strong>Expert Designer:</strong> Professional design system with comprehensive specifications</div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">Choose Your Design Approach</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h4 className="font-semibold text-blue-900 mb-2">Simple Chat</h4>
              <p className="text-sm text-blue-700">
                Natural language prompts with instant results. Perfect for quick prototypes and simple components.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="font-semibold text-green-900 mb-2">Advanced Builder</h4>
              <p className="text-sm text-green-700">
                Structured component builder with customization options and 2-stage AI generation for refined results.
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h4 className="font-semibold text-purple-900 mb-2">Expert Designer</h4>
              <p className="text-sm text-purple-700">
                Professional design system with comprehensive specifications, industry context, and expert-level output.
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-left max-w-3xl mx-auto">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🚀</span>
            Getting Started with AI UI Generation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 mb-1">Simple Chat</div>
              <div className="text-blue-700">Start with "Create a..." and describe your component naturally</div>
            </div>
            <div>
              <div className="font-medium text-green-800 mb-1">Advanced Builder</div>
              <div className="text-green-700">Use the guided flow for structured, customizable components</div>
            </div>
            <div>
              <div className="font-medium text-purple-800 mb-1">Expert Designer</div>
              <div className="text-purple-700">Comprehensive design specifications for professional results</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;