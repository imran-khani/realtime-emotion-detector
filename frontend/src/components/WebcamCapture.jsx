import { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamCapture = ({ onEmotionDetected }) => {
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
    // Capture and analyze every 2 seconds (reduced from 1 second for better performance)
    intervalRef.current = setInterval(captureImage, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [captureImage]);

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