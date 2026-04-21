"use client";

import { FieldLabel, TextInput, type TextInputProps } from "@payloadcms/ui";
import React, { type ChangeEvent, useCallback, useId, useRef, useState } from "react";

import { useDebouncedCallback } from "@/hooks/useDebounce";

import styles from "./Autocomplete.module.scss";

export type AutocompleteProps<T> = Omit<TextInputProps, "htmlAttributes" | "onChange"> & {
  fetchSuggestions: (query: string) => Promise<T[]>;
  renderItem: (item: T) => React.ReactNode;
  onSelect: (item: T) => void;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  debounceMs?: number;
  /** Forwarded to TextInput's htmlAttributes.autoComplete */
  autocomplete?: NonNullable<TextInputProps["htmlAttributes"]>["autoComplete"];
  /** Payload path forwarded to TextInput; defaults to "autocomplete-input" */
  path: string;
  keyMapper?: (item: T) => string;
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
  keyMapper,
  ...props
}: AutocompleteProps<T>) {
  const id = useId().replace(/:/g, "");
  const [results, setResults] = useState<T[]>([]);
  const popoverRef = useRef<HTMLUListElement>(null);

  const getSuggestions = useDebouncedCallback(
    useCallback(
      async (text: string) => {
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
      },
      [fetchSuggestions],
    ),
    debounceMs,
  );

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChange(text);

    if (!text) {
      setResults([]);
      if (popoverRef.current?.matches(":popover-open")) popoverRef.current.hidePopover();
      return;
    }
    getSuggestions(text);
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    const el = popoverRef.current;
    if (el && el.matches(":popover-open")) {
      el.hidePopover();
    }
  };

  return (
    <div
      className={styles.wrapper}
      style={{ "--autocomplete-input": `--anchor-${id}` } as React.CSSProperties}
    >
      <FieldLabel path={path} label={label} required={props.required} />
      <div className={styles.textInput}>
        <TextInput
          {...props}
          path={path}
          value={value || ""}
          onChange={handleInputChange}
          placeholder={placeholder}
          {...(autocomplete && {
            htmlAttributes: { autoComplete: autocomplete },
          })}
          hasMany={false}
        />
      </div>
      <ul ref={popoverRef} popover="auto" className={styles.dropdown}>
        {results.map((item, i) => (
          <li
            className={styles.dropdownItem}
            key={keyMapper?.(item) ?? `${id}-${i}`}
            onClick={() => handleSelect(item)}
          >
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}
