import { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

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
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Failed to load emotion detection models');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const captureImage = useCallback(async () => {
    if (isLoading || !isModelLoaded) return;

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setHasWebcamPermission(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Create an HTML image element from the screenshot
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => { img.onload = resolve; });

      // Detect faces and expressions
      const detections = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections) {
        // Map face-api expressions to our emotion format
        const expressions = detections.expressions;
        const emotionMap = {
          happy: expressions.happy,
          sad: expressions.sad,
          angry: expressions.angry,
          surprised: expressions.surprised,
          neutral: expressions.neutral
        };

        // Find the emotion with highest confidence
        const [emotion, confidence] = Object.entries(emotionMap)
          .reduce((prev, curr) => curr[1] > prev[1] ? curr : prev);

        onEmotionDetected({ emotion, confidence });
      } else {
        onEmotionDetected({ emotion: 'unknown', confidence: 0 });
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
      setError('Failed to detect emotion');
    } finally {
      setIsLoading(false);
    }
  }, [onEmotionDetected, isLoading, isModelLoaded]);

  useEffect(() => {
    if (isAutoDetecting && isModelLoaded) {
      intervalRef.current = setInterval(captureImage, detectionFrequency);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [captureImage, detectionFrequency, isAutoDetecting, isModelLoaded]);

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
          disabled={isLoading || !isModelLoaded}
          className={`
            absolute bottom-4 right-4 px-4 py-2 rounded-full
            bg-white shadow-lg text-sm font-medium
            transition-all transform hover:scale-105
            ${(isLoading || !isModelLoaded) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
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

      {!isModelLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg">
          <div className="text-white text-center">
            <p className="text-lg font-semibold mb-2">Loading emotion detection models...</p>
            <p className="text-sm opacity-80">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture; 