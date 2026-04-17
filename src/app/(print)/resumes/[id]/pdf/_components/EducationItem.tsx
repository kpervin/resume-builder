import React, { FC } from "react";

import { formatMonthYear } from "@/app/(print)/resumes/[id]/pdf/helpers";
import { Resume } from "@/payload-types";
import { Get } from "@/utils/types";

import "../styles.css";

export type EducationItemProps = NonNullable<Get<Resume, "education[number]">>;

export const EducationItem: FC<EducationItemProps> = ({ startDate, endDate, school, degree }) => {
  const dates = [formatMonthYear(startDate), formatMonthYear(endDate)].filter(Boolean).join(" – ");

  return (
    <div className="grid-item">
      <div className="grid-left">
        <span className="font-bold">{dates}</span>
      </div>
      <div className="grid-right">
        <div className="item-title">{String(degree ?? "").trim()}</div>
        <div className="item-subtitle">{String(school ?? "").trim()}</div>
      </div>
    </div>
  );
};
