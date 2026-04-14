import { CollectionBeforeValidateHook, CollectionConfig, FieldHook } from "payload";
import * as v from "valibot";

import { locationField, LocationParsers } from "@/fields/LocationField/location.field";
import { Applicant } from "@/payload-types";

export const ApplicantsCollection = {
  slug: "applicants",
  admin: {
    useAsTitle: "fullName",
  },
  timestamps: true,
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return;
        data.fullName = `${data.name?.firstName} ${data.name?.lastName}`;
      },
    ] satisfies CollectionBeforeValidateHook<Applicant>[],
  },
  fields: [
    {
      name: "fullName",
      type: "text",
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      type: "group",
      name: "name",
      hooks: {
        afterChange: [
          (({ data, value }) => {
            if (!value || !data) return value;
            data.fullName = `${value?.firstName} ${value?.lastName}`;
            return value;
          }) satisfies FieldHook<Applicant, Applicant["name"]>,
        ],
      },
      fields: [
        { name: "firstName", type: "text" },
        { name: "lastName", type: "text" },
      ],
    },
    locationField(LocationParsers.address, {
      label: "Current Address",
      required: true,
    }),
    {
      name: "phone",
      type: "text",
      admin: { components: { Field: "/fields/PhoneField/PhoneField.tsx" } },
    },
    {
      name: "email",
      type: "email",
      required: true,
    },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        {
          name: "url",
          type: "text",
          required: true,
          validate: (value) => {
            return v.is(v.pipe(v.string(), v.url()), value) ? true : "Please enter a valid URL";
          },
        },
      ],
    },
  ],
} as const satisfies CollectionConfig<"applicants">;
