"use client";

import { FieldDescription, FieldError, FieldLabel, TextInput, useField } from "@payloadcms/ui";
import type { TextFieldClientProps } from "payload";
import React, { ChangeEvent, FC, useCallback } from "react";

const PhoneField: FC<TextFieldClientProps> = ({ path, field: { label, admin }, ...props }) => {
  const { value, setValue, showError } = useField<string>({ path });

  const formatPhoneNumber = (val: string) => {
    if (!val) return "";
    const digits = val.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      setValue(rawValue);
    },
    [setValue],
  );

  const displayValue = formatPhoneNumber(value || "");

  return (
    <>
      <FieldLabel label={label} />
      <TextInput
        {...props}
        path={path}
        value={displayValue}
        onChange={handleChange}
        htmlAttributes={{
          autoComplete: "tel",
          // @ts-expect-error not defined but accepted
          type: "tel",
        }}
      />
      <FieldDescription description={admin?.description} path={path} />
      {showError && <FieldError path={path} />}
    </>
  );
};

export default PhoneField;
