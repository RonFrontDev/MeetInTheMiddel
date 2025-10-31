import { GoogleGenAI, Type } from "@google/genai";
import type { Coordinates, Suggestion, FriendInput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getAddressForCoordinates = async (coords: Coordinates): Promise<string> => {
    const prompt = `Provide the most precise street address for the coordinates: latitude ${coords.lat}, longitude ${coords.lng}. Respond with ONLY the address as a single string, for example: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA'. Do not include any other text or labels.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error reverse geocoding:", error);
        throw new Error("Failed to get address from coordinates using the Gemini API.");
    }
};

export const getCoordinatesForLocations = async (locations: string[]): Promise<(Coordinates | null)[]> => {
    const locationPrompts = locations.map((loc, i) => `${i + 1}. "${loc}"`).join('\n');
    
    const prompt = `
    For the following locations, provide their latitude and longitude.

    Locations:
    ${locationPrompts}

    Respond ONLY with a JSON object with the structure: {"locations": [{"lat": <number>, "lng": <number>}, ...]}.
    The array must have the same number of items as the input locations, in the same order.
    If a location cannot be found, make its corresponding item in the array null.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                       locations: {
                           type: Type.ARRAY,
                           items: {
                               type: Type.OBJECT,
                               properties: {
                                   lat: { type: Type.NUMBER },
                                   lng: { type: Type.NUMBER }
                               },
                               nullable: true
                           }
                       }
                    }
                }
            }
        });
        const text = response.text.trim();
        const data = JSON.parse(text);
        return data.locations;

    } catch (error) {
        console.error("Error geocoding locations:", error);
        throw new Error("Failed to get coordinates from the Gemini API. One or more locations might be invalid.");
    }
};

export const findMeetingSuggestions = async (
    friends: FriendInput[],
    midpoint: Coordinates, 
    count: number = 5,
    exclude: Suggestion[] = []
): Promise<{ suggestions: Suggestion[], summary: string }> => {
    
    const friendDetails = friends.map((friend, i) => {
        let text = `- Friend ${i + 1} is at: "${friend.location}"`;
        if (friend.vibe) {
            text += ` and wants to do something like "${friend.vibe}".`;
        }
        if (friend.price) {
            text += ` Their price preference is for ${friend.price}.`;
        }
        if (friend.distance) {
            text += ` Their travel preference is for ${friend.distance}.`;
        }
        return text;
    }).join('\n');

    const primaryInstruction = `Your task is to find up to ${count} excellent and highly-rated meeting points that cleverly combine or satisfy the desires of this group. Prioritize places that are popular, well-reviewed, unique, or considered local gems. A key requirement is fairness: also prioritize locations that are an even travel distance and time for all friends, but you must also consider each friend's individual travel preference when making suggestions. Avoid suggestions that are very close to one person but very far from another.`;
    
    let exclusionPrompt = "";
    if (exclude.length > 0) {
        const excludedNames = exclude.map(s => `"${s.name} at ${s.address}"`).join(', ');
        exclusionPrompt = `
        IMPORTANT: The users have already considered and rejected the following places. Do NOT suggest them again: ${excludedNames}.
        `;
    }

    const prompt = `
    Act as an expert local guide and super-concierge with impeccable taste. A group of ${friends.length} friends want to meet up.
    ${friendDetails}

    The geographical center of the group is at latitude ${midpoint.lat} and longitude ${midpoint.lng}.
    
    ${primaryInstruction}
    ${exclusionPrompt}

    First, in the 'summary' field, provide a brief, friendly, one-sentence summary explaining your matching strategy for the group. If you are finding new suggestions to replace rejected ones, do not mention it in the summary; keep the summary focused on the user preferences.

    Then, in the 'suggestions' array, provide the list of suggestions. For each suggestion, you must determine if it's a specific 'place' or a timed 'event'.
    
    For each suggestion, provide all of the following details:
    - type, name, venue, address, lat, lng, date (for events only).
    - description: In this field, write a compelling sentence or two explaining *why* this is a great choice for this specific group. Mention its highlights, popularity, or what makes it unique to justify your selection.
    - A 'priceLevel' field with a rating like "$", "$$", "$$$", or "Free" to indicate the cost. This can be null if not applicable.
    - A 'url' field containing a link to a relevant website for the place or event, such as its official website or a Google Maps link. If a good link isn't available, this can be null.
    - A 'travelInfo' array. This array MUST contain exactly ${friends.length} items, one for each friend in the original order.
    - Each item in 'travelInfo' must have 'distanceFrom' (e.g., "8.4 km") and 'durationFrom' (e.g., "15 mins") from that specific friend's starting location to the suggestion.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    venue: { type: Type.STRING },
                                    address: { type: Type.STRING },
                                    lat: { type: Type.NUMBER },
                                    lng: { type: Type.NUMBER },
                                    date: { type: Type.STRING, nullable: true },
                                    description: { type: Type.STRING },
                                    url: { type: Type.STRING, nullable: true },
                                    priceLevel: { type: Type.STRING, nullable: true },
                                    travelInfo: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                distanceFrom: { type: Type.STRING },
                                                durationFrom: { type: Type.STRING }
                                            },
                                            required: ["distanceFrom", "durationFrom"]
                                        }
                                    }
                                },
                                required: ["type", "name", "venue", "address", "lat", "lng", "description", "travelInfo"],
                            },
                        }
                    },
                    required: ["summary", "suggestions"],
                },
            }
        });
        
        const text = response.text.trim();
        const result = JSON.parse(text);

        result.suggestions = result.suggestions.map((s: any) => ({
            ...s,
            date: s.date === null ? undefined : s.date,
            url: s.url === null ? undefined : s.url,
            priceLevel: s.priceLevel === null ? undefined : s.priceLevel,
        }));

        return result;
    } catch (error) {
        console.error("Error finding suggestions:", error);
        throw new Error(`Failed to find suggestions from the Gemini API.`);
    }
};