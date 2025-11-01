
import React from 'react';
import type { Suggestion, Ratings, SuggestionIdentifier } from '../types';
import { UserIcon, StarIcon, MapPinIcon, ClockIcon, InformationCircleIcon, HeartIcon, TrophyIcon, ArrowTopRightOnSquareIcon, ArrowPathIcon } from './icons';

interface SuggestionCardProps {
    suggestion: Suggestion;
    ratings: Ratings;
    onRatingChange: (suggestionId: SuggestionIdentifier, friendIndex: number, newRating: number) => void;
    index: number;
    isRefining: boolean;
    numFriends: number;
}

const StarRating: React.FC<{
    rating: number;
    onRatingChange: (newRating: number) => void;
}> = ({ rating, onRatingChange }) => {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(star)}
                    className="p-1"
                >
                    <StarIcon
                        className={`h-6 w-6 transition-transform duration-200 ${
                            star <= rating ? 'text-amber-400 scale-110' : 'text-slate-300 hover:text-amber-200 hover:scale-125'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

const MatchSticker: React.FC<{
    type: 'good' | 'perfect';
    text: string;
}> = ({ type, text }) => {
    const isPerfect = type === 'perfect';
    const bgColor = isPerfect ? 'bg-gradient-to-br from-pink-500 to-rose-500' : 'bg-gradient-to-br from-amber-500 to-orange-500';
    const Icon = isPerfect ? HeartIcon : TrophyIcon;

    return (
        <div className={`absolute -top-3 -right-3 z-10 flex items-center px-3 py-1.5 rounded-full text-white font-bold text-xs shadow-lg ${bgColor}`}>
            <Icon className="h-4 w-4 mr-1.5" />
            {text}
        </div>
    );
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, ratings, onRatingChange, index, isRefining, numFriends }) => {
    const suggestionId = `${suggestion.name}-${suggestion.address}`;
    const currentRatings = ratings[suggestionId] || {};
    
    const isEvent = suggestion.type === 'event';
    const accentColorClass = isEvent ? "border-pink-300" : "border-purple-300";

    const allRatings = Object.values(currentRatings);
    // FIX: Cast `r` to number to resolve TypeScript error when comparing with a number.
    const allFriendsRated = allRatings.length === numFriends && allRatings.every(r => (r as number) > 0);
    
    let sticker = null;
    if (allFriendsRated) {
        // FIX: Cast `r` to number to resolve TypeScript error when comparing with a number.
        if (allRatings.every(r => (r as number) === 5)) {
            sticker = <MatchSticker type="perfect" text="Perfect Match!" />;
        // FIX: Cast `r` to number to resolve TypeScript error when comparing with a number.
        } else if (allRatings.every(r => (r as number) >= 4)) {
            sticker = <MatchSticker type="good" text="Good Match!" />;
        }
    }

    return (
        <div className={`relative bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden transition-all duration-300 border-l-4 ${accentColorClass}`}>
             {isRefining && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="text-center p-4">
                        <ArrowPathIcon className="h-8 w-8 text-purple-600 mx-auto animate-spin"/>
                        <p className="mt-3 font-semibold text-purple-700">Finding a new idea...</p>
                    </div>
                </div>
            )}
            
            <div className="p-5 md:p-6">
                 {sticker}
                <div className="flex items-start justify-between">
                    <div className="flex-grow pr-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 mr-3 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                                {index + 1}
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-purple-600">{isEvent ? 'Event' : 'Place'}</p>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {suggestion.url ? (
                                        <a href={suggestion.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center group hover:text-purple-700 transition-colors duration-200 underline-offset-4 hover:underline">
                                            {suggestion.name}
                                            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1.5 text-slate-400 group-hover:text-purple-600 transition-colors duration-200" />
                                        </a>
                                    ) : (
                                        suggestion.name
                                    )}
                                </h3>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-x-2 mt-2 pl-11">
                            <p className="text-sm text-slate-600 font-semibold">{suggestion.venue}</p>
                            {suggestion.priceLevel && (
                                <p className="text-xs font-bold text-purple-700 bg-purple-100 py-0.5 px-1.5 rounded-md">
                                    {suggestion.priceLevel}
                                </p>
                            )}
                        </div>
                    </div>
                    {isEvent && suggestion.date && (
                        <div className="flex-shrink-0 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-pink-200">
                            <p className="text-sm font-bold text-pink-700">{suggestion.date.split(',')[0]}, {suggestion.date.split(',')[1]}</p>
                            <p className="text-xs text-pink-600">{suggestion.date.split(',')[2]}</p>
                        </div>
                    )}
                </div>
                
                 <p className="flex items-start text-sm text-slate-500 mt-3 pl-11">
                    <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{suggestion.address}</span>
                </p>

                {suggestion.description && (
                    <p className="mt-4 text-sm text-slate-700 bg-slate-100/60 p-3 rounded-lg flex items-start">
                        <InformationCircleIcon className="h-5 w-5 mr-2 text-purple-500 flex-shrink-0" />
                        <span>{suggestion.description}</span>
                    </p>
                )}
            </div>

            <div className="bg-slate-50/50 px-5 py-4 border-y border-slate-200/80">
                <div className={`grid grid-cols-1 ${numFriends > 1 ? 'sm:grid-cols-2' : ''} gap-x-6 gap-y-4 text-sm`}>
                    {suggestion.travelInfo.map((info, i) => (
                         <div key={i} className="flex items-center">
                            <div className={`h-8 w-8 rounded-full p-1.5 mr-3 flex-shrink-0 ${i % 2 === 0 ? 'bg-purple-100 text-purple-500' : 'bg-pink-100 text-pink-500'}`}>
                                <UserIcon />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700">From {i === 0 ? "You" : `Friend ${i + 1}`}</p>
                                <p className="text-slate-500 flex items-center space-x-2">
                                    <span className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1"/>{info.distanceFrom}</span>
                                    <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1"/>{info.durationFrom}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-5 py-4 bg-white/30">
                <p className="text-sm font-bold text-center text-slate-600 mb-2">How does this sound to everyone?</p>
                 <div className={`grid grid-cols-${numFriends} gap-2`}>
                     {Array.from({ length: numFriends }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center p-2 rounded-lg bg-slate-100/50">
                             <label className={`text-xs font-bold ${i % 2 === 0 ? 'text-purple-700' : 'text-pink-700'} mb-1`}>
                                {i === 0 ? "You" : `Friend ${i + 1}`}
                             </label>
                            <StarRating rating={currentRatings[i] || 0} onRatingChange={(newRating) => onRatingChange(suggestionId, i, newRating)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};