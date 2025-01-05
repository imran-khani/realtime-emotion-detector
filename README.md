# Real-time Emotion Chat App

A real-time chat application with integrated facial emotion recognition capabilities. The application uses computer vision and machine learning to analyze facial expressions during conversations, enhancing communication through emotion detection.

## Features

- Real-time facial emotion recognition
- Five-emotion classification system
- Intelligent message enhancement based on detected emotions
- Real-time chat functionality
- Browser-based webcam integration

## How It Works

1. OpenCV captures the video feed and detects faces
2. TensorFlow analyzes facial expressions to detect emotions
3. The system processes emotional data to enhance messaging experience

## Technology Stack

- Django (Backend)
- OpenCV (Webcam capture & face detection)
- TensorFlow (Emotion detection model)
- WebSocket (Real-time updates)
- React and Tailwind CSS (Frontend)

## System Requirements

- Python 3.8+
- Node.js 16+
- Modern browser (Chrome 88+, Firefox 87+, Safari 14+)
- Webcam access
- 4GB RAM (minimum)
- Dual-core processor or better

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/emotion-chat-app.git
   cd emotion-chat-app
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   cd frontend
   npm install
   ```

4. Run the development servers:
   ```bash
   # Terminal 1 - Backend
   python manage.py runserver

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

5. Open the app in your browser:
   [http://localhost:3000](http://localhost:3000)

## Emotions Detected

The app recognizes these emotions and suggests matching emojis:
- Happy
- Sad
- Angry
- Surprised
- Neutral

## Privacy & Security

- Camera data is processed locally in your browser
- No video is saved or transmitted
- No personal data collection

## License

MIT License

---

Made for real-time emotion-aware communication