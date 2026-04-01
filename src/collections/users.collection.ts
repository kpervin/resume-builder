import type { CollectionConfig, FieldHook } from "payload";

import { addressField } from "@/fields/AddressField/address.field";
import { User } from "@/payload-types";

export const UsersCollection = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [
    {
      type: "group",
      name: "name",
      hooks: {
        afterChange: [
          (({ value }) => {
            if (!value) return value;
            value.fullName = `${value?.firstName} ${value?.lastName}`;
            return value;
          }) satisfies FieldHook<User, User["name"]>,
        ],
      },
      fields: [
        { name: "firstName", type: "text" },
        { name: "lastName", type: "text" },
        {
          name: "fullName",
          type: "text",
          virtual: true,
          admin: {
            readOnly: true,
          },
          hooks: {
            afterRead: [
              (({ siblingData }) =>
                `${siblingData?.firstName} ${siblingData?.lastName}`) satisfies FieldHook<
                User,
                NonNullable<User["name"]>["fullName"],
                User["name"]
              >,
            ],
          },
        },
      ],
    },
    addressField,
  ],
} as const satisfies CollectionConfig<"users">;
