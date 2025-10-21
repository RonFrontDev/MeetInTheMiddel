
import React, { useState } from 'react';
import type { ResultsState, Ratings, SuggestionIdentifier } from '../types';
import { LoadingAnimation } from './LoadingAnimation';
import { SuggestionCard } from './SuggestionCard';
import { MapModal } from './MapModal';
import { SearchIcon, MapIcon, TrophyIcon } from './icons';

interface ResultsSectionProps {
  isLoading: boolean;
  refiningSuggestions: SuggestionIdentifier[];
  error: string | null;
  results: ResultsState | null;
  ratings: Ratings;
  onRatingChange: (suggestionId: SuggestionIdentifier, friendIndex: number, newRating: number) => void;
  onSearchAgain: () => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  isLoading,
  refiningSuggestions,
  error,
  results,
  ratings,
  onRatingChange,
  onSearchAgain,
}) => {
  const [isMapModalOpen, setMapModalOpen] = useState(false);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <div className="mt-8 text-center p-6 bg-red-50 border border-red-200 rounded-2xl">
        <h3 className="text-xl font-bold text-red-800">Oops, something went wrong!</h3>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={onSearchAgain}
          className="mt-4 inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <SearchIcon className="h-5 w-5 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  if (!results) {
    return null;
  }
  
  const noSuggestionsLeft = results.suggestions.length === 0;

  const numFriends = results.locations.length;
  
  const perfectMatchIds = new Set<SuggestionIdentifier>();
  if (numFriends > 0) {
      results.suggestions.forEach(suggestion => {
          const id = `${suggestion.name}-${suggestion.address}`;
          const currentRatings = ratings[id] || {};
          const allRatings = Object.values(currentRatings);
          
          if (allRatings.length === numFriends && allRatings.every(r => (r as number) === 5)) {
              perfectMatchIds.add(id);
          }
      });
  }

  const podiumSuggestions = results.suggestions.filter(s => perfectMatchIds.has(`${s.name}-${s.address}`));
  const otherSuggestions = results.suggestions.filter(s => !perfectMatchIds.has(`${s.name}-${s.address}`));

  const hasPodium = podiumSuggestions.length >= 2;

  return (
    <div className="mt-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Here's What I Found For You!</h2>
        <p className="mt-2 text-lg text-gray-600 max-w-3xl mx-auto">{results.summary}</p>
      </div>

       <div className="mt-6 mb-8 text-center">
        <button 
          onClick={() => setMapModalOpen(true)}
          className="inline-flex items-center justify-center rounded-xl border border-transparent bg-slate-800 px-5 py-3 text-base font-bold text-white shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"
        >
          <MapIcon className="h-5 w-5 mr-2" />
          View All on Map
        </button>
      </div>
      
      {hasPodium && (
        <div className="mb-12">
          <div className="text-center mb-6">
            <TrophyIcon className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">It's a Tie! Your Top Choices</h3>
            <p className="mt-1 text-gray-600">You all gave these spots a perfect rating!</p>
          </div>
          <div className={`grid grid-cols-1 ${podiumSuggestions.length === 2 ? 'md:grid-cols-2' : 'lg:grid-cols-3'} gap-6 max-w-6xl mx-auto`}>
            {podiumSuggestions.map(suggestion => {
              const id = `${suggestion.name}-${suggestion.address}`;
              const originalIndex = results.suggestions.findIndex(s => `${s.name}-${s.address}` === id);
              return (
                  <SuggestionCard 
                    key={id}
                    suggestion={suggestion}
                    ratings={ratings}
                    onRatingChange={onRatingChange}
                    index={originalIndex}
                    isRefining={refiningSuggestions.includes(id)}
                    numFriends={results.locations.length}
                  />
              );
            })}
          </div>
          {otherSuggestions.length > 0 && <hr className="my-12 border-t-2 border-dashed border-purple-200" />}
        </div>
      )}
      
      <div className="max-w-3xl mx-auto space-y-6">
          {noSuggestionsLeft && !hasPodium && (
             <div className="p-6 text-center bg-purple-50 text-purple-700 rounded-2xl">
                <p className="font-bold text-lg">Looks like we've run out of ideas!</p>
                <p className="text-sm mt-1">Try a new search with different vibes to find more spots.</p>
            </div>
          )}
          {otherSuggestions.map((suggestion) => {
            const id = `${suggestion.name}-${suggestion.address}`;
            const originalIndex = results.suggestions.findIndex(s => `${s.name}-${s.address}` === id);
            return (
                <SuggestionCard 
                  key={id}
                  suggestion={suggestion}
                  ratings={ratings}
                  onRatingChange={onRatingChange}
                  index={originalIndex}
                  isRefining={refiningSuggestions.includes(id)}
                  numFriends={results.locations.length}
                />
            );
          })}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={onSearchAgain}
          className="inline-flex items-center justify-center rounded-xl border border-purple-600 px-6 py-3 text-base font-bold text-purple-600 shadow-sm hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
        >
          <SearchIcon className="h-5 w-5 mr-2" />
          Start a New Search
        </button>
      </div>

      <MapModal 
        isOpen={isMapModalOpen}
        onClose={() => setMapModalOpen(false)}
        locations={results.locations}
        suggestions={results.suggestions}
      />
    </div>
  );
};
