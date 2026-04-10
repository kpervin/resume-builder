"use client";

import { FieldError, TextInput, useField, useForm } from "@payloadcms/ui";
import { FormField, TextFieldClientProps } from "payload";
import { FC, useMemo, useState, useTransition } from "react";

import { fetchJobMetadata } from "@/fields/JobPostingUrlField/fetch-job-metadata.server";
import { JobApplication } from "@/payload-types";
import { debounce } from "@/utils/fns";

type JobMetadata = { jobTitle: string; company: string } | null;

const JobPostingUrlField: FC<TextFieldClientProps> = ({ path, field, validate }) => {
  const { dispatchFields } = useForm();
  const { value, setValue, showError, errorMessage } = useField<string>({
    path,
    // @ts-expect-error don't know
    validate,
  });

  const [isPending, startTransition] = useTransition();
  const [metadata, setMetadata] = useState<JobMetadata>(null);

  const handleFetch = (inputValue: string) => {
    if (inputValue.length < 10) return;

    try {
      new URL(inputValue);
      startTransition(async () => {
        const data = await fetchJobMetadata(inputValue);
        if (data) {
          setMetadata(data);
          dispatchFields({
            type: "UPDATE_MANY",
            formState: {
              jobTitle: { value: data.jobTitle },
              company: { value: data.company },
            } satisfies Partial<{ [key in keyof JobApplication]: FormField }>,
          });
          setValue(data.targetUrl);
        }
      });
    } catch (e) {
      console.error("Failed to fetch job metadata:", e);
    }
  };

  const debouncedFetch = useMemo(() => debounce(handleFetch, 1500), [handleFetch]);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <TextInput
        path={path}
        placeholder="Paste job posting URL..."
        {...field}
        value={value}
        hasMany={false}
        onChange={(e) => {
          const val = e.target.value;
          setValue(val);
          debouncedFetch(val);
        }}
      />
      <FieldError path={path} showError={showError} message={errorMessage} />

      {isPending && (
        <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.5rem" }}>
          Fetching job details from LinkedIn...
        </p>
      )}

      {!isPending && metadata && (
        <p style={{ fontSize: "0.875rem", color: "#059669", marginTop: "0.5rem" }}>
          ✅ Loaded: <strong>{metadata.jobTitle}</strong> at <strong>{metadata.company}</strong>
        </p>
      )}
    </div>
  );
};

export default JobPostingUrlField;
