"use client";

import { RenderFields } from "@payloadcms/ui";
import type { GroupFieldClientComponent } from "payload";
import React from "react";

const TransparentGroup: GroupFieldClientComponent = ({
  field,
  path,
  schemaPath,
  permissions,
  readOnly,
  indexPath,
}) => {
  return (
    <RenderFields
      fields={field.fields}
      parentPath={path}
      parentSchemaPath={schemaPath ?? ""}
      permissions={permissions ?? {}}
      readOnly={readOnly}
      parentIndexPath={indexPath ?? ""}
    />
  );
};

export default TransparentGroup;
