
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsSection } from './components/ResultsSection';
import { getCoordinatesForLocations, findMeetingSuggestions } from './services/geminiService';
import type { Coordinates, SuggestionIdentifier, Ratings, ResultsState, FriendInput, FriendLocation, GroupPreferences } from './types';
import { MidiBotIcon } from './components/icons';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refiningSuggestions, setRefiningSuggestions] = useState<SuggestionIdentifier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultsState | null>(null);
  const [ratings, setRatings] = useState<Ratings>({});

  const handleSearchAgain = useCallback(() => {
    setResults(null);
    setRatings({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRatingChange = useCallback(async (suggestionId: SuggestionIdentifier, friendIndex: number, newRating: number) => {
    const updatedRatings = {
      ...ratings,
      [suggestionId]: {
        ...(ratings[suggestionId] || {}),
        [friendIndex]: (ratings[suggestionId]?.[friendIndex] === newRating) ? 0 : newRating,
      }
    };
    setRatings(updatedRatings);

    const newRatingsForSuggestion = updatedRatings[suggestionId];
    if (!results || !newRatingsForSuggestion) return;
    
    const numFriends = results.locations.length;
    // FIX: Cast `r` to number to resolve TypeScript error when comparing with a number.
    const allFriendsRated = Object.keys(newRatingsForSuggestion).length === numFriends && Object.values(newRatingsForSuggestion).every(r => (r as number) > 0);

    if (allFriendsRated) {
        const allRatings = Object.values(newRatingsForSuggestion);

        // Rule: 0-2 Stars from ALL friends -> Remove the option
        // FIX: Cast `r` to number to resolve TypeScript error when comparing with a number.
        if (allRatings.every(r => (r as number) > 0 && (r as number) <= 2)) {
            setResults(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    suggestions: prev.suggestions.filter(s => `${s.name}-${s.address}` !== suggestionId)
                };
            });
            setRatings(prev => {
                const newRatingsState = {...prev};
                delete newRatingsState[suggestionId];
                return newRatingsState;
            });
            return;
        }

        // Rule: 2-3 Stars from ALL friends -> Replace with a new option
        // FIX: Cast `r` to number to resolve TypeScript error when comparing with a number.
        if (allRatings.every(r => (r as number) > 1 && (r as number) <= 3)) {
            setRefiningSuggestions(prev => [...prev, suggestionId]);
            try {
                const { suggestions: newSuggestions } = await findMeetingSuggestions(
                    results.searchParams.friends,
                    results.searchParams.preferences,
                    results.midpoint,
                    1,
                    results.suggestions
                );

                if (newSuggestions && newSuggestions.length > 0) {
                    const newSuggestion = newSuggestions[0];
                    setResults(prev => {
                        if (!prev) return null;
                        const oldIndex = prev.suggestions.findIndex(s => `${s.name}-${s.address}` === suggestionId);
                        if (oldIndex === -1) return prev; 
                        
                        const updatedSuggestions = [...prev.suggestions];
                        updatedSuggestions[oldIndex] = newSuggestion;
                        return { ...prev, suggestions: updatedSuggestions };
                    });
                } else {
                    setResults(prev => prev && { ...prev, suggestions: prev.suggestions.filter(s => `${s.name}-${s.address}` !== suggestionId) });
                }
                setRatings(prev => {
                    const newRatingsState = {...prev};
                    delete newRatingsState[suggestionId];
                    return newRatingsState;
                });
            } catch (e) {
                console.error("Failed to refine suggestion", e);
                setError("Failed to get a new suggestion. Please try again.");
            } finally {
                setRefiningSuggestions(prev => prev.filter(id => id !== suggestionId));
            }
        }
    }
  }, [ratings, results]);

  const handleFindMeetingPoint = useCallback(async (friends: FriendInput[], preferences: GroupPreferences) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setRatings({});

    if (!process.env.API_KEY) {
      setError("API key is not configured. Please set the API_KEY environment variable.");
      setIsLoading(false);
      return;
    }

    try {
      const locations = friends.map(f => f.location);
      const coordinatesArray = await getCoordinatesForLocations(locations);
      if (!coordinatesArray || coordinatesArray.some(c => !c)) {
        throw new Error("Could not find one or more locations. Please try being more specific.");
      }
      
      const locationsWithCoords: FriendLocation[] = friends.map((friend, i) => ({
          address: friend.location,
          coords: coordinatesArray[i] as Coordinates,
      }));

      const midpoint: Coordinates = {
        lat: locationsWithCoords.reduce((sum, loc) => sum + loc.coords.lat, 0) / locationsWithCoords.length,
        lng: locationsWithCoords.reduce((sum, loc) => sum + loc.coords.lng, 0) / locationsWithCoords.length,
      };
      
      const { suggestions, summary } = await findMeetingSuggestions(friends, preferences, midpoint);
      if (!suggestions || suggestions.length === 0) {
        throw new Error(`Sorry, I couldn't find any spots that match your group's interests. Try being a bit more general!`);
      }

      setResults({
        locations: locationsWithCoords,
        midpoint,
        suggestions,
        summary,
        searchParams: { friends, preferences },
      });

    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error(e);
            setError(e.message);
        } else {
            console.error("An unknown error occurred:", e);
            setError("An unexpected error occurred. Please check the console and try again.");
        }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-6xl">
        <div className="bg-white/70 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-lg shadow-purple-200/30 border border-slate-200/80">
          <div className="text-center mb-8">
            <MidiBotIcon className="h-24 w-24 text-purple-600 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Meet Your Crew in the Middle</h2>
            <p className="text-gray-600 mt-2 text-lg max-w-2xl mx-auto">
              Tell me where your friends are and what you're in the mood for. I'll find the perfect spot for everyone to meet up!
            </p>
          </div>
          <InputForm onFind={handleFindMeetingPoint} isLoading={isLoading} />
        </div>
        <ResultsSection 
          isLoading={isLoading} 
          refiningSuggestions={refiningSuggestions}
          error={error} 
          results={results} 
          ratings={ratings} 
          onRatingChange={handleRatingChange}
          onSearchAgain={handleSearchAgain}
        />
      </main>
      <footer className="text-center p-4 text-sm text-slate-500/80 mt-8">
        <p>Powered by Midi &amp; the Gemini API</p>
      </footer>
    </div>
  );
};

export default App;