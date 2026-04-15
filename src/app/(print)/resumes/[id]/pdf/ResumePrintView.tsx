import { RichText } from "@payloadcms/richtext-lexical/react";
import React from "react";

import type { Applicant, Reference, Resume } from "@/payload-types";

import { bestEffortNanpPhone, formatHeaderAddress, formatMonthYear } from "./helpers";

function SummaryText({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trimEnd());
  return (
    <div className="text-block">
      {lines.map((line, idx) => (
        <React.Fragment key={idx}>
          {line}
          {idx < lines.length - 1 ? <br /> : null}
        </React.Fragment>
      ))}
    </div>
  );
}

type ResumePrintViewProps = {
  resume: Resume;
  applicant: Applicant;
  references: Reference[];
};

export function ResumePrintView({ resume, applicant, references }: ResumePrintViewProps) {
  const fullName =
    applicant.fullName ||
    `${applicant.name?.firstName ?? ""} ${applicant.name?.lastName ?? ""}`.trim() ||
    "Resume";

  const address = formatHeaderAddress(applicant);
  const phone = bestEffortNanpPhone(applicant.phone);
  const email = applicant.email;
  const socialLinks = (applicant.socialLinks ?? []).filter((s) => s?.label && s?.url);

  return (
    <div className="page">
      {/* --- HEADER --- */}
      <h1 className="header-name">{fullName}</h1>

      <div className="header-info-list">
        {address && (
          <p className="header-info-line">
            <span className="label-strong">Address:</span> {address}
          </p>
        )}
        {phone && (
          <p className="header-info-line">
            <span className="label-strong">Phone:</span> {phone}
          </p>
        )}
        {email && (
          <p className="header-info-line">
            <span className="label-strong">Email:</span> {email}
          </p>
        )}
        {socialLinks.map((s, i) => (
          <p key={i} className="header-info-line">
            <span className="label-strong">{s.label}:</span> {s.url}
          </p>
        ))}
      </div>

      {/* --- SUMMARY --- */}
      <section>
        <h2 className="section-heading">Summary</h2>
        <SummaryText text={String(resume.description ?? "").trim()} />
      </section>

      {/* --- SKILLS (Categorized) --- */}
      {(resume.skillSections ?? []).filter(Boolean).map((s, idx) => {
        const category = String(s?.category ?? "").trim();
        const items = (s?.skills ?? []).map((x) => String(x ?? "").trim()).filter(Boolean);
        if (!category || items.length === 0) return null;

        return (
          <section key={idx}>
            <h2 className="section-heading">{category}</h2>
            <div className="badge-container">
              {items.map((skill, sIdx) => (
                <span key={sIdx} className="badge">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        );
      })}

      {/* --- WORK EXPERIENCE --- */}
      <section>
        <h2 className="section-heading">Work experience</h2>
        {(resume.experience ?? []).filter(Boolean).map((e, idx) => {
          const start = formatMonthYear(e.startDate);
          const end = e.current ? "Present" : formatMonthYear(e.endDate);
          const range = [start, end].filter(Boolean).join(" – ");
          const locParts = [e.location?.city, e.location?.state, e.location?.country]
            .filter(Boolean)
            .join(", ");

          return (
            <div className="grid-item" key={idx}>
              <div className="grid-left">
                <span className="font-bold">{range}</span>
                <span>{locParts}</span>
              </div>
              <div className="grid-right">
                <div className="item-title">{String(e.jobTitle ?? "").trim()}</div>
                <div className="item-subtitle">{String(e.company ?? "").trim()}</div>
                <div className="item-description">
                  <RichText data={e.description} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* --- EDUCATION --- */}
      <section>
        <h2 className="section-heading">Education</h2>
        {(resume.education ?? []).filter(Boolean).map((ed, idx) => {
          const dates = [formatMonthYear(ed.startDate), formatMonthYear(ed.endDate)]
            .filter(Boolean)
            .join(" – ");

          return (
            <div className="grid-item" key={idx}>
              <div className="grid-left">
                <span className="font-bold">{dates}</span>
              </div>
              <div className="grid-right">
                <div className="item-title">{String(ed.degree ?? "").trim()}</div>
                <div className="item-subtitle">{String(ed.school ?? "").trim()}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* --- REFERENCES --- */}
      <section>
        <h2 className="section-heading">References</h2>
        {references.map((r, idx) => {
          const emailMethod = (r?.contactMethods ?? []).find(
            (m) => m?.type === "email" && m?.email,
          );
          return (
            <div className="grid-item mb-3!" key={idx}>
              <div className="grid-left">
                <span>{emailMethod?.email}</span>
              </div>
              <div>Hello</div>
              <div className="grid-right">
                <div className="item-title">{String(r?.name ?? "").trim()}</div>
                <div className="item-subtitle mb-0!">{String(r?.company ?? "").trim()}</div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
