import { FieldHook, GroupField, TextField } from "payload";

import { Address, User } from "@/payload-types";

const AddressPartOpts = {
  admin: {
    // hidden: true,
    readOnly: true,
  },
} as const satisfies Omit<TextField, "name" | "type">;

export const addressField = {
  name: "address",
  interfaceName: "Address",
  type: "group",
  fields: [
    {
      name: "autocomplete",
      type: "text",
      virtual: true,
      admin: { components: { Field: "/fields/AddressField/AddressAutocompleteField.tsx" } },
      hooks: {
        afterRead: [
          ((args) => {
            return (
              args.value ??
              `${args.siblingData?.street}, ${args.siblingData?.city}, ${args.siblingData?.state}, ${args.siblingData?.postalCode}, ${args.siblingData?.country}`
            );
          }) satisfies FieldHook<User, Address["autocomplete"], Address>,
        ],
      },
    },
    { name: "street", type: "text", ...AddressPartOpts },
    { name: "city", type: "text", ...AddressPartOpts },
    { name: "state", type: "text", ...AddressPartOpts },
    { name: "postalCode", type: "text", ...AddressPartOpts },
    { name: "country", type: "text", ...AddressPartOpts },
  ],
} satisfies GroupField;
