
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FriendInput {
  id: string;
  location: string;
  distance: string;
  vibe: string;
}

export interface GroupPreferences {
    price: string;
}

export interface FriendLocation {
  address: string;
  coords: Coordinates;
}

export interface TravelInfo {
  distanceFrom: string;
  durationFrom: string;
}

export interface Suggestion {
  type: 'place' | 'event';
  name: string;
  venue: string;
  address: string;
  lat: number;
  lng: number;
  travelInfo: TravelInfo[];
  date?: string;
  description?: string;
  url?: string;
  priceLevel?: string;
}

export type SuggestionIdentifier = string;

export type Ratings = {
  [key: SuggestionIdentifier]: { [friendIndex: number]: number };
};

export interface ResultsState {
    locations: FriendLocation[];
    midpoint: Coordinates;
    suggestions: Suggestion[];
    summary: string;
    searchParams: {
      friends: FriendInput[];
      preferences: GroupPreferences;
    }
}
