"use client";

import { useField, useForm } from "@payloadcms/ui";
import type { TextFieldClientProps } from "payload";
import React, { FC } from "react";

import { Autocomplete } from "@/components/textfields/autocomplete/Autocomplete";

import { mapPhotonToLocation, type PhotonFeature, searchAddress } from "./photon.client";
import { parseLocationTemplate } from "./utils";

const LocationAutocompleteField: FC<TextFieldClientProps & { template: string }> = ({
  path,
  field,
  template,
}) => {
  const { name } = field;
  const { value, setValue } = useField<string>({ path });
  const { dispatchFields } = useForm();

  const renderItem = (feature: PhotonFeature) => {
    const fields = mapPhotonToLocation(feature);
    return parseLocationTemplate(template, fields);
  };

  const handleSelect = (feature: PhotonFeature) => {
    const fields = mapPhotonToLocation(feature);
    const formattedLabel = parseLocationTemplate(template, fields);

    setValue(formattedLabel);

    const basePath = path.replace(`.${name}`, "");
    const updates = Object.entries(fields).reduce(
      (acc, [key, val]) => {
        acc[`${basePath}.${key}`] = { value: val };
        return acc;
      },
      {} as Record<string, { value: string }>,
    );

    dispatchFields({ type: "UPDATE_MANY", formState: updates });
  };

  return (
    <Autocomplete
      {...field}
      label={field.label}
      path={path}
      value={value}
      onChange={setValue}
      onSelect={handleSelect}
      renderItem={renderItem}
      fetchSuggestions={searchAddress}
    />
  );
};

export default LocationAutocompleteField;
