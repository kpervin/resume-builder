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
    coordinates: [number, number]; // [longitude, latitude]
  };
};

type PhotonResponse = {
  type: "FeatureCollection";
  features: PhotonFeature[];
};

export async function searchAddress(query: string, limit = 5): Promise<PhotonFeature[]> {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(`Photon API error: ${res.status}`);
  const data: PhotonResponse = await res.json();
  return data.features;
}
