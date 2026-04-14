import { CollectionConfig, Condition, FieldHook, Validate } from "payload";

import { ReferencesCollection } from "@/collections/references.collection";
import { locationField, LocationParsers } from "@/fields/LocationField/location.field";
import { Resume } from "@/payload-types";
import { toTitleCase } from "@/utils/fns";

type ExperienceItem = NonNullable<Resume["experience"]>[number];

export const ResumesCollection = {
  slug: "resumes",
  versions: {
    drafts: true,
  },
  timestamps: true,
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Title of the resume",
      },
      hooks: {
        beforeChange: [
          async ({ value: _value, siblingData, req }) => {
            const value = (_value ?? "").trim();
            if (value) return toTitleCase(value);
            const applicant =
              typeof siblingData.applicant === "number"
                ? await req.payload.findByID({
                    collection: "applicants",
                    id: siblingData.applicant,
                  })
                : siblingData.applicant;
            if (!applicant?.fullName) return "Resume";
            return `Resume - ${applicant.fullName}`;
          },
        ] satisfies FieldHook<Resume, Resume["title"], Resume>[],
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
          admin: {
            date: {
              pickerAppearance: "monthOnly",
              displayFormat: "MMMM yyyy",
            },
          },
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
            date: {
              pickerAppearance: "monthOnly",
              displayFormat: "MMMM yyyy",
            },

            condition: ((_, siblingData) => !siblingData?.current) satisfies Condition<
              Resume,
              ExperienceItem
            >,
          },
        },
        locationField(LocationParsers.city, {
          required: true,
        }),
      ],
    },
    {
      name: "education",
      type: "array",
      fields: [
        {
          name: "school",
          type: "text",
          required: true,
        },
        {
          name: "degree",
          type: "text",
        },
        {
          name: "startDate",
          type: "date",
          required: true,
          admin: {
            date: {
              pickerAppearance: "monthOnly",
              displayFormat: "MMMM yyyy",
            },
          },
        },
        {
          name: "endDate",
          type: "date",
          admin: {
            date: {
              pickerAppearance: "monthOnly",
              displayFormat: "MMMM yyyy",
            },
          },
        },
      ],
    },
    {
      name: "references",
      type: "relationship",
      relationTo: ReferencesCollection.slug,
      hasMany: true,
    },
  ],
} as const satisfies CollectionConfig<"resumes">;
