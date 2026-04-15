import { CollectionBeforeChangeHook, CollectionConfig, Condition, Validate } from "payload";

import { ReferencesCollection } from "@/collections/references.collection";
import { locationField, LocationParsers } from "@/fields/LocationField/location.field";
import { Resume } from "@/payload-types";
import { generatePreviewUrl, toTitleCase } from "@/utils/fns";

type ExperienceItem = NonNullable<Resume["experience"]>[number];

export const ResumesCollection = {
  slug: "resumes",
  versions: {
    drafts: true,
  },
  timestamps: true,
  admin: {
    useAsTitle: "title",
    preview: ({ id }) => generatePreviewUrl(`/resumes/${id}`),
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        data.title = await (async () => {
          const value = (data.title ?? "").trim();
          if (value) return toTitleCase(value);
          const applicant =
            typeof data.applicant === "number"
              ? await req.payload.findByID({
                  collection: "applicants",
                  id: data.applicant,
                })
              : data.applicant;
          if (!applicant?.fullName) return "Resume";
          return `Resume - ${applicant.fullName}`;
        })();
        return data;
      },
    ] satisfies CollectionBeforeChangeHook<Resume>[],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Title of the resume",
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
            components: {
              Field: "/components/textfields/SplitTextOnPasteTextField.client",
            },
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
    {
      name: "generatePDF",
      type: "ui",
      admin: {
        components: {
          Field: "/components/buttons/GenerateResumePDFButton.tsx",
        },
        position: "sidebar",
      },
    },
  ],
} as const satisfies CollectionConfig<"resumes">;
