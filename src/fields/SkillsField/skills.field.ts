import type { TextField, TextFieldManyValidation } from "payload";

export const skillsField = (
  options: Omit<TextField, "hasMany" | "name" | "type"> & {
    validate?: TextFieldManyValidation;
  } = {},
): TextField => {
  return {
    ...options,
    admin: {
      description: "Add skills relevant",
      ...options.admin,
      components: {
        ...options.admin?.components,
        Field: "/components/textfields/SplitTextOnPasteTextField.client",
      },
    },
    hasMany: true,
    name: "skills",
    type: "text",
  };
};
