import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { NavBar } from './NavBar';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const Layout = ({ children, showNav = true }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Admin panel secret access: 6 clicks within 3 seconds
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef(null);

  // Only show theme toggle on home page
  const showThemeToggle = location.pathname === '/';

  const handleThemeToggleClick = () => {
    // Toggle the theme
    toggleTheme();

    // Increment click counter
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // Clear existing timer
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    // Check if we reached 6 clicks
    if (newClickCount >= 6) {
      setClickCount(0);
      navigate('/admin');
      return;
    }

    // Reset counter after 3 seconds
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pb-20 transition-colors">
      {/* Theme Toggle - Only visible on home page */}
      {showThemeToggle && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleThemeToggleClick}
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
