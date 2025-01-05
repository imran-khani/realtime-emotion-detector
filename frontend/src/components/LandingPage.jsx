const LandingPage = ({ onStartDemo }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
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
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Real-time Emotion Detection
          </h1>
          <p className="mt-6 text-xl text-gray-700 max-w-3xl">
            Experience the future of emotional intelligence. Our advanced AI technology 
            detects and analyzes emotions in real-time, helping you understand emotional 
            patterns and responses like never before.
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon="🎯"
            title="Real-time Analysis"
            description="Instant emotion detection with high accuracy and low latency."
          />
          <Feature
            icon="📊"
            title="Detailed Analytics"
            description="Track emotional patterns and trends over time with comprehensive statistics."
          />
          <Feature
            icon="🔒"
            title="Privacy First"
            description="All processing happens locally in your browser. No data is stored or transmitted."
          />
          <Feature
            icon="⚡"
            title="High Performance"
            description="Optimized for smooth performance with adjustable detection frequency."
          />
          <Feature
            icon="📱"
            title="User Friendly"
            description="Intuitive interface with easy-to-understand emotion visualization."
          />
          <Feature
            icon="💾"
            title="Data Export"
            description="Download your emotion history for further analysis or record-keeping."
          />
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
            Powered by Advanced Technology
          </h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-4">
            <TechItem
              src="https://www.tensorflow.org/images/tf_logo_social.png"
              alt="TensorFlow"
              name="TensorFlow"
            />
            <TechItem
              src="https://opencv.org/wp-content/uploads/2020/07/OpenCV_logo_black-2.png"
              alt="OpenCV"
              name="OpenCV"
            />
            <TechItem
              src="https://www.django-rest-framework.org/img/logo.png"
              alt="Django REST"
              name="Django REST"
            />
            <TechItem
              src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
              alt="React"
              name="React"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, description }) => (
  <div className="relative p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TechItem = ({ src, alt, name }) => (
  <div className="flex flex-col items-center">
    <img src={src} alt={alt} className="h-12 object-contain" />
    <p className="mt-2 text-sm text-gray-500">{name}</p>
  </div>
);

export default LandingPage; 