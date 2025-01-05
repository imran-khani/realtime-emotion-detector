import { useState, useEffect } from 'react';
import wsService from '../services/websocket';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      showConnectionToast(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      showConnectionToast(false);
    };

    wsService.subscribe('connect', handleConnect);
    wsService.subscribe('disconnect', handleDisconnect);

    // Initial connection
    wsService.connect();

    return () => {
      wsService.unsubscribe('connect', handleConnect);
      wsService.unsubscribe('disconnect', handleDisconnect);
      wsService.disconnect();
    };
  }, []);

  const showConnectionToast = (connected) => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 flex items-center space-x-2">
        <div
          className={`h-3 w-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          } animate-pulse`}
        />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Connection Toast */}
      <div
        className={`
          fixed bottom-16 right-4 p-4 rounded-lg shadow-lg
          transform transition-all duration-300
          ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          ${
            isConnected
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }
        `}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span>
            {isConnected
              ? 'Successfully connected to server'
              : 'Lost connection to server'}
          </span>
        </div>
      </div>
    </>
  );
};

export default ConnectionStatus; 