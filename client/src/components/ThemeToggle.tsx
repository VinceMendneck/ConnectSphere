import { useState } from 'react';

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
    >
      {darkMode ? 'Modo Claro' : 'Modo Escuro'}
    </button>
  );
}

export default ThemeToggle;