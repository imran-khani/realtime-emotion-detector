import { useState } from 'react'
import WebcamCapture from './components/WebcamCapture'
import EmotionDisplay from './components/EmotionDisplay'

function App() {
  const [emotionData, setEmotionData] = useState({
    emotion: 'neutral',
    confidence: 0
  });

  const handleEmotionDetected = (data) => {
    setEmotionData(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Real-time Emotion Detection
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <WebcamCapture onEmotionDetected={handleEmotionDetected} />
          <EmotionDisplay 
            emotion={emotionData.emotion} 
            confidence={emotionData.confidence} 
          />
        </div>
      </div>
    </div>
  )
}

export default App
