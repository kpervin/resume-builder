"use client";

import { google } from "@googlemaps/places/build/protos/protos";
import { useField, useForm } from "@payloadcms/ui";
import type { FormState, TextFieldClientProps } from "payload";
import { FieldState } from "payload";
import React, { useMemo, useTransition } from "react";
import { v4 } from "uuid";

import { Autocomplete } from "@/components/textfields/autocomplete/Autocomplete";
import {
  fetchPlace,
  fetchPlaceSuggestions,
  GooglePlaceStub,
} from "@/fields/LocationField/google.client";
import { parseLocationTemplate } from "@/fields/LocationField/utils";
import { Location } from "@/payload-types";

type LocationAutocompleteFieldClientProps = TextFieldClientProps & {
  template: string;
};

function locationFields<T extends string>(
  basePath: T,
  fields: { [K in keyof Location]?: FieldState },
): FormState {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [`${basePath}.${k}`, v]));
}

function parseAddressComponents(
  components: google.maps.places.v1.Place.IAddressComponent[],
  fullAddress: string,
): Location {
  const getComponent = (type: string, useShort = false) =>
    components.find((c) => c.types?.includes(type))?.[useShort ? "shortText" : "longText"] || null;
  const streetNumber = getComponent("street_number");
  const route = getComponent("route");
  return {
    fullAddress,
    street: streetNumber ? `${streetNumber} ${route}` : route,
    city: getComponent("locality"),
    state: getComponent("administrative_area_level_1", true),
    postalCode: getComponent("postal_code"),
    country: getComponent("country"),
  };
}

function LocationAutocompleteFieldClient({
  path,
  field,
  template,
}: LocationAutocompleteFieldClientProps) {
  const { name } = field;
  const { value, setValue } = useField<string>({ path });
  const { dispatchFields } = useForm();
  const sessionToken = useMemo(() => v4(), []);
  const [_, startTransition] = useTransition();

  const handleGoogleApiSelect = (stub: GooglePlaceStub) => {
    startTransition(async () => {
      const basePath = path.replace(`.${name}`, "");
      const place = await fetchPlace(stub.place, sessionToken);
      if (place && place.addressComponents) {
        const locationData = parseAddressComponents(
          place.addressComponents,
          place.formattedAddress ?? "",
        );
        setValue(parseLocationTemplate(template, locationData));
        dispatchFields({
          type: "UPDATE_MANY",
          formState: locationFields(basePath, {
            fullAddress: { value: locationData.fullAddress, valid: true },
            street: { value: locationData.street, valid: true },
            city: { value: locationData.city, valid: true },
            state: { value: locationData.state, valid: true },
            postalCode: { value: locationData.postalCode, valid: true },
            country: { value: locationData.country, valid: true },
          }),
        });
      }
    });
  };

  const renderPlace = (place: GooglePlaceStub) => {
    return place.text;
  };

  return (
    <Autocomplete
      {...field}
      label={field.label}
      path={path}
      value={value}
      onChange={setValue}
      fetchSuggestions={(query) => fetchPlaceSuggestions(query, sessionToken)}
      onSelect={handleGoogleApiSelect}
      renderItem={renderPlace}
      keyMapper={(item) => item.placeId}
    />
  );
}

export default LocationAutocompleteFieldClient;
