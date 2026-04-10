import type { CollectionConfig } from "payload";

export const UsersCollection = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [],
  timestamps: true,
} as const satisfies CollectionConfig<"users">;
