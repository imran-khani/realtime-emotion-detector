import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .emotion_detector import EmotionDetector

class EmotionConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.detector = EmotionDetector()

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            image_data = data.get('image')
            
            if image_data:
                # Process the image and detect emotion
                emotion, confidence = await self.detector.detect_emotion(image_data)
                
                # Send the result back
                await self.send(text_data=json.dumps({
                    'emotion': emotion,
                    'confidence': confidence
                }))
            else:
                await self.send(text_data=json.dumps({
                    'error': 'No image data received'
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': str(e)
            })) 