import deepmerge from "@fastify/deepmerge";
import { FieldHook, NamedGroupField, TextField } from "payload";

import { env } from "@/env";
import {
  defineLocationTemplate,
  parseLocationTemplate,
  ValidateTemplate,
} from "@/fields/LocationField/utils";
import { Location, User } from "@/payload-types";

const deepmergeFn = deepmerge({ all: true });

export const locationField = <T extends string>(
  template: T & (ValidateTemplate<T> extends true ? unknown : ValidateTemplate<T>),
  options: Omit<NamedGroupField, "type" | "fields" | "name" | "interfaceName"> & {
    name?: string;
  } = {},
): NamedGroupField => {
  const AddressPartOpts = (
    env.NEXT_PUBLIC_GOOGLE_MAPS_API_ENABLED
      ? {
          admin: {
            hidden: true,
            readOnly: true,
          },
        }
      : {}
  ) satisfies Omit<TextField, "name" | "type">;
  return {
    ...options,
    label: options.label ?? false,
    name: "location",
    interfaceName: "Location",
    type: "group",
    admin: { components: { Field: "/components/TransparentGroup.tsx" } },
    fields: [
      {
        name: "fullAddress",
        type: "text",
        virtual: true,
        admin: env.NEXT_PUBLIC_GOOGLE_MAPS_API_ENABLED
          ? {
              components: {
                Field: {
                  path: "/fields/LocationField/LocationAutocompleteField.tsx",
                  clientProps: { template },
                },
              },
            }
          : { readOnly: true, hidden: true },
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
      {
        type: "row",
        fields: [
          deepmergeFn(
            {
              name: "street",
              type: "text",
              admin: {
                autoComplete: "address-line1",
              },
            } satisfies TextField,
            AddressPartOpts,
          ),
          deepmergeFn(
            {
              name: "city",
              type: "text",
              admin: {
                autoComplete: "address-level2",
              },
            } satisfies TextField,
            AddressPartOpts,
          ),
          deepmergeFn(
            {
              name: "state",
              type: "text",
              admin: {
                autoComplete: "address-level1",
              },
            } satisfies TextField,
            AddressPartOpts,
          ),
          deepmergeFn(
            {
              name: "postalCode",
              type: "text",
              admin: {
                autoComplete: "postal-code",
              },
            } satisfies TextField,
            AddressPartOpts,
          ),
          deepmergeFn(
            {
              name: "country",
              type: "text",
              admin: {
                autoComplete: "country",
              },
            } satisfies TextField,
            AddressPartOpts,
          ),
        ],
      },
    ],
  };
};

export const LocationParsers = {
  address: defineLocationTemplate("$street, $city, $state, $postalCode, $country"),
  city: defineLocationTemplate("$city, $state, $country"),
} as const;
