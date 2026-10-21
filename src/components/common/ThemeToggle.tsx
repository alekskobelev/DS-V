import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'compact' | 'switch' | 'row';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className = '', showLabel = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'row') {
    return (
      <button
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
          isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-gray-100 text-gray-800'
        } ${className}`}
      >
        <span className="text-sm font-semibold flex items-center gap-2">
          {isDark ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
          {isDark ? 'Тёмная тема' : 'Светлая тема'}
        </span>
        <div className={`relative w-9 h-5 rounded-full transition-colors ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg transition-colors flex items-center gap-2 ${
        isDark ? 'bg-slate-800 text-amber-300 hover:bg-slate-700' : 'bg-gray-100 text-amber-500 hover:bg-gray-200'
      } ${className}`}
      title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
    >
      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      {showLabel && <span className="text-sm font-medium">{isDark ? 'Тёмная' : 'Светлая'}</span>}
    </button>
  );
};
