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

    const { issues } = v.safeParse(dataSchema, formData);

    if (issues) {
      const flattened = v.flatten<typeof dataSchema>(issues);
      console.log("Validation issues:", flattened);
      if (!flattened.nested) return;
      for (const field of Object.keys(flattened.nested) as (keyof typeof flattened.nested)[]) {
        if (flattened.nested[field] && flattened.nested[field]?.length > 0) {
          dispatchFields({
            type: "UPDATE",
            path: "resume",
            errorMessage: flattened.nested[field][0],
            valid: false,
          });
        }
      }
      return;
    }

    if (!v.is(dataSchema, formData)) return;

    startTransition(async () => {
      try {
        const data = await fetchJobMetadata(formData.jobPostingUrl, formData.resume);

        if (!data) {
          return dispatchFields({
            type: "UPDATE",
            path: "jobPostingUrl",
            errorMessage: "Failed to fetch metadata",
            valid: false,
          });
        }

        dispatchFields({
          type: "UPDATE_MANY",
          formState: {
            jobTitle: { value: data.title, isModified: true },
            company: { value: data.company, isModified: true },
            jobPostingUrl: { value: data.url, isModified: true },
            "location.fullAddress": { value: data.location.fullAddress, isModified: true },
            "location.street": { value: data.location.street, isModified: true },
            "location.city": { value: data.location.city, isModified: true },
            "location.state": { value: data.location.province, isModified: true },
            "location.postalCode": { value: data.location.postalCode, isModified: true },
          },
        });

        dispatchFields({
          type: "UPDATE",
          path: "coverLetter",
          value: data.coverLetterLexical,
          initialValue: data.coverLetterLexical,
          valid: true,
          isModified: true,
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
