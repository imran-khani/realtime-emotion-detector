# Browser-based Emotion Detection

A real-time facial emotion detection application that runs entirely in your browser. Using face-api.js, the application analyzes facial expressions to detect emotions, providing instant feedback and analytics - all while maintaining complete privacy as no data leaves your device.

## Features

### Core Features
- Real-time facial emotion detection using face-api.js
- Client-side processing for instant results
- Five-emotion classification (happy, sad, angry, surprised, neutral)
- Complete privacy - all processing happens locally
- High-accuracy neural network models
- Instant feedback and response

### Analytics & Insights
- Comprehensive emotion history tracking
- Visual emotion trends and patterns
- Downloadable history in JSON format
- Real-time statistics and analysis
- Detailed emotional pattern reports
- Confidence scoring for each detection
- Historical trend analysis
- Data visualization options

### User Experience
- Dark/Light theme support
- Responsive design for all devices
- Live webcam preview
- Real-time emotion feedback
- Clean, modern interface
- Keyboard shortcuts for quick actions
- Snapshot mode for moment capture
- Alert system for emotion changes
- Intuitive navigation
- Seamless webcam integration

### Customization Options
- Adjustable detection frequency
- Toggleable auto-detection mode
- Customizable interface preferences
- Manual capture option
- Sensitivity control for detection
- Custom detection zones
- Interval timing controls
- UI layout customization
- Notification preferences
- Display options

### Technical Features
- No installation required
- No backend dependency
- Works offline after initial load
- Fast and responsive performance
- Automatic model loading
- Browser-based processing
- Real-time video analysis
- Efficient resource usage

### Privacy & Security
- All processing done locally
- No data transmission
- No cloud storage
- No personal data collection
- Private emotion history
- Secure webcam access
- Local data storage only
- Session-based tracking

## How It Works

1. face-api.js loads pre-trained models for face detection and emotion recognition
2. Your webcam feed is processed in real-time using these models
3. Advanced neural networks analyze facial expressions
4. Emotions are detected and classified with confidence scores
5. Results are displayed instantly in the UI
6. Historical data is tracked and analyzed
7. All processing happens locally - no data leaves your device

## Technology Stack

- React (Frontend framework)
- face-api.js (Face detection and emotion recognition)
- Vite (Build tool)
- Tailwind CSS (Styling)
- TensorFlow.js (Underlying ML framework)
- WebRTC (Camera access)

## System Requirements

- Modern browser (Chrome 88+, Firefox 87+, Safari 14+)
- Webcam access
- 4GB RAM (minimum)
- Dual-core processor or better
- WebGL support
- JavaScript enabled

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
- Webcam access is requested only when needed
- All data is cleared when the session ends
- No cookies or tracking mechanisms

## License

MIT License

---

Made with ❤️ using face-api.js and React