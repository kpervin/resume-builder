import { RichText } from "@payloadcms/richtext-lexical/react";
import React from "react";

import type { Applicant, Reference, Resume } from "@/payload-types";

import { bestEffortNanpPhone, formatHeaderAddress, formatMonthYear } from "./helpers";

function Summary({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trimEnd());
  return (
    <p className="summary">
      {lines.map((line, idx) => (
        <React.Fragment key={idx}>
          {line}
          {idx < lines.length - 1 ? <br /> : null}
        </React.Fragment>
      ))}
    </p>
  );
}

export function ResumePrintView({
  resume,
  applicant,
  references,
}: {
  resume: Resume;
  applicant: Applicant;
  references: Reference[];
}) {
  const fullName =
    applicant.fullName ||
    `${applicant.name?.firstName ?? ""} ${applicant.name?.lastName ?? ""}`.trim() ||
    "Resume";

  const address = formatHeaderAddress(applicant);
  const phone = bestEffortNanpPhone(applicant.phone);
  const email = applicant.email;
  const socialLinks = applicant.socialLinks ?? [];

  return (
    <div className="page">
      <h1 className="name">{fullName}</h1>

      <div className="contact">
        {address ? <p className="contactLine">Address: {address}</p> : null}
        {phone ? <p className="contactLine">Phone: {phone}</p> : null}
        {email ? <p className="contactLine">Email: {email}</p> : null}
        {socialLinks.length ? (
          <p className="contactLine">
            {socialLinks
              .filter((s) => s?.label && s?.url)
              .map((s) => `${s.label}: ${s.url}`)
              .join(" • ")}
          </p>
        ) : null}
      </div>

      <section>
        <div className="sectionTitle">Summary</div>
        <Summary text={String(resume.description ?? "").trim()} />
      </section>

      <section>
        <div className="sectionTitle">Skills</div>
        <div className="skills">
          {(resume.skillSections ?? []).filter(Boolean).map((s, idx) => {
            const category = String(s?.category ?? "").trim();
            const items = (s?.skills ?? []).map((x) => String(x ?? "").trim()).filter(Boolean);
            if (!category || items.length === 0) return null;
            return (
              <div className="skillRow" key={idx}>
                <span className="skillCategory">{category}</span>
                <span className="skillItems">{items.join(" ")}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="sectionTitle">Work experience</div>
        <div className="experience">
          {(resume.experience ?? []).filter(Boolean).map((e, idx) => {
            const start = formatMonthYear(e.startDate);
            const end = e.current ? "Present" : formatMonthYear(e.endDate);
            const range = [start, end].filter(Boolean).join(" – ");

            const loc = e.location;
            const locParts = [loc?.city, loc?.state, loc?.country].filter(Boolean).join(", ");

            return (
              <div className="experienceItem" key={idx}>
                <div className="experienceMeta">
                  <div className="experienceDates">{range}</div>
                  <div className="experienceLocation">{locParts}</div>
                </div>
                <div className="experienceTitle">{String(e.jobTitle ?? "").trim()}</div>
                <div className="experienceCompany">{String(e.company ?? "").trim()}</div>
                <RichText data={e.description} />
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="sectionTitle">Education</div>
        <div className="education">
          {(resume.education ?? []).filter(Boolean).map((ed, idx) => {
            const school = String(ed.school ?? "").trim();
            const degree = String(ed.degree ?? "").trim();
            const start = formatMonthYear(ed.startDate);
            const end = formatMonthYear(ed.endDate);
            const dates = [start, end].filter(Boolean).join(" – ");

            return (
              <div className="educationItem" key={idx}>
                <div className="educationRow">
                  <div className="educationSchool">{school}</div>
                  <div className="educationDates">{dates}</div>
                </div>
                {degree ? <div className="educationDegree">{degree}</div> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="sectionTitle">References</div>
        <div className="refs">
          {references.map((r, idx) => {
            const methods = r?.contactMethods ?? [];
            const emailMethod = methods.find((m) => m?.type === "email" && m?.email);
            return (
              <div className="refItem" key={idx}>
                <div className="refName">{String(r?.name ?? "").trim()}</div>
                {r?.company ? <div className="refCompany">{String(r.company).trim()}</div> : null}
                {emailMethod?.email ? (
                  <div className="refContact">{String(emailMethod.email).trim()}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
