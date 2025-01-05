# Browser-based Emotion Detection

A real-time facial emotion detection application that runs entirely in your browser. Using face-api.js, the application analyzes facial expressions to detect emotions, providing instant feedback and analytics - all while maintaining complete privacy as no data leaves your device.

## Features

- Real-time facial emotion detection
- Client-side processing using face-api.js
- Five-emotion classification (happy, sad, angry, surprised, neutral)
- Dark/Light theme support
- Emotion history tracking and analytics
- Downloadable emotion history
- No backend required - runs entirely in your browser

## How It Works

1. face-api.js loads pre-trained models for face detection and emotion recognition
2. Your webcam feed is processed in real-time using these models
3. Detected emotions are displayed and tracked in the UI
4. All processing happens locally in your browser - no data is sent to any server

## Technology Stack

- React (Frontend framework)
- face-api.js (Face detection and emotion recognition)
- Vite (Build tool)
- Tailwind CSS (Styling)

## System Requirements

- Modern browser (Chrome 88+, Firefox 87+, Safari 14+)
- Webcam access
- 4GB RAM (minimum)
- Dual-core processor or better

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/emotion-detection.git
   cd emotion-detection
   ```

2. Install dependencies:
   ```bash
   cd frontend
   bun install
   ```

3. Run the development server:
   ```bash
   bun dev
   ```

4. Open the app in your browser:
   [http://localhost:5173](http://localhost:5173)

## Privacy & Security

- All processing is done locally in your browser
- No video or image data is ever sent to any server
- No personal data is collected or stored externally
- Emotion history is stored only in your browser's memory

## License

MIT License

---

Made with ❤️ using face-api.js and React