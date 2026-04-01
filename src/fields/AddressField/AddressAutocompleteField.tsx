"use client";

import { useField, useForm } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import React from "react";

import { Autocomplete } from "@/components/textfields/autocomplete/Autocomplete";

import { type PhotonFeature, searchAddress } from "./photon.client";

function formatAddress(feature: PhotonFeature) {
  const p = feature.properties;
  return [p.name, p.housenumber, p.street, p.city || p.town || p.village, p.state, p.postcode]
    .filter(Boolean)
    .join(", ");
}

const AddressAutocomplete: TextFieldClientComponent = ({ path, field: { name } }) => {
  const { value, setValue } = useField<string>({ path });
  const { dispatchFields } = useForm();

  const handleSelect = (feature: PhotonFeature) => {
    const formattedAddress = formatAddress(feature);

    setValue(formattedAddress);

    const basePath = path.replace(`.${name}`, "");

    const p = feature.properties;
    dispatchFields({
      type: "UPDATE_MANY",
      formState: {
        [`${basePath}.street`]: {
          value: `${p.housenumber || ""} ${p.street || ""}`.trim(),
        },
        [`${basePath}.city`]: {
          value: p.city || p.town || p.village || "",
        },
        [`${basePath}.state`]: {
          value: p.state || "",
        },
        [`${basePath}.postalCode`]: {
          value: p.postcode || "",
        },
        [`${basePath}.country`]: {
          value: p.country || "",
        },
      },
    });
  };

  return (
    <Autocomplete
      path={path}
      value={value}
      onChange={(val) => setValue(val)}
      onSelect={handleSelect}
      renderItem={formatAddress}
      fetchSuggestions={searchAddress}
    />
  );
};

export default AddressAutocomplete;
