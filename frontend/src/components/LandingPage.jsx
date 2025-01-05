const LandingPage = ({ onStartDemo }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1587614382346-4ec70e388b28?q=80&w=2070"
            alt="AI Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/30 to-indigo-700/30" />
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Browser-based Emotion Detection
          </h1>
          <p className="mt-6 text-xl text-gray-700 dark:text-gray-300 max-w-3xl">
            Experience real-time emotion detection powered by face-api.js. Our application 
            runs entirely in your browser, ensuring privacy and fast response times while 
            delivering accurate emotion analysis.
          </p>
          <div className="mt-10">
            <button
              onClick={onStartDemo}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
            >
              Start Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
          Comprehensive Feature Set
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon="⚡"
            title="Client-side Processing"
            description="All emotion detection runs directly in your browser for instant results."
          />
          <Feature
            icon="🔒"
            title="Complete Privacy"
            description="No server communication needed - your data never leaves your device."
          />
          <Feature
            icon="📊"
            title="Real-time Analytics"
            description="Track emotional patterns and trends with live updates and statistics."
          />
          <Feature
            icon="🎯"
            title="High Accuracy"
            description="Powered by face-api.js, using advanced neural networks for reliable detection."
          />
          <Feature
            icon="📱"
            title="No Installation"
            description="Works instantly in your browser - no downloads or setup required."
          />
          <Feature
            icon="💾"
            title="Data Export"
            description="Save your emotion history locally for personal analysis."
          />
          <Feature
            icon="🌓"
            title="Dark/Light Theme"
            description="Customizable interface that adapts to your preferred viewing mode."
          />
          <Feature
            icon="⚙️"
            title="Adjustable Settings"
            description="Customize detection frequency and automatic detection preferences."
          />
          <Feature
            icon="📈"
            title="Emotion Trends"
            description="Visual representation of your emotional patterns over time."
          />
          <Feature
            icon="🎥"
            title="Live Preview"
            description="Real-time webcam feed with instant emotion feedback."
          />
          <Feature
            icon="📱"
            title="Responsive Design"
            description="Optimized for both desktop and mobile devices."
          />
          <Feature
            icon="🔄"
            title="Auto-Detection"
            description="Toggle between automatic and manual emotion detection modes."
          />
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-8">
            Powered by Modern Web Technologies
          </h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <TechItem
              icon="🤖"
              name="face-api.js"
              isIcon={true}
            />
            <TechItem
              src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
              alt="React"
              name="React"
            />
            <TechItem
              src="https://vitejs.dev/logo.svg"
              alt="Vite"
              name="Vite"
            />
            <TechItem
              src="https://tailwindcss.com/favicons/apple-touch-icon.png"
              alt="Tailwind CSS"
              name="Tailwind CSS"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, description }) => (
  <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:scale-105 duration-300">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const TechItem = ({ src, alt, name, icon, isIcon }) => (
  <div className="flex flex-col items-center">
    {isIcon ? (
      <div className="text-4xl mb-2">{icon}</div>
    ) : (
      <img src={src} alt={alt} className="h-12 object-contain dark:invert" />
    )}
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{name}</p>
  </div>
);

export default LandingPage; 