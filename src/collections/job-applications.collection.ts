import { CollectionConfig } from "payload";

import { jobPostingUrlField } from "@/fields/JobPostingUrlField/job-posting-url.field";

export const JobApplicationsCollection = {
  slug: "job-applications",
  admin: {
    useAsTitle: "jobTitle",
  },
  versions: {
    drafts: true,
  },
  timestamps: true,
  fields: [
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
      admin: {
        description: "Company applying for the position",
      },
    },
    jobPostingUrlField,
    {
      name: "resume",
      type: "relationship",
      relationTo: "resumes",
      required: true,
      admin: {
        description: "Resume to submit with this application",
      },
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
      name: "applicant",
      type: "relationship",
      relationTo: "applicants",
      required: true,
      admin: {
        position: "sidebar",
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
  ],
} as const satisfies CollectionConfig<"job-applications">;
