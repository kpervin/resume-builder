import { CollectionConfig, Condition, Validate } from "payload";

import { chipField } from "@/fields/ChipField/chip.field";
import { Resume } from "@/payload-types";

type ExperienceItem = NonNullable<Resume["experience"]>[number];

export const ResumesCollection = {
  slug: "resumes",
  versions: {
    drafts: true,
  },
  fields: [
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
      name: "description",
      type: "textarea",
      required: true,
    },
    chipField("skills", "Skills"),
    {
      name: "experience",
      type: "array",
      fields: [
        {
          name: "jobTitle",
          type: "text",
          required: true,
        },
        { name: "company", type: "text", required: true },
        {
          name: "description",
          type: "richText",
          required: true,
        },
        {
          name: "startDate",
          type: "date",
          required: true,
        },
        {
          name: "current",
          type: "checkbox",
        },
        {
          name: "endDate",
          type: "date",
          validate: ((value, { siblingData }) => {
            if (siblingData.current || !value) return true;
            return true;
          }) satisfies Validate<Date, Resume, ExperienceItem>,
          admin: {
            condition: ((_, siblingData) => !siblingData?.current) satisfies Condition<
              Resume,
              ExperienceItem
            >,
          },
        },
      ],
    },
  ],
} satisfies CollectionConfig<"resumes">;
