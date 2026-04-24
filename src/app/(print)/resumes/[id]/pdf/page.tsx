import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { unauthorized } from "next/navigation";
import { getPayload } from "payload";
import React from "react";

import { EducationItem } from "@/app/(print)/resumes/[id]/pdf/_components/EducationItem";
import { HeaderInfoItem } from "@/app/(print)/resumes/[id]/pdf/_components/HeaderInfoItem";
import { ReferenceItem } from "@/app/(print)/resumes/[id]/pdf/_components/ReferenceItem";
import { SkillSection } from "@/app/(print)/resumes/[id]/pdf/_components/Skill";
import { WorkExperienceItem } from "@/app/(print)/resumes/[id]/pdf/_components/WorkExperienceItem";
import { bestEffortNanpPhone, formatHeaderAddress } from "@/app/(print)/resumes/[id]/pdf/helpers";

import "./styles.css";

export const runtime = "nodejs";

type Props = PageProps<"/resumes/[id]/pdf">;

export default async function ResumePrintPage({ params }: Props) {
  const { id } = await params;

  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (!user) {
    return unauthorized();
  }

  const resume = await payload.findByID({
    collection: "resumes",
    id,
    depth: 2,
    draft: true,
    user,
    overrideAccess: false,
  });

  const applicant =
    typeof resume.applicant === "number"
      ? await payload.findByID({
          collection: "applicants",
          id: resume.applicant,
          depth: 1,
          user,
          overrideAccess: false,
        })
      : resume.applicant;

  const refsInput = Array.isArray(resume.references) ? resume.references : [];
  const references = (
    await Promise.all(
      refsInput.map(async (r) => {
        if (typeof r === "number") {
          return await payload.findByID({
            collection: "references",
            id: r,
            depth: 2,
            user,
            overrideAccess: false,
          });
        }
        return r;
      }),
    )
  ).filter(Boolean);

  const fullName =
    applicant.fullName ||
    `${applicant.firstName ?? ""} ${applicant.lastName ?? ""}`.trim() ||
    "Resume";

  const address = formatHeaderAddress(applicant);
  const phone = bestEffortNanpPhone(applicant.phone);
  const email = applicant.email;
  const socialLinks = (applicant.socialLinks ?? []).filter((s) => s?.label && s?.url);

  return (
    <div className="page">
      <h1 className="header-name">{fullName}</h1>
      <div className="header-info-list">
        <HeaderInfoItem label="Address" value={address} />
        <HeaderInfoItem label="Phone" value={phone} />
        <HeaderInfoItem label="Email" value={email} />
        {socialLinks.map((s, i) => {
          const url = new URL(s.url);
          return (
            <HeaderInfoItem
              key={i}
              label={s.label}
              value={
                <a className={"text-nowrap"} href={s.url} target="_blank" rel="noopener noreferrer">
                  {url.hostname}
                  {url.pathname}
                </a>
              }
            />
          );
        })}
      </div>
      <section>
        <h2 className="section-heading">Summary</h2>
        <p className="text-block">{String(resume.description ?? "").trim()}</p>
      </section>
      {(resume.skillSections ?? []).filter(Boolean).map((s, idx) => (
        <SkillSection key={idx} {...s} />
      ))}
      <section id={"work-experience"}>
        <h2 className="section-heading">Work experience</h2>
        {(resume.experience ?? []).filter(Boolean).map((e, idx) => (
          <WorkExperienceItem key={idx} {...e} />
        ))}
      </section>
      <section id={"education"}>
        <h2 className="section-heading">Education</h2>
        {(resume.education ?? []).filter(Boolean).map((ed, idx) => (
          <EducationItem key={idx} {...ed} />
        ))}
      </section>
      <section id={"references"}>
        <h2 className="section-heading">References</h2>
        {references.map((r, idx) => (
          <ReferenceItem key={idx} {...r} />
        ))}
      </section>
    </div>
  );
}
