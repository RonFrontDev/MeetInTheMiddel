import React from 'react';
import { XMarkIcon } from './icons';
import type { FriendLocation, Suggestion } from '../types';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: FriendLocation[];
  suggestions: Suggestion[];
}

const friendLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, locations, suggestions }) => {
  if (!isOpen) {
    return null;
  }

  const apiKey = process.env.API_KEY;

  let mapSrc = '';
  if (apiKey) {
      const params = new URLSearchParams({
          size: '640x640',
          maptype: 'roadmap',
          key: apiKey,
      });

      locations.forEach((loc, i) => {
        const color = i % 2 === 0 ? '0xa855f7' : '0xec4899';
        params.append('markers', `color:${color}|label:${friendLabels[i]}|${loc.coords.lat},${loc.coords.lng}`);
      });
      
      suggestions.forEach((suggestion, index) => {
          params.append('markers', `color:0x9333ea|label:${index + 1}|${suggestion.lat},${suggestion.lng}`);
      });
      
      mapSrc = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
  }


  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[800px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">All Suggestions on Map</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Close map view"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 overflow-hidden">
            <div className="md:col-span-2 bg-gray-200 h-full w-full flex items-center justify-center">
                {apiKey ? (
                    <img 
                        src={mapSrc} 
                        alt="Map showing all suggestions" 
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-red-500 p-4 text-center">API Key not provided. Map cannot be displayed.</div>
                )}
            </div>
            <div className="md:col-span-1 p-4 overflow-y-auto border-t md:border-t-0 md:border-l">
                <h3 className="font-bold text-lg mb-3">Legend</h3>
                <div className="space-y-1 text-sm">
                    {locations.map((loc, i) => (
                         <p key={i} className="flex items-center">
                            <span className={`font-bold inline-block text-center w-6 h-6 leading-6 ${i % 2 === 0 ? 'bg-purple-200 text-purple-800' : 'bg-pink-200 text-pink-800'} rounded-full mr-2`}>{friendLabels[i]}</span>
                            {i === 0 ? "Your Start" : `Friend ${i + 1}'s Start`}
                        </p>
                    ))}
                </div>
                <hr className="my-3"/>
                <ol className="space-y-3">
                    {suggestions.map((s, index) => (
                        <li key={s.name} className="flex items-start">
                           <span className="font-bold inline-block text-center w-6 h-6 leading-6 bg-purple-600 text-white rounded-full mr-3 flex-shrink-0">{index + 1}</span>
                           <div>
                             <p className="font-semibold text-slate-800">{s.name}</p>
                             <p className="text-xs text-slate-500">{s.address}</p>
                           </div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
      </div>
    </div>
  );
};