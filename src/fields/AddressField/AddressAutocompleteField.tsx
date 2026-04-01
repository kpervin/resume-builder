"use client";

import React, { useState, useEffect, type ChangeEvent } from "react";
import { useField, useForm, TextInput } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import { searchAddress, type PhotonFeature } from "./photon.client";

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

    const formattedAddress = [
      p.housenumber,
      p.street,
      p.city || p.town || p.village,
      p.state,
      p.country,
    ]
      .filter(Boolean)
      .join(", ");

    setInputValue(formattedAddress);
    setValue(formattedAddress);
    setIsOpen(false);

    const basePath = path.replace(`.${name}`, "");

    dispatchFields({
      type: "UPDATE",
      path: `${basePath}.street`,
      value: `${p.housenumber || ""} ${p.street || ""}`.trim(),
    });
    dispatchFields({
      type: "UPDATE",
      path: `${basePath}.city`,
      value: p.city || p.town || p.village || "",
    });
    dispatchFields({
      type: "UPDATE",
      path: `${basePath}.state`,
      value: p.state || "",
    });
    dispatchFields({
      type: "UPDATE",
      path: `${basePath}.zipCode`,
      value: p.postcode || "",
    });
    dispatchFields({
      type: "UPDATE",
      path: `${basePath}.country`,
      value: p.country || "",
    });
  };

  return (
    <div style={{ marginBottom: "1rem", position: "relative" }}>
      <label className="field-label">Search Address (OpenStreetMap)</label>

      <TextInput
        path={path}
        value={inputValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
        placeholder="Start typing an address..."
      />

      {isOpen && results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 10,
            margin: 0,
            padding: 0,
            listStyle: "none",
            background: "var(--theme-elevation-50, #fff)", // adapts to Payload dark/light mode
            border: "1px solid var(--theme-elevation-150, #ccc)",
            borderRadius: "4px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {results.map((feature, i) => {
            const p = feature.properties;
            const label = [
              p.name,
              p.housenumber,
              p.street,
              p.city || p.town || p.village,
              p.state,
              p.postcode,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <li
                key={i}
                // use onMouseDown instead of onClick so it fires before the input loses focus
                onMouseDown={() => handleSelect(feature)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--theme-elevation-100, #eee)",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--theme-elevation-100, #f0f0f0)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
