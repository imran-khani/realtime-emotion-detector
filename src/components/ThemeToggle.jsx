import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', icon: SunIcon, label: 'Light' },
    { value: 'dark', icon: MoonIcon, label: 'Dark' },
    { value: 'system', icon: ComputerDesktopIcon, label: 'System' }
  ];

  const handleThemeChange = (newTheme) => {
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    } else {
      setTheme(newTheme);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-1">
        {themes.map((themeOption) => (
          <button
            key={themeOption.value}
            onClick={() => handleThemeChange(themeOption.value)}
            className={`p-2 rounded-lg transition-colors ${
              theme === themeOption.value
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={themeOption.label}
          >
            <themeOption.icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;