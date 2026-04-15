"use client";

import { Button, FieldError, useDocumentInfo } from "@payloadcms/ui";
import type { UIFieldClient } from "payload";
import React, { FC, useState, useTransition } from "react";

export type GeneratePDFButtonProps = {
  title?: string;
  previewPath?: `${string}/:id` | `${string}/:id/${string}`;
};

const GeneratePDFButton: FC<UIFieldClient & GeneratePDFButtonProps> = ({
  title = "Generate PDF",
  previewPath,
}) => {
  const { id } = useDocumentInfo();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const handleClick = async () => {
    startTransition(async () => {
      setError(undefined);
      if (!(id && previewPath)) return;
      try {
        const path = previewPath.replaceAll(":id", String(id));
        window.location.assign(`${path}?disposition=attachment`);
        return;
      } catch (e) {
        console.error("Failed to start PDF download", e);
        setError("Failed to start PDF download");
      }
    });
  };

  return (
    <>
      <Button buttonStyle="pill" onClick={handleClick} disabled={isPending}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{title}</span>
          {isPending ? <span className={"spinner"} /> : ""}
        </div>
      </Button>
      <FieldError showError={!!error} message={error} />
    </>
  );
};

export default GeneratePDFButton;
