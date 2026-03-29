import { CollectionConfig } from "payload";
import { chipField } from "@/fields/ChipField";

export const ResumesCollection = {
  slug: "resumes",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    chipField("skills", "Skills"),
    {
      name: "experience",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
        },
        {
          name: "description",
          type: "textarea",
        },
        {
          name: "startDate",
          type: "date",
        },
        {
          name: "endDate",
          type: "date",
        },
        { name: "company", type: "text" },
      ],
    },
  ],
} satisfies CollectionConfig<"resumes">;
