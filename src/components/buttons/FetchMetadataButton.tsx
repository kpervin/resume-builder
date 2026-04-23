"use client";

import { Button, useForm } from "@payloadcms/ui";
import { UIFieldClient } from "payload";
import { type FC, useRef, useTransition } from "react";
import { Result } from "typescript-result";
import * as v from "valibot";

import { JobApplication } from "@/payload-types";
import { fetchJobMetadata } from "@/server-functions/job-metadata/fetch-job-metadata.server";
import { ParseError, ValidationError } from "@/utils/errors";
import { SerializableError } from "@/utils/server-result";

const FormSchema = v.object({
  resume: v.number("Please select a resume."),
  jobPostingUrl: v.message(v.pipe(v.string(), v.url()), "Invalid URL provided."),
} satisfies Partial<Record<keyof JobApplication, unknown>>);

const FetchMetadataButton: FC<UIFieldClient> = () => {
  const [isPending, startTransition] = useTransition();
  const { dispatchFields, getData } = useForm();

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const errorMsgRef = useRef<HTMLParagraphElement | null>(null);

  const showDialogError = (err: SerializableError) => {
    if (!(dialogRef.current && errorMsgRef.current)) return;
    errorMsgRef.current.innerText = err.message;
    dialogRef.current.showModal();
  };

  const closeDialog = () => {
    if (!dialogRef.current) return;
    dialogRef.current.close();
  };

  const handleClick = () => {
    const formData = getData();

    const schemaValidation = Result.try(
      () => v.parse(FormSchema, formData),
      (err) => {
        if (!(err instanceof Error)) return new ParseError("Could not parse required schema.");
        if (!(err instanceof v.ValiError)) return new ParseError(err.message, { cause: err });
        const flattened = v.flatten<typeof FormSchema>(err.issues);
        if (!flattened.nested) return new ParseError(err.message, { cause: err });
        let errStr = ``;
        for (const [key, issues] of Object.entries(flattened.nested)) {
          errStr += `${key}: ${issues.join(", ")}\n`;
        }
        return new ValidationError(`Could not parse required schema: \n\n${errStr}`, {
          cause: err,
        });
      },
    );

    if (!schemaValidation.ok) {
      return showDialogError(schemaValidation.error);
    }

    startTransition(async () => {
      const data = await fetchJobMetadata(
        schemaValidation.value.jobPostingUrl,
        schemaValidation.value.resume,
      );

      if (!data.ok) {
        return showDialogError(data.error);
      }

      const { title, company, url, location, coverLetterLexical } = data.value;

      dispatchFields({
        type: "UPDATE_MANY",
        formState: {
          jobTitle: { value: title, isModified: true },
          company: { value: company, isModified: true },
          jobPostingUrl: { value: url, isModified: true },
          "location.fullAddress": {
            value: location.fullAddress,
            isModified: true,
          },
          "location.street": { value: location.street, isModified: true },
          "location.city": { value: location.city, isModified: true },
          "location.state": { value: location.province, isModified: true },
          "location.postalCode": {
            value: location.postalCode,
            isModified: true,
          },
        },
      });

      dispatchFields({
        type: "UPDATE",
        path: "coverLetter",
        value: coverLetterLexical,
        initialValue: coverLetterLexical,
        valid: true,
        isModified: true,
      });
    });
  };

  return (
    <div>
      <dialog className={"payload-custom-dialog"} ref={dialogRef}>
        <p ref={errorMsgRef} />
        <div className={"dialog-footer"}>
          <Button margin={false} buttonStyle="pill" type={"button"} onClick={closeDialog}>
            Close
          </Button>
        </div>
      </dialog>
      <Button buttonStyle="pill" onClick={handleClick} disabled={isPending}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Generate Metadata</span>
          {isPending ? <span className={"spinner"} /> : ""}
        </div>
      </Button>
    </div>
  );
};

export default FetchMetadataButton;
