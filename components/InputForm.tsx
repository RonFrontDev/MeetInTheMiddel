import React, { useState, useEffect } from 'react';
import { 
    UserIcon, UsersIcon, SearchIcon, MyLocationIcon, XMarkIcon, PlusCircleIcon,
    SparklesIcon, BoltIcon, PaintBrushIcon, FaceSmileIcon, WrenchScrewdriverIcon, ShoppingBagIcon
} from './icons';
import { getAddressForCoordinates } from '../services/geminiService';
import type { FriendInput } from '../types';

interface InputFormProps {
  onFind: (friends: FriendInput[]) => void;
  isLoading: boolean;
}

const moodCategories = [
    { name: 'Chill & Chat', value: 'a chill spot for conversation like a quiet cafe or lounge', icon: <FaceSmileIcon /> },
    { name: 'Fun & Active', value: 'something fun and active like bowling, mini-golf, or an arcade', icon: <BoltIcon /> },
    { name: 'Foodie Adventure', value: 'a unique or highly-rated restaurant, food truck, or dessert spot', icon: <SparklesIcon /> },
    { name: 'Creative & Cultured', value: 'an art gallery, museum, or a place with live music', icon: <PaintBrushIcon /> },
    { name: 'Quick & Casual', value: 'a low-key, casual spot like a boba shop or fast-food place', icon: <ShoppingBagIcon /> },
    { name: 'Something Different', value: 'something unique and interesting like an escape room or a local market', icon: <WrenchScrewdriverIcon /> },
];

const createNewFriend = (): FriendInput => ({
    id: crypto.randomUUID(),
    location: '',
    vibe: moodCategories[0].value,
});

export const InputForm: React.FC<InputFormProps> = ({ onFind, isLoading }) => {
  const [friends, setFriends] = useState<FriendInput[]>([createNewFriend(), createNewFriend()]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const updateFriend = (id: string, field: 'location' | 'vibe', value: string) => {
    setFriends(friends.map(f => f.id === id ? { ...f, [field]: value } : f));
  };
  
  const addFriend = () => setFriends([...friends, createNewFriend()]);
  
  const removeFriend = (id: string) => setFriends(friends.filter(f => f.id !== id));

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      setLocalError('Geolocation is not supported by your browser.');
      return;
    }
    setIsGettingLocation(true);
    setLocalError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const address = await getAddressForCoordinates({ lat: latitude, lng: longitude });
          updateFriend(friends[0].id, 'location', address);
        } catch (e) {
            setLocalError(e instanceof Error ? `Couldn't get address: ${e.message}` : 'An unknown error occurred.');
        } finally {
            setIsGettingLocation(false);
        }
      },
      (error) => {
        setLocalError("Please allow location access to use this feature.");
        setIsGettingLocation(false);
      }
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (friends.every(f => f.location)) {
      onFind(friends);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       {localError && <div className="p-3 bg-red-100 text-red-800 border border-red-200 rounded-xl text-sm">{localError}</div>}
      
       <div className="space-y-8">
        {friends.map((friend, index) => (
            <div key={friend.id} className="p-4 rounded-xl border border-slate-200 bg-amber-50/50 relative">
                {friends.length > 2 && (
                    <button type="button" onClick={() => removeFriend(friend.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 z-10">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                )}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <label htmlFor={`location-${friend.id}`} className="block text-sm font-bold text-gray-700 mb-1">
                        {index === 0 ? "Your Starting Point" : `Friend ${index + 1}'s Starting Point`}
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-grow">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            {index === 0 ? <UserIcon className="h-5 w-5 text-gray-400" /> : <UsersIcon className="h-5 w-5 text-gray-400" />}
                          </div>
                          <input type="text" id={`location-${friend.id}`} value={friend.location}
                            onChange={(e) => updateFriend(friend.id, 'location', e.target.value)}
                            placeholder="e.g., 1600 Amphitheatre Parkway"
                            className="block w-full rounded-xl border-gray-300 shadow-sm pl-10 focus:border-purple-500 focus:ring-purple-500 sm:text-sm h-12" required
                          />
                        </div>
                        {index === 0 && (
                             <button type="button" onClick={handleUseMyLocation} disabled={isGettingLocation}
                              className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-wait"
                              title="Use my current location">
                              {isGettingLocation ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div> : <MyLocationIcon className="h-6 w-6" />}
                            </button>
                        )}
                      </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            {index === 0 ? "Your Vibe" : `Friend ${index + 1}'s Vibe`}
                        </label>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {moodCategories.map((mood) => (
                                <button key={mood.value} type="button" onClick={() => updateFriend(friend.id, 'vibe', friend.vibe === mood.value ? '' : mood.value)}
                                className={`flex items-center justify-center p-2 h-16 rounded-xl border text-xs font-bold transition-all duration-200 text-center ${
                                    friend.vibe === mood.value
                                    ? 'bg-purple-100 text-purple-800 border-purple-300 ring-2 ring-purple-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'
                                }`}>
                                <span className="flex flex-col items-center">
                                    {React.cloneElement(mood.icon, {className: 'h-6 w-6 mb-1'})}
                                    {mood.name}
                                </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ))}
       </div>

      <div className="flex justify-center mt-2">
        <button type="button" onClick={addFriend} className="flex items-center font-bold text-purple-600 hover:text-purple-800 transition-colors">
            <PlusCircleIcon className="h-6 w-6 mr-2"/>
            Add Another Friend
        </button>
      </div>
      
      <div className="pt-6">
        <button type="submit" disabled={isLoading || friends.some(f => !f.location)}
          className="w-full flex items-center justify-center rounded-xl border border-transparent bg-gradient-to-br from-purple-600 to-pink-500 py-3.5 px-4 text-base font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1">
          {isLoading ? 'Thinking...' : (<><SearchIcon className="h-6 w-6 mr-2" />Find Our Perfect Spot</>)}
        </button>
      </div>
    </form>
  );
};