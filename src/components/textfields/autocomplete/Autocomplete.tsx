"use client";

import { TextInput, type TextInputProps } from "@payloadcms/ui";
import React, { type ChangeEvent, useRef, useState } from "react";

import styles from "./Autocomplete.module.scss";

type AutocompleteProps<T> = Omit<TextInputProps, "htmlAttributes" | "onChange"> & {
  fetchSuggestions: (query: string) => Promise<T[]>;
  renderItem: (item: T) => React.ReactNode;
  onSelect: (item: T) => void;
  value: string;
  onChange: (newValue: string) => void;
  label?: React.ReactNode;
  placeholder?: string;
  debounceMs?: number;
  /** Forwarded to TextInput's htmlAttributes.autoComplete */
  autocomplete?: NonNullable<TextInputProps["htmlAttributes"]>["autoComplete"];
  /** Payload path forwarded to TextInput; defaults to "autocomplete-input" */
  path: string;
};

export function Autocomplete<T>({
  fetchSuggestions,
  renderItem,
  onSelect,
  value,
  onChange,
  label,
  placeholder,
  debounceMs = 100,
  autocomplete,
  path,
  ...props
}: AutocompleteProps<T>) {
  const [results, setResults] = useState<T[]>([]);
  const popoverRef = useRef<HTMLUListElement>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChange(text);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!text) {
      setResults([]);
      if (popoverRef.current?.matches(":popover-open")) popoverRef.current.hidePopover();
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetchSuggestions(text);
        setResults(res);

        const el = popoverRef.current;
        if (el) {
          if (res.length > 0 && !el.matches(":popover-open")) {
            el.showPopover();
          } else if (res.length === 0 && el.matches(":popover-open")) {
            el.hidePopover();
          }
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    }, debounceMs);
  };

  const handleSelect = (item: T) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    onSelect(item);
    const el = popoverRef.current;
    if (el && el.matches(":popover-open")) {
      el.hidePopover();
    }
  };

  return (
    <div className={styles.wrapper}>
      <label className="field-label">{label}</label>
      <div className={styles.textInput}>
        <TextInput
          {...props}
          path={path}
          value={value || ""}
          onChange={handleInputChange}
          placeholder={placeholder}
          {...(autocomplete && { htmlAttributes: { autoComplete: autocomplete } })}
          hasMany={false}
        />
      </div>
      <ul ref={popoverRef} popover="auto" className={styles.dropdown}>
        {results.map((item, i) => (
          <li className={styles.dropdownItem} key={i} onClick={() => handleSelect(item)}>
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}
