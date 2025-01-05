import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import cv2
import numpy as np
import tensorflow as tf
from .model import create_emotion_model, preprocess_face

class EmotionDetectionConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = 'emotion_detection'
        self.face_cascade = None
        self.model = None
        self.emotions = ['angry', 'happy', 'neutral', 'sad', 'surprised']

    async def connect(self):
        # Initialize OpenCV and TensorFlow models
        await self.initialize_models()
        
        # Add to room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Send connection status
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to emotion detection server'
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    @sync_to_async
    def initialize_models(self):
        # Initialize face detection
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        # Initialize emotion detection model
        self.model = create_emotion_model()
        # TODO: Load pre-trained weights when available
        # self.model.load_weights('path_to_weights.h5')

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            event_type = text_data_json.get('type')
            
            if event_type == 'emotion_detected':
                emotion_data = text_data_json.get('data')
                # Process emotion data
                await self.process_emotion(emotion_data)
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def process_emotion(self, emotion_data):
        try:
            # Process emotion data and broadcast to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'emotion_update',
                    'data': emotion_data
                }
            )
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error processing emotion: {str(e)}'
            }))

    async def emotion_update(self, event):
        # Send emotion update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'emotion_update',
            'data': event['data']
        }))

    async def broadcast_error(self, event):
        # Send error message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': event['message']
        })) 