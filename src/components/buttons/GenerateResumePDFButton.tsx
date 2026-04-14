"use client";

import { Button, FieldError, useDocumentInfo, useForm } from "@payloadcms/ui";
import type { TypeWithID, UIFieldClient } from "payload";
import React, { FC, useMemo, useState, useTransition } from "react";

function getResumeIdFromUnknown(
  input: string | number | TypeWithID | null,
): TypeWithID["id"] | null {
  if (!input) return null;
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string") return input;
  if (typeof input === "object" && "id" in input) return input.id;
  return null;
}

const GenerateResumePDFButton: FC<UIFieldClient & { title?: string; resumePath?: string }> = ({
  title = "Generate PDF",
  resumePath = "resume",
}) => {
  const { id, collectionSlug } = useDocumentInfo();
  const { getData, dispatchFields } = useForm();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const resumeId = useMemo(() => {
    if (collectionSlug === "resumes") {
      return id;
    }
    const data = getData();
    return getResumeIdFromUnknown(data[resumePath]);
  }, [collectionSlug, getData, id]);

  const handleClick = async () => {
    startTransition(async () => {
      setError(undefined);
      if (!resumeId) {
        dispatchFields({
          type: "UPDATE",
          path: resumePath,
          errorMessage: "Select a resume before generating a PDF.",
        });
        return;
      }
      try {
        window.location.assign(`/admin/resumes/${resumeId}/pdf`);
        return;
      } catch (e) {
        console.error("Failed to start PDF download", e);
        setError("Failed to start PDF download");
      }
    });
  };

  return (
    <span style={{ margin: "0 1rem" }}>
      <Button buttonStyle="pill" onClick={handleClick} disabled={isPending}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{title}</span>
          {isPending ? <span className={"spinner"} /> : ""}
        </div>
      </Button>
      <FieldError showError={!!error} message={error} />
    </span>
  );
};

export default GenerateResumePDFButton;
