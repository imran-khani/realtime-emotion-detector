import { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamCapture = ({ 
  onEmotionDetected,
  detectionFrequency = 2000,
  isAutoDetecting = true
}) => {
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasWebcamPermission, setHasWebcamPermission] = useState(true);

  const captureImage = useCallback(async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setHasWebcamPermission(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:8000/api/detect/', {
        image: imageSrc
      });
      
      if (response.data) {
        onEmotionDetected(response.data);
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
      setError(error.response?.data?.error || 'Failed to detect emotion');
    } finally {
      setIsLoading(false);
    }
  }, [onEmotionDetected, isLoading]);

  useEffect(() => {
    if (isAutoDetecting) {
      // Start detection with the specified frequency
      intervalRef.current = setInterval(captureImage, detectionFrequency);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear interval if auto-detection is disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [captureImage, detectionFrequency, isAutoDetecting]);

  if (!hasWebcamPermission) {
    return (
      <div className="p-4 text-center bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">
          Please allow camera access to detect emotions.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        className="w-full rounded-lg shadow-lg"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: "user"
        }}
      />
      
      {!isAutoDetecting && (
        <button
          onClick={captureImage}
          disabled={isLoading}
          className={`
            absolute bottom-4 right-4 px-4 py-2 rounded-full
            bg-white shadow-lg text-sm font-medium
            transition-all transform hover:scale-105
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
          `}
        >
          {isLoading ? 'Detecting...' : 'Detect Emotion'}
        </button>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default WebcamCapture; 