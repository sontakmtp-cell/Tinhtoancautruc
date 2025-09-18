
import React, { useEffect } from 'react';
import { CraneBeamCalculator } from './components/CraneBeamCalculator';

const App: React.FC = () => {
  useEffect(() => {
    // Always apply dark theme
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <header className="bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <span className="text-blue-400">AI</span>-Powered Crane Beam Calculator
            </h1>
          </div>
        </div>
      </header>
      <main>
        <CraneBeamCalculator />
      </main>
      <footer className="text-center py-4 text-sm text-gray-400">
        <p>Phát triển bởi chuyên gia React với Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
