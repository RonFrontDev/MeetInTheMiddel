
import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for icons
import { MidiBotIcon } from './icons';

const loadingMessages = [
  'Calculating the halfway point...',
  'Scanning the area for the best spots...',
  'Comparing travel times for you...',
  'Asking local robots for recommendations...',
  'Checking traffic conditions...',
  'Finding the perfect place to meet...',
];

export const LoadingAnimation: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 text-center py-10 flex flex-col items-center justify-center">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes antenna-blink {
          0%, 100% { fill: currentColor; }
          50% { fill: #a855f7; } /* purple-500 */
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-antenna-blink circle:first-of-type {
            animation: antenna-blink 1.5s ease-in-out infinite;
        }
      `}</style>
      <MidiBotIcon mood="thinking" className="h-28 w-28 text-slate-700 animate-float animate-antenna-blink" />
      <p className="mt-6 text-slate-600 font-bold text-xl transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};
