
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FriendInput {
  id: string;
  location: string;
  vibe: string;
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
    }
}
