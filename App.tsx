
import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { CraneBeamCalculator } from './components/CraneBeamCalculator';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    // Kiểm tra localStorage trước, nếu không có thì mặc định là true (theme tối)
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    // Lưu theme preference vào localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Crane beam design studio</h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>
      <main>
        <CraneBeamCalculator />
      </main>
      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Phát triển bởi chuyên gia React với Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;

