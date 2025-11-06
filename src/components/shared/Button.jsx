export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const baseStyles = 'touch-target font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary dark:bg-blue-600 text-white hover:bg-primary-dark dark:hover:bg-blue-700 focus:ring-primary dark:focus:ring-blue-500',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400 dark:focus:ring-gray-500',
    success: 'bg-success dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 focus:ring-success dark:focus:ring-green-500',
    danger: 'bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500 dark:focus:ring-red-600',
    ghost: 'bg-transparent text-primary dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-primary dark:focus:ring-blue-500',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};
