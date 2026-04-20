import React, { FC, PropsWithChildren } from "react";

import { Resume } from "@/payload-types";
import { Get } from "@/utils/types";

export type SkillSectionProps = {
  skills: Get<Resume, "skillSections[number].skills">;
  category?: string;
};

export const SkillSection: FC<SkillSectionProps> = ({ skills, category }) => {
  const items = (skills ?? []).map((x) => String(x ?? "").trim()).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <>
      {category && <h2 className="section-heading">{category}</h2>}
      <div className="badge-container">
        {(items || []).map((skill) => (
          <SkillItem key={`skill-${category}-${skill}`}>{skill}</SkillItem>
        ))}
      </div>
    </>
  );
};

export const SkillItem: FC<PropsWithChildren> = ({ children }) => (
  <span className="badge">{children}</span>
);
