import { CollectionConfig, Condition, FieldHook, Validate } from "payload";

import { Resume } from "@/payload-types";
import { toTitleCase } from "@/utils/fns";

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
    {
      name: "skillSections",
      type: "array",
      admin: {
        description: "List of skill categories and associated skills",
      },
      fields: [
        {
          name: "category",
          type: "text",
          required: true,
        },
        {
          name: "skills",
          type: "text",
          hasMany: true,
          required: true,
          admin: {
            description: "Add skills relevant to this category",
          },
          hooks: {
            beforeChange: [
              ({ value = [] }) => {
                return value.map(toTitleCase);
              },
            ] satisfies FieldHook<Resume, string[]>[],
          },
          validate: ((value, options) => {
            const { data } = options;
            const allSections = data.skillSections || [];
            if (!value || !Array.isArray(allSections)) {
              return true;
            }
            const allSkills = allSections.flatMap((section) => section.skills || []);
            const duplicates = value.filter((skill) => {
              const occurrences = allSkills.filter(
                (s) => s?.toLowerCase().trim() === skill.toLowerCase().trim(),
              ).length;
              return occurrences > 1;
            });
            if (duplicates.length > 0) {
              return `Duplicate skills found: ${duplicates.join(", ")}`;
            }
            return true;
          }) satisfies Validate<string[], Resume, NonNullable<Resume["skillSections"]>[number]>,
        },
      ],
    },
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
