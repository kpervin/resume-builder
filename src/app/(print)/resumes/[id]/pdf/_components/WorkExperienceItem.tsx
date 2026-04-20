import { RichText } from "@payloadcms/richtext-lexical/react";
import React, { FC } from "react";

import { SkillSection } from "@/app/(print)/resumes/[id]/pdf/_components/Skill";
import { formatMonthYear } from "@/app/(print)/resumes/[id]/pdf/helpers";
import { Resume } from "@/payload-types";
import { Get } from "@/utils/types";

import "../styles.css";

export type WorkExperienceItemProps = NonNullable<Get<Resume, "experience[number]">>;

export const WorkExperienceItem: FC<WorkExperienceItemProps> = ({
  startDate,
  endDate,
  location,
  jobTitle,
  company,
  description,
  current,
  skills,
}) => {
  const start = formatMonthYear(startDate);
  const end = current ? "Present" : formatMonthYear(endDate);
  const range = [start, end].filter(Boolean).join(" – ");
  const locParts = [location?.city, location?.state, location?.country].filter(Boolean).join(", ");

  return (
    <div className="grid-item">
      <div className="grid-left">
        <span className="font-bold">{range}</span>
        <span>{locParts}</span>
      </div>
      <div className="grid-right">
        <div className="item-title">{String(jobTitle ?? "").trim()}</div>
        <div className="item-subtitle">{String(company ?? "").trim()}</div>
        <div className="item-description">
          <RichText data={description} />
        </div>
        <div className={"mt-1"}>
          <SkillSection skills={skills} />
        </div>
      </div>
    </div>
  );
};
