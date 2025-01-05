from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import cv2
import numpy as np
import tensorflow as tf
import base64
from io import BytesIO
from PIL import Image
from .model import create_emotion_model, preprocess_face

class EmotionDetectionView(APIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize face detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Emotions we'll detect
        self.emotions = ['angry', 'happy', 'neutral', 'sad', 'surprised']
        
        # Create and initialize the model
        self.model = create_emotion_model()
        # TODO: Load pre-trained weights when available
        # self.model.load_weights('path_to_weights.h5')

    def preprocess_image(self, base64_image):
        # Decode base64 image
        try:
            # Remove data URL prefix if present
            if 'base64,' in base64_image:
                base64_image = base64_image.split('base64,')[1]
            
            # Convert base64 to PIL Image
            image_data = base64.b64decode(base64_image)
            image = Image.open(BytesIO(image_data))
            
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            
            return gray, cv_image
        except Exception as e:
            print(f"Error preprocessing image: {str(e)}")
            return None, None

    def detect_face(self, gray_image):
        faces = self.face_cascade.detectMultiScale(
            gray_image,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        if len(faces) == 0:
            return None
        
        # Get the largest face
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_face
        
        return gray_image[y:y+h, x:x+w]

    def predict_emotion(self, face_image):
        try:
            # Preprocess face for the model
            processed_face = preprocess_face(face_image)
            
            # Make prediction
            predictions = self.model.predict(processed_face, verbose=0)
            
            # Get the highest confidence prediction
            emotion_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][emotion_idx])
            
            return self.emotions[emotion_idx], confidence
        except Exception as e:
            print(f"Error predicting emotion: {str(e)}")
            return 'unknown', 0.0

    def post(self, request):
        try:
            # Get image data from request
            image_data = request.data.get('image')
            if not image_data:
                return Response(
                    {'error': 'No image data provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Preprocess image
            gray_image, cv_image = self.preprocess_image(image_data)
            if gray_image is None:
                return Response(
                    {'error': 'Invalid image data'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Detect face
            face = self.detect_face(gray_image)
            if face is None:
                return Response({
                    'emotion': 'unknown',
                    'confidence': 0,
                    'message': 'No face detected'
                })

            # Predict emotion
            emotion, confidence = self.predict_emotion(face)
            
            return Response({
                'emotion': emotion,
                'confidence': confidence
            })

        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 