import type { Field } from "payload";

export const chipField = (name: string, label?: string): Field => ({
  name,
  type: "json",
  label,
  admin: {
    components: {
      Field: "@/fields/ChipField/ChipField#ChipField",
    },
  },
});
