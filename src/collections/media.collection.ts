import type { CollectionConfig } from "payload";

export const MediaCollection = {
  slug: "media",
  access: {
    read: () => true,
  },
  timestamps: true,
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
  ],
  upload: true,
} as const satisfies CollectionConfig<"media">;
