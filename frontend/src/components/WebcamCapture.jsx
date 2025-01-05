import { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const MODELS_URLS = [
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
  'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights',
  '/models'
];

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
  const [showAgeGender, setShowAgeGender] = useState(false);
  const [showMesh, setShowMesh] = useState(false);
  const [showExpressions, setShowExpressions] = useState(true);
  const [detectionSensitivity, setDetectionSensitivity] = useState(0.5);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        
        // Configure model loading
        faceapi.env.monkeyPatch({
          Canvas: HTMLCanvasElement,
          Image: HTMLImageElement,
          ImageData: ImageData,
          Video: HTMLVideoElement,
          createCanvasElement: () => document.createElement('canvas'),
          createImageElement: () => document.createElement('img')
        });

        // Try loading models from different URLs
        let lastError = null;
        for (const modelUrl of MODELS_URLS) {
          try {
            console.log(`Attempting to load models from ${modelUrl}...`);
            
            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
              faceapi.nets.faceExpressionNet.loadFromUri(modelUrl),
              faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
              faceapi.nets.ageGenderNet.loadFromUri(modelUrl)
            ]);

            console.log(`Successfully loaded models from ${modelUrl}`);
            setIsModelLoaded(true);
            setError(null);
            return; // Success, exit the loop
          } catch (err) {
            console.error(`Failed to load from ${modelUrl}:`, err);
            lastError = err;
          }
        }

        // If we get here, all URLs failed
        throw lastError || new Error('Failed to load models from all sources');
      } catch (err) {
        console.error('Error loading models:', err);
        setError(`Failed to load models. Please check your internet connection and try refreshing the page.`);
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

  const drawDetections = async (detections, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face detection box
    if (showDetectionBox) {
      const box = detections.detection.box;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    }

    // Draw facial landmarks
    if (showLandmarks) {
      const landmarks = detections.landmarks;
      ctx.fillStyle = '#00ff00';
      landmarks.positions.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw face mesh
    if (showMesh) {
      const mesh = detections.landmarks;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;

      // Draw lines between landmarks
      const drawLine = (point1, point2) => {
        ctx.beginPath();
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.stroke();
      };

      // Connect jaw points
      for (let i = 0; i < 16; i++) {
        drawLine(mesh.positions[i], mesh.positions[i + 1]);
      }

      // Connect nose points
      for (let i = 27; i < 35; i++) {
        drawLine(mesh.positions[i], mesh.positions[i + 1]);
      }

      // Connect eyes
      for (let i = 36; i < 41; i++) {
        drawLine(mesh.positions[i], mesh.positions[i + 1]);
      }
      drawLine(mesh.positions[41], mesh.positions[36]);

      for (let i = 42; i < 47; i++) {
        drawLine(mesh.positions[i], mesh.positions[i + 1]);
      }
      drawLine(mesh.positions[47], mesh.positions[42]);

      // Connect mouth
      for (let i = 48; i < 59; i++) {
        drawLine(mesh.positions[i], mesh.positions[i + 1]);
      }
      drawLine(mesh.positions[59], mesh.positions[48]);

      for (let i = 60; i < 67; i++) {
        drawLine(mesh.positions[i], mesh.positions[i + 1]);
      }
      drawLine(mesh.positions[67], mesh.positions[60]);
    }

    // Draw expressions
    if (showExpressions) {
      const expressions = detections.expressions;
      const barWidth = 100;
      const barHeight = 10;
      let startY = 10;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(10, startY - 5, 200, Object.keys(expressions).length * 20 + 10);

      Object.entries(expressions).forEach(([expression, confidence]) => {
        // Background bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(15, startY, barWidth, barHeight);
        
        // Confidence bar
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(15, startY, barWidth * confidence, barHeight);
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(`${expression}: ${(confidence * 100).toFixed(0)}%`, 120, startY + 8);
        
        startY += 20;
      });
    }

    // Draw age and gender
    if (showAgeGender && detections.age && detections.gender) {
      const { age, gender, genderProbability } = detections;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(detections.detection.box.x - 10, detections.detection.box.y - 50, 200, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${Math.round(age)} years old`,
        detections.detection.box.x,
        detections.detection.box.y - 30
      );
      ctx.fillText(
        `${gender} (${(genderProbability * 100).toFixed(1)}%)`,
        detections.detection.box.x,
        detections.detection.box.y - 10
      );
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
        .withFaceExpressions()
        .withAgeAndGender();

      if (detections) {
        // Draw detections on canvas
        if (canvasRef.current) {
          await drawDetections(detections, canvasRef.current);
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

        // Send detection data to parent
        onEmotionDetected({ 
          emotion, 
          confidence,
          timestamp: Date.now(),
          expressions: detections.expressions,
          age: detections.age,
          gender: detections.gender,
          genderProbability: detections.genderProbability,
          landmarks: showLandmarks ? detections.landmarks.positions : null,
          box: detections.detection.box
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
  }, [onEmotionDetected, isLoading, isModelLoaded, detectionSensitivity, showLandmarks]);

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
          Face Box
        </button>
        <button
          onClick={() => setShowLandmarks(prev => !prev)}
          className={`px-3 py-1 rounded-md text-sm ${
            showLandmarks ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Landmarks
        </button>
        <button
          onClick={() => setShowMesh(prev => !prev)}
          className={`px-3 py-1 rounded-md text-sm ${
            showMesh ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Face Mesh
        </button>
        <button
          onClick={() => setShowExpressions(prev => !prev)}
          className={`px-3 py-1 rounded-md text-sm ${
            showExpressions ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Expressions
        </button>
        <button
          onClick={() => setShowAgeGender(prev => !prev)}
          className={`px-3 py-1 rounded-md text-sm ${
            showAgeGender ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Age/Gender
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
            <p className="text-lg font-semibold mb-2">Loading detection models...</p>
            <p className="text-sm opacity-80">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture; 