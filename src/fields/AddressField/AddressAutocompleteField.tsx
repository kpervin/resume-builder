"use client";

import { TextInput, useField, useForm } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import React, { useEffect, useState } from "react";

import { type PhotonFeature, searchAddress } from "./photon.client";

import styles from "./AddressAutocompleteField.module.scss";

function formatAddress(feature: PhotonFeature) {
  const p = feature.properties;

  return [p.name, p.housenumber, p.street, p.city || p.town || p.village, p.state, p.postcode]
    .filter(Boolean)
    .join(", ");
}

const AddressAutocomplete: TextFieldClientComponent = (props) => {
  const {
    path,
    field: { name },
  } = props;
  const { value, setValue } = useField<string>({ path });
  const { dispatchFields } = useForm();

  const [inputValue, setInputValue] = useState(value || "");
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!inputValue || inputValue === value) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const features = await searchAddress(inputValue);
        setResults(features);
        setIsOpen(true);
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, value]);

  const handleSelect = (feature: PhotonFeature) => {
    const p = feature.properties;

    const formattedAddress = formatAddress(feature);

    setInputValue(formattedAddress);
    setValue(formattedAddress);
    setIsOpen(false);

    const basePath = path.replace(`.${name}`, "");

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
    <div className={styles.wrapper}>
      <label className="field-label">Search Address (OpenStreetMap)</label>

      <TextInput
        hasMany={false} // Only for type-safety
        path={path}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        placeholder="Start typing an address..."
      />
      {isOpen && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((feature, i) => (
            <li key={i} onMouseDown={() => handleSelect(feature)} className={styles.dropdownItem}>
              {formatAddress(feature)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
