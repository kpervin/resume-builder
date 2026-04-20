import { FieldHook, NamedGroupField, TextField } from "payload";

import {
  defineLocationTemplate,
  parseLocationTemplate,
  ValidateTemplate,
} from "@/fields/LocationField/utils";
import { Location, User } from "@/payload-types";

const AddressPartOpts = {
  admin: {
    hidden: true,
    readOnly: true,
  },
} as const satisfies Omit<TextField, "name" | "type">;

export const locationField = <T extends string>(
  template: T & (ValidateTemplate<T> extends true ? unknown : ValidateTemplate<T>),
  options: Omit<NamedGroupField, "type" | "fields" | "name" | "interfaceName"> & {
    name?: string;
  } = {},
): NamedGroupField => ({
  ...options,
  name: "location",
  interfaceName: "Location",
  type: "group",
  label: false,
  admin: { components: { Field: "/components/TransparentGroup.tsx" } },
  fields: [
    {
      name: "fullAddress",
      type: "text",
      virtual: true,
      admin: {
        components: {
          Field: {
            path: "/fields/LocationField/LocationAutocompleteField.client.tsx",
            clientProps: { template },
          },
        },
      },
      label: options.label ?? "Location",
      required: options.required ?? false,
      hooks: {
        afterRead: [
          ((args) => {
            const value = args.value;
            const parsedValue = parseLocationTemplate(template, args.siblingData);
            const templateValue = `${args.siblingData?.street}, ${args.siblingData?.city}, ${args.siblingData?.state}, ${args.siblingData?.postalCode}, ${args.siblingData?.country}`;
            return value ?? parsedValue ?? templateValue;
          }) satisfies FieldHook<User, Location["fullAddress"], Location>,
        ],
      },
    },
    { name: "street", type: "text", ...AddressPartOpts },
    { name: "city", type: "text", ...AddressPartOpts },
    { name: "state", type: "text", ...AddressPartOpts },
    { name: "postalCode", type: "text", ...AddressPartOpts },
    { name: "country", type: "text", ...AddressPartOpts },
  ],
});

export const LocationParsers = {
  address: defineLocationTemplate("$street, $city, $state, $postalCode, $country"),
  city: defineLocationTemplate("$city, $state, $country"),
} as const;
