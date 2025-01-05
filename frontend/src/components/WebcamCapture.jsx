import { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const WebcamCapture = ({ 
  onEmotionDetected,
  detectionFrequency = 2000,
  isAutoDetecting = true
}) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasWebcamPermission, setHasWebcamPermission] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [showDetectionBox, setShowDetectionBox] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [detectionSensitivity, setDetectionSensitivity] = useState(0.5);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isDrawingRegion, setIsDrawingRegion] = useState(false);
  const [showExpressionBars, setShowExpressionBars] = useState(false);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'), // For facial landmarks
          faceapi.nets.faceRecognitionNet.loadFromUri('/models') // For better accuracy
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

  // Setup canvas overlay
  useEffect(() => {
    if (webcamRef.current && canvasRef.current) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      if (video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    }
  }, []);

  const drawDetections = (detections, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showDetectionBox && detections) {
      // Draw face detection box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        detections.detection.box.x,
        detections.detection.box.y,
        detections.detection.box.width,
        detections.detection.box.height
      );
    }

    if (showLandmarks && detections.landmarks) {
      // Draw facial landmarks
      const points = detections.landmarks.positions;
      ctx.fillStyle = '#00ff00';
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    if (showExpressionBars && detections.expressions) {
      // Draw expression confidence bars
      const expressions = detections.expressions;
      const barWidth = 100;
      const barHeight = 10;
      let startY = 10;

      Object.entries(expressions).forEach(([expression, confidence]) => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, startY, barWidth, barHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(10, startY, barWidth * confidence, barHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(`${expression}: ${(confidence * 100).toFixed(0)}%`, 120, startY + 8);
        
        startY += 20;
      });
    }
  };

  const captureImage = useCallback(async () => {
    if (isLoading || !isModelLoaded || !webcamRef.current?.video) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const video = webcamRef.current.video;
      
      // Configure detection options
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: detectionSensitivity
      });

      // Detect faces with all features
      const detections = await faceapi
        .detectSingleFace(video, detectionOptions)
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections) {
        // Draw detections on canvas
        if (canvasRef.current) {
          drawDetections(detections, canvasRef.current);
        }

        // Check if detection is within selected region (if any)
        if (selectedRegion) {
          const box = detections.detection.box;
          const isInRegion = (
            box.x >= selectedRegion.x &&
            box.y >= selectedRegion.y &&
            (box.x + box.width) <= (selectedRegion.x + selectedRegion.width) &&
            (box.y + box.height) <= (selectedRegion.y + selectedRegion.height)
          );
          
          if (!isInRegion) {
            onEmotionDetected({ emotion: 'unknown', confidence: 0 });
            return;
          }
        }

        // Map face-api expressions to our emotion format
        const expressions = detections.expressions;
        const emotionMap = {
          happy: expressions.happy,
          sad: expressions.sad,
          angry: expressions.angry,
          surprised: expressions.surprised,
          neutral: expressions.neutral,
          fearful: expressions.fearful,
          disgusted: expressions.disgusted
        };

        // Find the emotion with highest confidence
        const [emotion, confidence] = Object.entries(emotionMap)
          .reduce((prev, curr) => curr[1] > prev[1] ? curr : prev);

        // Calculate average emotion stability over time
        // Add additional metadata to the emotion detection
        onEmotionDetected({ 
          emotion, 
          confidence,
          timestamp: Date.now(),
          expressions: detections.expressions,
          box: detections.detection.box,
          landmarks: showLandmarks ? detections.landmarks.positions : null
        });
      } else {
        onEmotionDetected({ emotion: 'unknown', confidence: 0 });
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
      setError('Failed to detect emotion');
    } finally {
      setIsLoading(false);
    }
  }, [onEmotionDetected, isLoading, isModelLoaded, detectionSensitivity, selectedRegion, showLandmarks]);

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

  // Handle region selection
  const handleCanvasClick = useCallback((e) => {
    if (!isDrawingRegion) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!selectedRegion) {
      setSelectedRegion({ x, y, width: 0, height: 0 });
    } else {
      setSelectedRegion({
        x: Math.min(x, selectedRegion.x),
        y: Math.min(y, selectedRegion.y),
        width: Math.abs(x - selectedRegion.x),
        height: Math.abs(y - selectedRegion.y)
      });
      setIsDrawingRegion(false);
    }
  }, [isDrawingRegion, selectedRegion]);

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
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap gap-4">
        <button
          onClick={() => setShowDetectionBox(prev => !prev)}
          className={`px-3 py-1 rounded-md text-sm ${
            showDetectionBox ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Detection Box
        </button>
        <button
          onClick={() => setShowLandmarks(prev => !prev)}
          className={`px-3 py-1 rounded-md text-sm ${
            showLandmarks ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Facial Landmarks
        </button>
        <button
          onClick={() => setShowExpressionBars(prev => !prev)}
          className={`px-3 py-1 rounded-md text-sm ${
            showExpressionBars ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Expression Bars
        </button>
        <button
          onClick={() => {
            setIsDrawingRegion(true);
            setSelectedRegion(null);
          }}
          className={`px-3 py-1 rounded-md text-sm ${
            isDrawingRegion ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Select Region
        </button>
      </div>

      {/* Sensitivity Slider */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Detection Sensitivity: {(detectionSensitivity * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={detectionSensitivity}
          onChange={(e) => setDetectionSensitivity(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      
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