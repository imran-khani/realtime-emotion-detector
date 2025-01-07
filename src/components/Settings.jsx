import { useState } from 'react';

const Settings = ({ 
  detectionFrequency,
  onFrequencyChange,
  isAutoDetecting,
  onAutoDetectToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 bg-white rounded-lg shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div>
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-sm text-gray-500">
            Detection frequency: {detectionFrequency}ms
          </p>
        </div>
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 border-t">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detection Frequency (ms)
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={detectionFrequency}
                onChange={(e) => onFrequencyChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Fast (500ms)</span>
                <span>Slow (5000ms)</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Auto Detection
              </label>
              <button
                onClick={onAutoDetectToggle}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors focus:outline-none
                  ${isAutoDetecting ? 'bg-indigo-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${isAutoDetecting ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <h3 className="font-medium mb-1">Tips:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Lower frequency = more updates but higher CPU usage</li>
                <li>Higher frequency = fewer updates but lower CPU usage</li>
                <li>Recommended: 2000ms for balanced performance</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 