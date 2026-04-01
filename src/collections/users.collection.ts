import type { CollectionConfig, FieldHook } from "payload";
import { User } from "@/payload-types";
import { addressField } from "@/fields/AddressField/address.field";

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
      fields: [
        { name: "firstName", type: "text" },
        { name: "lastName", type: "text" },
        {
          name: "fullName",
          type: "text",
          virtual: true,
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
