// import { PlacesClient } from "@googlemaps/places";

type PhotonFeatureProperties = {
  osm_type: "N" | "W" | "R";
  osm_id: number;
  osm_key: string;
  osm_value: string;
  type: string;
  name: string;
  country?: string;
  countrycode?: string;
  county?: string;
  state?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  district?: string;
  street?: string;
  housenumber?: string;
  extent?: [number, number, number, number]; // [west, north, east, south]
};

export type PhotonFeature = {
  type: "Feature";
  properties: PhotonFeatureProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
};

export type PhotonResponse = {
  type: "FeatureCollection";
  features: PhotonFeature[];
};

export type LocationFields = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

/**
 * Strategy map for street formatting
 */
const streetMappers: Record<string, (p: PhotonFeatureProperties) => string> = {
  house: (p) => `${p.housenumber || ""} ${p.street || ""}`.trim(),
  street: (p) => p.name,
};

/**
 * Strategy map for city formatting
 */
const cityMappers: Record<string, (p: PhotonFeatureProperties) => string> = {
  city: (p) => p.name,
  town: (p) => p.name,
  village: (p) => p.name,
};

/**
 * Flattens a Photon result into Payload-compatible fields
 */
export function mapPhotonToLocation(feature: PhotonFeature): LocationFields {
  const p = feature.properties;

  const street = streetMappers[p.type]?.(p) || "";
  const city = cityMappers[p.type]?.(p) || p.city || p.town || p.village || "";

  return {
    street,
    city,
    state: p.state || "",
    postalCode: p.postcode || "",
    country: p.country || "",
  };
}

export async function searchAddress(query: string, limit = 5): Promise<PhotonFeature[]> {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(`Photon API error: ${res.status}`);
  const data: PhotonResponse = await res.json();
  return data.features;
}
