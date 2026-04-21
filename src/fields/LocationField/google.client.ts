"use server";

import { PlacesClient } from "@googlemaps/places";
import { pipe, regex, safeParse, string } from "valibot";

const placesClient = new PlacesClient({
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
});

export type GooglePlaceStub = {
  place: string;
  placeId: string;
  text: string;
};

export async function fetchPlaceSuggestions(
  query: string,
  token: string,
): Promise<GooglePlaceStub[]> {
  console.log("Fetching based on query:", query);
  const [response] = await placesClient.autocompletePlaces({
    input: query,
    sessionToken: token,
  });
  return (response.suggestions || [])?.flatMap((suggestion) => {
    if (
      suggestion.placePrediction?.placeId &&
      suggestion.placePrediction?.text?.text &&
      suggestion.placePrediction?.place
    ) {
      return [
        {
          placeId: suggestion.placePrediction?.placeId,
          text: suggestion.placePrediction?.text?.text,
          place: suggestion.placePrediction?.place,
        },
      ];
    }
    return [];
  });
}

const PlaceIdSchema = pipe(string(), regex(/^places\/[a-zA-Z0-9_-]+$/));
export async function fetchPlace(place: string, token: string) {
  const { issues } = safeParse(PlaceIdSchema, place);
  if (issues) throw new Error(`Invalid place id:\n${JSON.stringify(issues, null, 2)}`);

  const [response] = await placesClient.getPlace(
    {
      name: place,
      sessionToken: token,
    },
    {
      otherArgs: {
        headers: {
          "X-Goog-FieldMask": "id,formattedAddress,addressComponents",
        },
      },
    },
  );

  return response;
}
