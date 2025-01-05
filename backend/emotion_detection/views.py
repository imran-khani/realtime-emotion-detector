from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .emotion_detector import EmotionDetector

class EmotionDetectionView(APIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.detector = EmotionDetector()

    def post(self, request, *args, **kwargs):
        try:
            image_data = request.data.get('image')
            if not image_data:
                return Response(
                    {'error': 'No image data provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Process the image synchronously for REST API
            emotion, confidence = self.detector._process_image(image_data)
            
            return Response({
                'emotion': emotion,
                'confidence': confidence
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
