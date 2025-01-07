import { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const MODELS_URLS = [
  '/models', // Prioritize local models
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
  'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'
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
  detectionFrequency = 10,
  isAutoDetecting = true
}) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasWebcamPermission, setHasWebcamPermission] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showExpressions, setShowExpressions] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showMesh, setShowMesh] = useState(false);
  const [detectionSensitivity, setDetectionSensitivity] = useState(0.5);
  const [trackingHistory, setTrackingHistory] = useState([]);

  // Add RAF handling for smooth rendering
  const rafId = useRef(null);
  const lastDetectionTime = useRef(0);
  const processingFrame = useRef(false);

  // Add smoothing for tracking and age
  const smoothedValues = useRef({
    position: { x: 0, y: 0 },
    age: 0,
    alpha: 0.8 // Smoothing factor (0-1), higher = more smoothing
  });

  const smoothValue = (newValue, oldValue, alpha = performanceSettings.current.smoothingFactor) => {
    if (oldValue === undefined) return newValue;
    return oldValue + alpha * (newValue - oldValue);
  };

  // Optimized performance settings
  const performanceSettings = useRef({
    lastDrawTime: 0,
    drawFrequency: 30, // 30fps for smoother balance
    minProcessingTime: 30, // Balance between performance and smoothness
    skippedFrames: 0,
    maxSkippedFrames: 3,
    bufferSize: 4, // Balanced buffer size
    detectionBuffer: [],
    smoothingFactor: 0.7 // Balanced smoothing
  });

  // Add faceapi state
  const [faceapi, setFaceapi] = useState(null);

  // Improved smoothing function with configurable buffer
  const smoothDetection = (detection) => {
    const buffer = performanceSettings.current.detectionBuffer;
    buffer.push(detection);
    
    // Keep buffer at desired size
    if (buffer.length > performanceSettings.current.bufferSize) {
      buffer.shift();
    }

    // If buffer isn't full yet, return current detection
    if (buffer.length < 2) return detection;

    // Calculate smoothed values
    const smoothed = {
      detection: {
        box: {
          x: buffer.reduce((sum, d) => sum + d.detection.box.x, 0) / buffer.length,
          y: buffer.reduce((sum, d) => sum + d.detection.box.y, 0) / buffer.length,
          width: buffer.reduce((sum, d) => sum + d.detection.box.width, 0) / buffer.length,
          height: buffer.reduce((sum, d) => sum + d.detection.box.height, 0) / buffer.length
        }
      },
      expressions: {},
      age: buffer.reduce((sum, d) => sum + d.age, 0) / buffer.length,
      gender: detection.gender,
      genderProbability: detection.genderProbability,
      landmarks: detection.landmarks
    };

    // Smooth expressions
    const expressions = {};
    Object.keys(detection.expressions).forEach(expr => {
      expressions[expr] = buffer.reduce((sum, d) => sum + d.expressions[expr], 0) / buffer.length;
    });
    smoothed.expressions = expressions;

    return smoothed;
  };

  // Load only required models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        
        // Dynamically import face-api
        const faceapiModule = await import('face-api.js');
        setFaceapi(faceapiModule);
        
        faceapiModule.env.monkeyPatch({
          Canvas: HTMLCanvasElement,
          Image: HTMLImageElement,
          ImageData: ImageData,
          Video: HTMLVideoElement,
          createCanvasElement: () => document.createElement('canvas'),
          createImageElement: () => document.createElement('img')
        });

        let lastError = null;
        for (const modelUrl of MODELS_URLS) {
          try {
            console.log(`Loading models from ${modelUrl}...`);
            
            // Load all required models
            await Promise.all([
              faceapiModule.nets.tinyFaceDetector.loadFromUri(modelUrl),
              faceapiModule.nets.faceExpressionNet.loadFromUri(modelUrl),
              faceapiModule.nets.faceLandmark68TinyNet.loadFromUri(modelUrl)
            ]);

            console.log(`Models loaded from ${modelUrl}`);
            setIsModelLoaded(true);
            setError(null);
            return;
          } catch (err) {
            console.error(`Failed to load from ${modelUrl}:`, err);
            lastError = err;
          }
        }

        throw lastError || new Error('Failed to load models');
      } catch (err) {
        console.error('Error loading models:', err);
        setError(`Failed to load models. Please refresh the page.`);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []); // Remove showLandmarks dependency

  // Setup canvas overlay
  useEffect(() => {
    const setupCanvas = () => {
      if (webcamRef.current?.video && canvasRef.current) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        
        // Set canvas size to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }
    };

    // Initial setup
    setupCanvas();

    // Setup when video loads
    if (webcamRef.current?.video) {
      webcamRef.current.video.addEventListener('loadeddata', setupCanvas);
    }

    return () => {
      if (webcamRef.current?.video) {
        webcamRef.current.video.removeEventListener('loadeddata', setupCanvas);
      }
    };
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

  const updateTrackingHistory = useCallback((detection) => {
    const maxHistoryLength = 30; // Reduced for better performance
    const box = detection.detection.box;
    
    // Calculate center point
    const newX = box.x + box.width / 2;
    const newY = box.y + box.height / 2;

    // Apply stronger smoothing for more stable tracking
    smoothedValues.current.position.x = smoothValue(
      newX,
      smoothedValues.current.position.x,
      0.6 // Increased smoothing
    );
    smoothedValues.current.position.y = smoothValue(
      newY,
      smoothedValues.current.position.y,
      0.6 // Increased smoothing
    );

    const newPosition = {
      x: smoothedValues.current.position.x,
      y: smoothedValues.current.position.y,
      timestamp: Date.now()
    };

    setTrackingHistory(prev => {
      const updated = [...prev, newPosition].slice(-maxHistoryLength);
      return updated;
    });
  }, []);

  const drawTrackingPath = (ctx) => {
    if (!showTracking || trackingHistory.length < 2) return;

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trackingHistory[0].x, trackingHistory[0].y);
    
    // Use Bezier curves for smoother path
    for (let i = 1; i < trackingHistory.length - 2; i++) {
      const xc = (trackingHistory[i].x + trackingHistory[i + 1].x) / 2;
      const yc = (trackingHistory[i].y + trackingHistory[i + 1].y) / 2;
      
      // Bezier curve control points
      const cp1x = trackingHistory[i].x;
      const cp1y = trackingHistory[i].y;
      const cp2x = xc;
      const cp2y = yc;
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, xc, yc);
      
      // Add fading effect
      const age = Date.now() - trackingHistory[i].timestamp;
      const opacity = Math.max(0, 1 - age / 2000); // Slower fade (2 seconds)
      ctx.strokeStyle = `rgba(0, 255, 0, ${opacity})`;
    }
    
    ctx.stroke();
  };

  const drawDetections = async (detections, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tracking path first (behind everything else)
    drawTrackingPath(ctx);

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

    // Update tracking history
    updateTrackingHistory(detections);
  };

  const processFrame = useCallback(async () => {
    if (!webcamRef.current?.video || !canvasRef.current || !isModelLoaded) {
      rafId.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const now = performance.now();

    // Ensure video is ready
    if (video.readyState !== 4) {
      rafId.current = requestAnimationFrame(processFrame);
      return;
    }

    // Check if we should process this frame
    const timeSinceLastDetection = now - lastDetectionTime.current;
    const shouldProcessFrame = !processingFrame.current && 
      timeSinceLastDetection >= detectionFrequency &&
      performanceSettings.current.skippedFrames <= performanceSettings.current.maxSkippedFrames;

    // Update canvas size if needed
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
      faceapi.matchDimensions(canvas, displaySize);
    }

    if (shouldProcessFrame) {
      const processStart = performance.now();
      processingFrame.current = true;
      lastDetectionTime.current = now;

      try {
        // Optimized detection options
        const detectionOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: 160, // Back to original size
          scoreThreshold: 0.3 // Back to original threshold
        });

        const detections = await faceapi
          .detectSingleFace(video, detectionOptions)
          .withFaceLandmarks(true)
          .withFaceExpressions();

        if (detections) {
          // Apply smoothing to detections
          const smoothedDetections = smoothDetection(detections);

          // Clear and draw
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Resize and draw
          const resizedDetections = faceapi.resizeResults(smoothedDetections, displaySize);
          await drawDetections(resizedDetections, canvas);

          // Process emotions
          const expressions = smoothedDetections.expressions;
          const emotionMap = {
            happy: expressions.happy,
            sad: expressions.sad,
            angry: expressions.angry,
            surprised: expressions.surprised,
            neutral: expressions.neutral,
            fearful: expressions.fearful,
            disgusted: expressions.disgusted
          };

          const [emotion, confidence] = Object.entries(emotionMap)
            .reduce((prev, curr) => curr[1] > prev[1] ? curr : prev);

          onEmotionDetected({
            emotion,
            confidence,
            timestamp: now,
            expressions: smoothedDetections.expressions,
            landmarks: showLandmarks ? smoothedDetections.landmarks.positions : null,
            box: smoothedDetections.detection.box
          });

          performanceSettings.current.skippedFrames = 0;
        }

        const processingTime = performance.now() - processStart;
        if (processingTime > performanceSettings.current.minProcessingTime) {
          performanceSettings.current.skippedFrames++;
        }
      } catch (error) {
        console.error('Frame processing error:', error);
        performanceSettings.current.skippedFrames++;
      } finally {
        processingFrame.current = false;
      }
    }

    rafId.current = requestAnimationFrame(processFrame);
  }, [isModelLoaded, onEmotionDetected, detectionFrequency, showLandmarks, drawDetections]);

  // Start/stop frame processing
  useEffect(() => {
    if (isAutoDetecting && isModelLoaded && webcamRef.current?.video) {
      // Start processing frames
      processFrame();
      
      return () => {
        // Cleanup
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
      };
    }
  }, [isAutoDetecting, isModelLoaded, processFrame]);

  // Remove the old interval-based detection
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

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
    <div className="relative w-full h-full">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover rounded-none"
        videoConstraints={{
          width: 320,
          height: 240,
          facingMode: "user"
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      
      {/* Compact Controls */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        <button
          onClick={() => setShowLandmarks(prev => !prev)}
          className={`p-1 rounded-full ${
            showLandmarks ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-700'
          } hover:bg-indigo-500 hover:text-white transition-colors text-xs`}
          title="Toggle Landmarks"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

      {/* Loading and error states */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-4 m-2 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isModelLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-white text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading detection models...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture; 