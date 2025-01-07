import { useState, useEffect, useRef } from 'react';

const EMOTION_RESPONSES = {
  happy: [
    "You seem happy! What's making you smile?",
    "Your positive energy is contagious! Want to share your joy?",
    "It's great to see you in such a good mood!"
  ],
  sad: [
    "I notice you're feeling down. Would you like to talk about it?",
    "Sometimes sharing what's troubling us can help. I'm here to listen.",
    "Remember, it's okay to not be okay. Want to share what's on your mind?"
  ],
  angry: [
    "I can see you're frustrated. Want to talk about what's bothering you?",
    "Taking deep breaths can help when we're angry. Would you like to try that together?",
    "It's okay to feel angry. Would you like to discuss what triggered this?"
  ],
  surprised: [
    "You look surprised! Did something unexpected happen?",
    "That's quite a reaction! Want to share what surprised you?",
    "I'm curious about what caused that surprised expression!"
  ],
  neutral: [
    "How are you feeling right now?",
    "What's on your mind?",
    "Would you like to chat about anything in particular?"
  ],
  fearful: [
    "I notice you seem anxious. Remember to breathe - I'm here with you.",
    "It's okay to feel scared. Would you like to talk about your concerns?",
    "Sometimes sharing our fears makes them less overwhelming. Want to talk?"
  ],
  disgusted: [
    "Something seems to be bothering you. Want to talk about it?",
    "Your expression suggests you're uncomfortable. Would you like to discuss it?",
    "I notice you're having a strong reaction. Want to share what's causing it?"
  ]
};

const ChatInterface = ({ currentEmotion, confidence }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const getRandomResponse = (emotion) => {
    const responses = EMOTION_RESPONSES[emotion] || EMOTION_RESPONSES.neutral;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  useEffect(() => {
    if (currentEmotion && confidence > 0.5) {
      setIsTyping(true);
      // Simulate AI typing delay
      setTimeout(() => {
        const response = getRandomResponse(currentEmotion);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: response,
          sender: 'ai',
          emotion: currentEmotion
        }]);
        setIsTyping(false);
      }, 1000);
    }
  }, [currentEmotion, confidence]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      emotion: currentEmotion
    }]);

    // Clear input
    setInputMessage('');

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const response = getRandomResponse(currentEmotion);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: response,
        sender: 'ai',
        emotion: currentEmotion
      }]);
      setIsTyping(false);
    }, 1000);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-indigo-600">
        <h2 className="text-white text-lg font-semibold">EmotiChat Assistant</h2>
      </div>

      {/* Chat messages */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.text}</p>
              {message.emotion && message.sender === 'user' && (
                <span className="text-xs opacity-75 mt-1 block">
                  Detected emotion: {message.emotion}
                </span>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 