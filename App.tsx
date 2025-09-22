
import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'vi').split('-')[0];
  const handleLanguageChange = (lang: 'en' | 'vi') => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('app.title')}</h1>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-1 text-xs font-semibold ${
                    currentLanguage === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}
                  aria-pressed={currentLanguage === 'en'}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('vi')}
                  className={`px-2 py-1 text-xs font-semibold ${
                    currentLanguage === 'vi' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}
                  aria-pressed={currentLanguage === 'vi'}
                >
                  VI
                </button>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                aria-label={t('app.toggleTheme')}
              >
                {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <CraneBeamCalculator />
      </main>
      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        <p>{t('app.footer')}</p>
      </footer>
    </div>
  );
};

export default App;

