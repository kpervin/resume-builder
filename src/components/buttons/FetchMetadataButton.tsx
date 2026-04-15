"use client";

import { Button, useForm } from "@payloadcms/ui";
import { UIFieldClient } from "payload";
import { type FC, useTransition } from "react";
import * as v from "valibot";

import { JobApplication } from "@/payload-types";
import { fetchJobMetadata } from "@/server-functions/job-metadata/fetch-job-metadata.server";

const dataSchema = v.object({
  resume: v.number(),
  jobPostingUrl: v.pipe(v.string(), v.url()),
} satisfies Partial<Record<keyof JobApplication, unknown>>);

const FetchMetadataButton: FC<UIFieldClient> = () => {
  const [isPending, startTransition] = useTransition();
  const { dispatchFields, getData } = useForm();

  const handleClick = () => {
    const formData = getData();

    if (!v.is(dataSchema, formData)) return;

    startTransition(async () => {
      try {
        const data = await fetchJobMetadata(formData.jobPostingUrl, formData.resume);

        if (!data) {
          return dispatchFields({
            type: "UPDATE",
            path: "jobPostingUrl",
            errorMessage: "Failed to fetch metadata",
          });
        }

        dispatchFields({
          type: "UPDATE_MANY",
          formState: {
            jobTitle: { value: data.title },
            company: { value: data.company },
            jobPostingUrl: { value: data.url },
            "location.fullAddress": { value: data.location.fullAddress },
            "location.street": { value: data.location.street },
            "location.city": { value: data.location.city },
            "location.state": { value: data.location.province },
            "location.postalCode": { value: data.location.postalCode },
          },
        });

        dispatchFields({
          type: "UPDATE",
          path: "coverLetter",
          value: data.coverLetterLexical,
          initialValue: data.coverLetterLexical,
          valid: true,
        });
      } catch (error) {
        console.error("Failed to fetch metadata", error);
      }
    });
  };

  return (
    <Button buttonStyle="pill" onClick={handleClick} disabled={isPending}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>Generate Metadata</span>
        {isPending ? <span className={"spinner"} /> : ""}
      </div>
    </Button>
  );
};

export default FetchMetadataButton;
