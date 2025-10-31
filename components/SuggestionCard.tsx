
import React from 'react';
import type { Suggestion, Ratings, SuggestionIdentifier } from '../types';
import { UserIcon, UsersIcon, StarIcon, MapPinIcon, ClockIcon, InformationCircleIcon, HeartIcon, TrophyIcon, ArrowTopRightOnSquareIcon } from './icons';

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
                        className={`h-6 w-6 transition-colors duration-200 ${
                            star <= rating ? 'text-amber-400' : 'text-slate-300 hover:text-amber-200'
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
        <div className={`absolute top-4 right-4 z-10 flex items-center px-3 py-1.5 rounded-full text-white font-bold text-xs shadow-lg ${bgColor} transform -rotate-6`}>
            <Icon className="h-4 w-4 mr-1.5" />
            {text}
        </div>
    );
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, ratings, onRatingChange, index, isRefining, numFriends }) => {
    const suggestionId = `${suggestion.name}-${suggestion.address}`;
    const currentRatings = ratings[suggestionId] || {};
    
    const isEvent = suggestion.type === 'event';
    const cardColorClass = isEvent ? 'from-pink-50 via-pink-50 to-amber-50' : 'from-purple-50 via-purple-50 to-amber-50';

    const allRatings = Object.values(currentRatings);
    // FIX: Cast `r` to number to resolve TypeScript error when comparing with a number.
    const allFriendsRated = allRatings.length === numFriends && allRatings.every(r => (r as number) > 0);
    
    let sticker = null;
    if (allFriendsRated) {
        // FIX: Cast `r` to number to resolve TypeScript error when comparing with a number.
        if (allRatings.every(r => (r as number) === 5)) {
            sticker = <MatchSticker type="perfect" text="Perfect Match, let's do it! :)" />;
        // FIX: Cast `r` to number to resolve TypeScript error when comparing with a number.
        } else if (allRatings.every(r => (r as number) >= 4)) {
            sticker = <MatchSticker type="good" text="Good Match!" />;
        }
    }

    return (
        <div className={`relative bg-gradient-to-br ${cardColorClass} rounded-2xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300`}>
             {isRefining && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="text-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-3 font-semibold text-purple-700">Finding a new idea...</p>
                    </div>
                </div>
            )}
            <div className="absolute top-4 left-4 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md z-10">
                {index + 1}
            </div>
            {sticker}
            <div className="p-5 md:p-6">
                <div className="md:flex md:items-start md:justify-between">
                    <div className="flex-grow pl-10 pr-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-purple-600">{isEvent ? 'Event' : 'Place'}</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">
                            {suggestion.url ? (
                                <a href={suggestion.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center group hover:text-purple-700 transition-colors duration-200 underline-offset-4 hover:underline">
                                    {suggestion.name}
                                    <ArrowTopRightOnSquareIcon className="h-5 w-5 ml-2 text-slate-400 group-hover:text-purple-600 transition-colors duration-200" />
                                </a>
                            ) : (
                                suggestion.name
                            )}
                        </h3>
                        <div className="flex items-baseline gap-x-2 mt-1">
                            <p className="text-sm text-slate-600 font-semibold">{suggestion.venue}</p>
                            {suggestion.priceLevel && (
                                <p className="text-xs font-bold text-purple-700 bg-purple-100 py-0.5 px-1.5 rounded-md">
                                    {suggestion.priceLevel}
                                </p>
                            )}
                        </div>
                        <p className="flex items-start text-sm text-slate-500 mt-2">
                            <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{suggestion.address}</span>
                        </p>
                    </div>
                    {isEvent && suggestion.date && (
                        <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-pink-200">
                            <p className="text-sm font-bold text-pink-700">{suggestion.date.split(',')[0]}, {suggestion.date.split(',')[1]}</p>
                            <p className="text-xs text-pink-600">{suggestion.date.split(',')[2]}</p>
                        </div>
                    )}
                </div>

                {suggestion.description && (
                    <p className="mt-4 text-sm text-slate-700 bg-white/60 p-3 rounded-lg flex items-start">
                        <InformationCircleIcon className="h-5 w-5 mr-2 text-purple-500 flex-shrink-0" />
                        <span>{suggestion.description}</span>
                    </p>
                )}
            </div>

            <div className="bg-white/50 px-5 py-4 border-t border-b border-slate-200/80">
                <div className={`grid grid-cols-1 ${numFriends > 1 ? 'sm:grid-cols-2' : ''} gap-4 text-sm`}>
                    {suggestion.travelInfo.map((info, i) => (
                         <div key={i} className="flex items-center">
                            <UserIcon className={`h-8 w-8 text-purple-500 ${i % 2 === 0 ? 'bg-purple-100 text-purple-500' : 'bg-pink-100 text-pink-500'} rounded-full p-1.5 mr-3`} />
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

            <div className="px-5 py-4">
                <p className="text-sm font-bold text-center text-slate-600 mb-2">How does this sound?</p>
                <div className={`grid grid-cols-${numFriends} gap-2`}>
                     {Array.from({ length: numFriends }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                             <label className={`text-sm font-semibold ${i % 2 === 0 ? 'text-purple-700' : 'text-pink-700'} mb-1`}>
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