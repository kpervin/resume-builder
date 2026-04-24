import { CollectionConfig, FilterOptions, Validate } from "payload";
import * as v from "valibot";

import { GeneratePDFButtonProps } from "@/components/buttons/GeneratePDFButton";
import { locationField, LocationParsers } from "@/fields/LocationField/location.field";
import { JobApplication } from "@/payload-types";
import { generatePreviewUrl } from "@/utils/fns";
import { condition } from "@/utils/payload-helpers";

export const JobApplicationsCollection = {
  slug: "job-applications",
  admin: {
    useAsTitle: "jobTitle",
    preview: ({ id }) => generatePreviewUrl(`/job-applications/${id}`),
    listSearchableFields: ["jobTitle", "company"],
    defaultColumns: [
      "jobTitle",
      "company",
      "jobPostingUrl",
      "_status",
    ] satisfies (keyof JobApplication)[],
  },
  versions: {
    drafts: true,
  },
  timestamps: true,
  fields: [
    {
      name: "jobPostingUrl",
      type: "text",
      required: true,
      admin: {
        description: "Link to the job posting",
      },
      validate: ((value) => {
        return v.is(v.pipe(v.string(), v.url()), value) ? true : "Please enter a valid URL";
      }) satisfies Validate<string>,
    },
    {
      name: "jobTitle",
      type: "text",
      required: true,
      admin: {
        description: "Title of the position being applied for",
      },
    },
    {
      name: "company",
      type: "text",
      required: true,
      index: true,
      admin: {
        description: "Company applying for the position",
      },
    },
    locationField(LocationParsers.address, {
      required: true,
    }),
    {
      name: "applicant",
      type: "relationship",
      relationTo: "applicants",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "resume",
      type: "relationship",
      relationTo: "resumes",
      required: true,
      admin: {
        description: "Resume to submit with this application",
        position: "sidebar",
        condition: (entry) => !!entry.applicant,
      },
      filterOptions: (({ data }) => {
        if (!data.applicant) return true;
        return {
          applicant: {
            equals: typeof data.applicant === "number" ? data.applicant : data.applicant.id,
          },
        };
      }) satisfies FilterOptions<JobApplication>,
    },
    {
      name: "coverLetter",
      type: "richText",
      required: true,
      admin: {
        description: "Cover letter written for this application",
      },
    },
    {
      name: "submittedAt",
      type: "date",
      admin: {
        description: "Timestamp when the application was submitted",
        position: "sidebar",
      },
    },
    {
      type: "row",
      admin: {
        position: "sidebar",
      },
      fields: [
        {
          name: "fetchMetadata",
          type: "ui",
          admin: {
            components: {
              Field: "/components/buttons/FetchMetadataButton.tsx",
            },
            condition: condition<JobApplication>((data) => {
              return !!(data.jobPostingUrl && data.resume);
            }),
          },
        },
        {
          name: "generatePDF",
          type: "ui",
          admin: {
            components: {
              Field: {
                path: "/components/buttons/GeneratePDFButton.tsx",
                clientProps: {
                  previewPath: `/job-applications/:id`,
                } satisfies GeneratePDFButtonProps,
              },
            },
            position: "sidebar",
            condition: condition<JobApplication>((data) => {
              return !!data.coverLetter;
            }),
          },
        },
      ],
    },
  ],
} as const satisfies CollectionConfig<"job-applications">;
