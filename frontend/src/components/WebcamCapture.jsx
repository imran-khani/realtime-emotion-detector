import { useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamCapture = ({ onEmotionDetected }) => {
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);

  const captureImage = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      try {
        const response = await axios.post('http://localhost:8000/api/detect/', {
          image: imageSrc
        });
        
        if (response.data) {
          onEmotionDetected(response.data);
        }
      } catch (error) {
        console.error('Error detecting emotion:', error);
      }
    }
  }, [onEmotionDetected]);

  useEffect(() => {
    // Capture and analyze every 1 second
    intervalRef.current = setInterval(captureImage, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [captureImage]);

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
    </div>
  );
};

export default WebcamCapture; 