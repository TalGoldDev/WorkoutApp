import { Link, useLocation } from 'react-router-dom';
import { Home, History, BarChart3 } from 'lucide-react';

export const NavBar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/statistics', icon: BarChart3, label: 'Stats' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 transition-colors">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center touch-target px-4 py-2 transition-colors ${
                active
                  ? (item.isDebug ? 'text-red-600' : 'text-primary dark:text-blue-400')
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={24} className={active ? 'stroke-[2.5]' : ''} />
              <span className={`text-xs mt-1 ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
