import { Field, Validate } from "payload";

export const jobPostingUrlField = {
  name: "jobPostingUrl",
  type: "text",
  required: true,
  admin: {
    description: "Link to the job posting",
    components: {
      Field: "/fields/JobPostingUrlField/JobPostingUrlField.tsx",
    },
  },
  validate: ((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return true;
    } catch {
      return "Please enter a valid URL";
    }
  }) satisfies Validate,
} as const satisfies Field;
