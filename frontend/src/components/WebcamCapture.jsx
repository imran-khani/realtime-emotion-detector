import { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const MODELS_URLS = [
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
  'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights',
  '/models'
];

const LANDMARK_COLORS = {
  jaw: '#E91E63',
  nose: '#4CAF50',
  mouth: '#FFC107',
  leftEye: '#00BCD4',
  rightEye: '#2196F3',
  leftEyeBrow: '#9C27B0',
  rightEyeBrow: '#673AB7'
};

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
  const [showTracking, setShowTracking] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [detectionSensitivity, setDetectionSensitivity] = useState(0.5);
  const [trackingHistory, setTrackingHistory] = useState([]);

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
              faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelUrl),
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

  const drawFacialLandmarks = (ctx, landmarks) => {
    if (!landmarks) {
      console.log('No landmarks detected');
      return;
    }

    try {
      // Draw all landmark points with different colors for each feature
      const features = {
        jaw: landmarks.getJawOutline(),
        nose: landmarks.getNose(),
        mouth: landmarks.getMouth(),
        leftEye: landmarks.getLeftEye(),
        rightEye: landmarks.getRightEye(),
        leftEyeBrow: landmarks.getLeftEyeBrow(),
        rightEyeBrow: landmarks.getRightEyeBrow()
      };

      // Save current canvas state
      ctx.save();
      
      // Set line join for smoother connections
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      Object.entries(features).forEach(([feature, points]) => {
        if (!points || points.length === 0) {
          console.log(`No points for ${feature}`);
          return;
        }

        ctx.strokeStyle = LANDMARK_COLORS[feature];
        ctx.fillStyle = LANDMARK_COLORS[feature];
        ctx.lineWidth = 2;

        // Draw points with larger radius
        points.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Connect points with lines
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach((point, i) => {
          if (i > 0) {
            // Use quadratic curves for smoother lines
            const xc = (point.x + points[i - 1].x) / 2;
            const yc = (point.y + points[i - 1].y) / 2;
            ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
          }
        });
        
        // Close the path for eyes and mouth
        if (['leftEye', 'rightEye', 'mouth'].includes(feature)) {
          ctx.closePath();
        }
        ctx.stroke();

        // Draw feature labels if enabled
        if (showFeatures) {
          const center = points.reduce(
            (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
            { x: 0, y: 0 }
          );
          center.x /= points.length;
          center.y /= points.length;

          // Add background to text for better visibility
          ctx.font = 'bold 14px Arial';
          const text = feature.replace(/([A-Z])/g, ' $1').toLowerCase();
          const textWidth = ctx.measureText(text).width;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(center.x - textWidth/2 - 2, center.y - 12, textWidth + 4, 16);
          
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, center.x, center.y);
        }
      });

      // Restore canvas state
      ctx.restore();
    } catch (error) {
      console.error('Error drawing landmarks:', error);
    }
  };

  const updateTrackingHistory = (detection) => {
    const maxHistoryLength = 30; // Number of positions to track
    const newPosition = {
      x: detection.detection.box.x + detection.detection.box.width / 2,
      y: detection.detection.box.y + detection.detection.box.height / 2,
      timestamp: Date.now()
    };

    setTrackingHistory(prev => {
      const updated = [...prev, newPosition].slice(-maxHistoryLength);
      return updated;
    });
  };

  const drawTrackingPath = (ctx) => {
    if (!showTracking || trackingHistory.length < 2) return;

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trackingHistory[0].x, trackingHistory[0].y);
    
    trackingHistory.forEach((pos, i) => {
      if (i === 0) return;
      
      // Create smooth curve between points
      const xc = (pos.x + trackingHistory[i - 1].x) / 2;
      const yc = (pos.y + trackingHistory[i - 1].y) / 2;
      ctx.quadraticCurveTo(trackingHistory[i - 1].x, trackingHistory[i - 1].y, xc, yc);
      
      // Add fading effect
      const age = Date.now() - pos.timestamp;
      const opacity = Math.max(0, 1 - age / 1000); // Fade over 1 second
      ctx.strokeStyle = `rgba(0, 255, 0, ${opacity})`;
    });
    
    ctx.stroke();
  };

  const drawDetections = async (detections, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tracking path first (behind everything else)
    drawTrackingPath(ctx);

    // Draw face detection box
    if (showDetectionBox) {
      const box = detections.detection.box;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw center point
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(box.x + box.width/2, box.y + box.height/2, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw detailed facial landmarks
    if (showLandmarks) {
      drawFacialLandmarks(ctx, detections.landmarks);
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

    // Update tracking history
    updateTrackingHistory(detections);
  };

  const captureImage = useCallback(async () => {
    if (isLoading || !isModelLoaded || !webcamRef.current?.video) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const video = webcamRef.current.video;
      
      // Configure detection options with lower scoreThreshold for better detection
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,  // Reduced for better performance
        scoreThreshold: 0.3  // Lower threshold for better detection
      });

      // Detect faces with all features
      let detections = await faceapi
        .detectSingleFace(video, detectionOptions)
        .withFaceLandmarks(true)  // Use default landmark model
        .withFaceExpressions()
        .withAgeAndGender();

      // If detection fails with default model, try tiny model
      if (!detections) {
        console.log('Retrying with tiny landmark model...');
        detections = await faceapi
          .detectSingleFace(video, detectionOptions)
          .withFaceLandmarks(true, true)  // Use tiny landmark model
          .withFaceExpressions()
          .withAgeAndGender();
      }

      if (detections) {
        // Draw detections on canvas
        if (canvasRef.current) {
          // Ensure canvas dimensions match video
          const displaySize = {
            width: video.videoWidth,
            height: video.videoHeight
          };
          if (canvasRef.current.width !== displaySize.width || canvasRef.current.height !== displaySize.height) {
            faceapi.matchDimensions(canvasRef.current, displaySize);
          }

          // Get detections resized to match canvas
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          await drawDetections(resizedDetections, canvasRef.current);
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
        console.log('No face detected');
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
          onClick={() => setShowFeatures(prev => !prev)}
          className={`px-3 py-1 rounded-md text-sm ${
            showFeatures ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Feature Labels
        </button>
        <button
          onClick={() => setShowTracking(prev => !prev)}
          className={`px-3 py-1 rounded-md text-sm ${
            showTracking ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Face Tracking
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