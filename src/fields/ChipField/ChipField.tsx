"use client";
import React, { useState, useRef } from "react";
import { useField, FieldLabel } from "@payloadcms/ui";
import type { JsonFieldClientProps } from "payload";

export function ChipField({ field, path }: JsonFieldClientProps) {
  const { value, setValue } = useField<string[]>({ path: path ?? field.name });
  const chips = value ?? [];
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addChip = () => {
    const trimmed = input.trim();
    if (trimmed && !chips.includes(trimmed)) {
      setValue([...chips, trimmed]);
    }
    setInput("");
  };

  const removeChip = (chip: string) => {
    setValue(chips.filter((c) => c !== chip));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip();
    } else if (e.key === "Backspace" && input === "" && chips.length > 0) {
      removeChip(chips[chips.length - 1]);
    }
  };

  return (
    <div className="chip-field">
      <FieldLabel label={field.label ?? field.name} />
      <div className="chip-field__container" onClick={() => inputRef.current?.focus()}>
        {chips.map((chip) => (
          <span key={chip} className="chip-field__chip">
            {chip}
            <button
              type="button"
              className="chip-field__remove"
              onClick={(e) => {
                e.stopPropagation();
                removeChip(chip);
              }}
              aria-label={`Remove ${chip}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="chip-field__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addChip}
          placeholder={chips.length === 0 ? "Type and press Enter…" : ""}
        />
      </div>
    </div>
  );
}
