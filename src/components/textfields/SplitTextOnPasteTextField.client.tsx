"use client";

import { TextField, useField } from "@payloadcms/ui";
import { TextFieldClientComponent } from "payload";
import React from "react";

const SplitTextOnPasteTextField: TextFieldClientComponent = (props) => {
  const { path, field } = props;
  const { value, setValue } = useField<string[]>({ path });

  const handlePasteCapture = (e: React.ClipboardEvent) => {
    if (!("hasMany" in field) || !field.hasMany) return;

    const pastedData = e.clipboardData.getData("text");

    const newItems = pastedData
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    if (newItems.length > 1) {
      e.preventDefault();
      e.stopPropagation();

      const existingValues = Array.isArray(value) ? value : [];
      const combined = Array.from(new Set([...existingValues, ...newItems]));
      setValue(combined);
    }
  };

  return (
    <div onPasteCapture={handlePasteCapture}>
      <TextField {...props} />
    </div>
  );
};

export default SplitTextOnPasteTextField;
