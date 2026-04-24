import { CollectionBeforeValidateHook, CollectionConfig, Validate } from "payload";
import * as v from "valibot";

import { locationField, LocationParsers } from "@/fields/LocationField/location.field";
import { Applicant } from "@/payload-types";
import { Get } from "@/utils/types";

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
        data.fullName = `${data?.firstName} ${data?.lastName}`;
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
      label: "Name",
      fields: [
        {
          type: "row",
          fields: [
            { name: "firstName", type: "text", required: true },
            { name: "lastName", type: "text", required: true },
          ],
        },
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
          validate: ((value) => {
            return v.is(v.pipe(v.string(), v.url()), value) ? true : "Please enter a valid URL";
          }) satisfies Validate<Get<Applicant, "socialLinks[number].url">>,
        },
      ],
    },
  ],
} as const satisfies CollectionConfig<"applicants">;
