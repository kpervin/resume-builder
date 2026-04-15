import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { headers as getHeaders } from "next/headers";
import { unauthorized } from "next/navigation";
import { getPayload } from "payload";

export default async function JobApplicationPdfPage({
  params,
}: PageProps<"/job-applications/[id]/pdf">) {
  const { id } = await params;

  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (!user) {
    return unauthorized();
  }

  const application = await payload.findByID({
    collection: "job-applications",
    id,
    depth: 2,
    draft: true,
    user,
    overrideAccess: false,
  });

  const applicant =
    typeof application.applicant === "number"
      ? await payload.findByID({
          collection: "applicants",
          id: application.applicant,
          depth: 1,
          user,
          overrideAccess: false,
        })
      : application.applicant;

  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
    new Date(application.updatedAt),
  );

  return (
    <article className="page">
      <div className="address-block mb-[var(--space-after-paragraph)]">
        <div>{applicant.fullName}</div>
        <div>{applicant.location.street}</div>
        <div>
          {applicant.location.city}, {applicant.location.state} {applicant.location.postalCode}
        </div>
        <div>{applicant.phone}</div>
        <div>{applicant.email}</div>
      </div>

      <p>{date}</p>

      <div className="address-block mb-[var(--space-after-paragraph)]">
        <div>{application.company}</div>
        <div>{application.location.street}</div>
        <div>
          {application.location.city}, {application.location.state}&nbsp;
          {application.location.postalCode}
        </div>
      </div>

      {/*
          Payload RichText will now automatically add 12pt
          between every paragraph it renders.
      */}
      <RichText data={application.coverLetter} />
    </article>
  );
}
