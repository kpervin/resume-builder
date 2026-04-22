import type { CollectionConfig } from "payload";

import { Reference } from "@/payload-types";
import { condition } from "@/utils/payload-helpers";
import type { Get } from "@/utils/types";

export const ReferencesCollection = {
  slug: "references",
  admin: {
    useAsTitle: "name",
  },
  timestamps: true,
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "company",
      type: "text",
    },
    {
      name: "contactMethods",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        {
          name: "type",
          type: "select",
          options: [
            {
              label: "Phone",
              value: "phone",
            },
            {
              label: "Email",
              value: "email",
            },
          ],
        },
        {
          name: "email",
          type: "email",
          required: true,
          admin: {
            condition: condition<Reference, Get<Reference, "contactMethods[]">>(
              (_, siblingData) => siblingData?.type === "email",
            ),
          },
        },
        {
          name: "phone",
          type: "text",
          admin: {
            condition: condition<Reference, Get<Reference, "contactMethods[]">>(
              (_, siblingData) => siblingData?.type === "phone",
            ),
            components: {
              Field: "/fields/PhoneField/PhoneField.tsx",
            },
          },
        },
      ],
    },
  ],
} as const satisfies CollectionConfig<"references">;
