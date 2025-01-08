# EmotiSense - Real-time Emotion Detection System

EmotiSense is an AI-powered emotional intelligence assistant that provides real-time emotion detection, analysis, and personalized feedback through facial expression analysis.

## Features

### 1. Real-time Emotion Detection
- Advanced facial expression analysis using face-api.js
- Instant emotion classification
- High-accuracy confidence scoring
- Smooth performance optimization

### 2. Emotion Analytics
- Real-time emotion tracking
- Interactive emotion trend graphs
- Time-based analysis (1m, 5m, 15m, 30m)
- Emotion transition tracking

### 3. Emotion Journal
- Daily emotion tracking
- Pattern recognition
- Emotional stability scoring
- Time-based insights

### 4. AI Chat Support
- Context-aware responses
- Emotion-based conversation
- Real-time typing indicators
- Emoji support

### 5. Emotional Insights
- Daily goals and progress tracking
- Actionable recommendations
- Visual progress indicators
- Personalized feedback

## Tech Stack

- **Frontend Framework**: React.js
- **Styling**: Tailwind CSS, Material-UI
- **Animation**: Framer Motion
- **Charts**: Chart.js
- **AI/ML**: face-api.js, Hugging Face's Mistral-7B
- **Build Tool**: Vite
- **Package Manager**: Bun

## Prerequisites

- Node.js (v18 or higher)
- Bun (latest version)
- Modern web browser with camera support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/realtime-emotion-detector.git
cd realtime-emotion-detector
```

2. Install dependencies:
```bash
bun install
```

3. Download required models:
```bash
bun run download-models
```

4. Start the development server:
```bash
bun run dev
```

## Project Structure

```
realtime-emotion-detector/
├── public/
│   └── models/          # face-api.js models
├── src/
│   ├── components/      # React components
│   ├── App.jsx         # Main application
│   └── main.jsx        # Entry point
├── scripts/
│   └── download-models.js # Model download script
└── package.json
```

## Key Components

1. **WebcamCapture**: Handles real-time face detection and emotion analysis
2. **EmotionAnalytics**: Provides visual representation of emotion data
3. **EmotionJournal**: Tracks and analyzes emotional patterns
4. **ChatInterface**: AI-powered emotional support chat
5. **EmotionInsights**: Provides personalized insights and recommendations

## Team

- **Imran Khan** - Team Lead
- **Ubaid Ullah** - Team Member
- **Saqib Khan** - Team Member

## Institution

University of Agriculture, Peshawar  
Department of Computer Science

## License

This project is part of a final year project at the University of Agriculture, Peshawar.

## Acknowledgments

- face-api.js for providing the emotion detection models
- Hugging Face for the Mistral-7B model
- Material-UI and Tailwind CSS for the UI components
