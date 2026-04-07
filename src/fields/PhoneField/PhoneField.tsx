"use client";

import { FieldDescription, FieldError, FieldLabel, TextInput, useField } from "@payloadcms/ui";
import type { TextFieldClientProps } from "payload";
import React, { ChangeEvent, FC, useCallback } from "react";

const PhoneField: FC<TextFieldClientProps> = ({ path, field: { label, admin }, ...props }) => {
  const { value, setValue, showError } = useField<string>({ path });

  const formatPhoneNumber = (val: string) => {
    const [_, p1, p2, p3] = val.replace(/\D/g, "").match(/^(\d{0,3})(\d{0,3})(\d{0,4})/) || [];
    if (p3) return `(${p1}) ${p2}-${p3}`;
    if (p2) return `(${p1}) ${p2}`;
    return p1 ? `(${p1}` : "";
  };

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value.replace(/\D/g, "").slice(0, 10)),
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
