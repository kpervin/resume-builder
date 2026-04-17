import React, { FC } from "react";

import { Reference } from "@/payload-types";

import "../styles.css";

export type ReferenceItemProps = Pick<Reference, "company" | "name" | "contactMethods">;

export const ReferenceItem: FC<ReferenceItemProps> = ({ company, name, contactMethods }) => {
  const emailMethod = (contactMethods ?? []).find((m) => m?.type === "email" && m?.email);
  return (
    <div className="grid-item mb-3!">
      <div className="grid-left">
        <span>{emailMethod?.email}</span>
      </div>
      <div className="grid-right">
        <div className="item-title">{String(name ?? "").trim()}</div>
        <div className="item-subtitle mb-0!">{String(company ?? "").trim()}</div>
      </div>
    </div>
  );
};
