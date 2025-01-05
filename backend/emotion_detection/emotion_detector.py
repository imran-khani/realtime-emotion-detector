import cv2
import numpy as np
import base64
import tensorflow as tf
from tensorflow.keras.models import load_model
import asyncio
from concurrent.futures import ThreadPoolExecutor

class EmotionDetector:
    def __init__(self):
        # Load face detection cascade
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Initialize model (you'll need to train or download a pre-trained model)
        # self.model = load_model('path_to_your_model')
        
        # Emotion labels
        self.emotions = ['angry', 'happy', 'neutral', 'sad', 'surprised']
        
        # Thread pool for CPU-intensive operations
        self.executor = ThreadPoolExecutor(max_workers=2)

    def _process_image(self, image_data):
        # Decode base64 image
        encoded_data = image_data.split(',')[1] if ',' in image_data else image_data
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return 'unknown', 0.0
            
        # Process the first face found
        x, y, w, h = faces[0]
        roi_gray = gray[y:y+h, x:x+w]
        
        # Preprocess for model
        roi_gray = cv2.resize(roi_gray, (48, 48))
        roi_gray = roi_gray.astype('float') / 255.0
        roi_gray = np.expand_dims(roi_gray, axis=[0, -1])
        
        # For testing without a model
        # Return random emotion and confidence
        emotion_idx = np.random.randint(0, len(self.emotions))
        confidence = np.random.uniform(0.7, 1.0)
        
        # When you have a model:
        # predictions = self.model.predict(roi_gray)
        # emotion_idx = np.argmax(predictions[0])
        # confidence = predictions[0][emotion_idx]
        
        return self.emotions[emotion_idx], float(confidence)

    async def detect_emotion(self, image_data):
        # Run CPU-intensive operations in a thread pool
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(self.executor, self._process_image, image_data)
        return result 