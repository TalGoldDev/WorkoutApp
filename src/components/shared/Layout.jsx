import { useLocation } from 'react-router-dom';
import { NavBar } from './NavBar';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const Layout = ({ children, showNav = true }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  // Only show theme toggle on home page
  const showThemeToggle = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pb-20 transition-colors">
      {/* Theme Toggle - Only visible on home page */}
      {showThemeToggle && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:scale-110 transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-primary" />
            )}
          </button>
        </div>
      )}

      <div className="max-w-lg mx-auto">
        {children}
      </div>
      {showNav && <NavBar />}
    </div>
  );
};
