
import React from 'react';
import { MidiBotIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-lg border-b border-slate-200/80">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-center">
        <MidiBotIcon className="h-9 w-9 text-purple-600 mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
          Meet in the Middle
        </h1>
      </div>
    </header>
  );
};