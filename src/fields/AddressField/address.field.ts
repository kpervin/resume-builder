import { GroupField, TextField } from "payload";

const AddressPartOpts = {
  admin: { hidden: true },
} as const satisfies Omit<TextField, "name" | "type">;

export const addressField = {
  name: "address",
  type: "group",
  fields: [
    {
      name: "autocomplete",
      type: "text",
      virtual: true,
      admin: {
        components: {
          Field: "/fields/AddressField/AddressAutocompleteField.tsx",
        },
      },
    },
    { name: "street", type: "text", ...AddressPartOpts },
    { name: "city", type: "text", ...AddressPartOpts },
    { name: "state", type: "text", ...AddressPartOpts },
    { name: "postalCode", type: "text", ...AddressPartOpts },
    { name: "country", type: "text", ...AddressPartOpts },
  ],
} satisfies GroupField;
