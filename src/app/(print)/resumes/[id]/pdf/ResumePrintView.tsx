import { RichText } from "@payloadcms/richtext-lexical/react";
import React, { FC, ReactNode } from "react";

import type { Applicant, Reference, Resume } from "@/payload-types";

import { bestEffortNanpPhone, formatHeaderAddress, formatMonthYear } from "./helpers";

type ResumePrintViewProps = {
  resume: Resume;
  applicant: Applicant;
  references: Reference[];
};

const HeaderInfoLine: FC<{ label: string; value: ReactNode | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <p className="header-info-line">
      <span className="label-strong">{label}:</span> {value}
    </p>
  );
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
      <h1 className="header-name">{fullName}</h1>
      <div className="header-info-list">
        <HeaderInfoLine label="Address" value={address} />
        <HeaderInfoLine label="Phone" value={phone} />
        <HeaderInfoLine label="Email" value={email} />
        {socialLinks.map((s, i) => {
          const url = new URL(s.url);
          return (
            <HeaderInfoLine
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

      {(resume.skillSections ?? []).filter(Boolean).map((s, idx) => {
        const category = String(s?.category ?? "").trim();
        const items = (s?.skills ?? []).map((x) => String(x ?? "").trim()).filter(Boolean);
        if (!category || items.length === 0) return null;

        return (
          <section id={`skills-${category}`} key={idx}>
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
      <section id={"work-experience"}>
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
      <section id={"education"}>
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
      <section id={"references"}>
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
