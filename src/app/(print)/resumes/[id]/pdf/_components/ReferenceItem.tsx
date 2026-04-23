import React, { FC } from "react";

import { formatPhoneNumber } from "@/fields/PhoneField/utils";
import { Reference } from "@/payload-types";

import "../styles.css";

export type ReferenceItemProps = Pick<Reference, "company" | "name" | "contactMethods">;

export const ReferenceItem: FC<ReferenceItemProps> = ({ company, name, contactMethods }) => {
  return (
    <div className="grid-item mb-3!">
      <div className="grid-left">
        <div className="item-title">{String(name ?? "").trim()}</div>
      </div>
      <div className="grid-right">
        <div className="item-subtitle">{String(company ?? "").trim()}</div>
        <div className={"w-fit"}>
          {(contactMethods ?? []).map((m) => (
            <>
              {m?.type === "email" && <a href={`mailto:${m?.email}`}>{m?.email}</a>}
              {m?.type === "phone" && (
                <a href={`tel:${m?.phone}`}>{formatPhoneNumber(m?.phone ?? "")}</a>
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};
