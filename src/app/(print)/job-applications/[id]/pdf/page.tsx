import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Metadata } from "next";
import { headers as getHeaders } from "next/headers";
import { unauthorized } from "next/navigation";
import { getPayload } from "payload";

import { formatPhoneNumber } from "@/fields/PhoneField/utils";

type Props = PageProps<"/job-applications/[id]/pdf">;

async function getDataById(id: string) {
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

  return {
    applicant,
    application,
    date,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { application, applicant } = await getDataById(id);
  return {
    title: `${applicant.fullName} - ${application.company} Cover Letter`,
  };
}

export default async function JobApplicationPdfPage({ params }: Props) {
  const { id } = await params;

  const { applicant, application, date } = await getDataById(id);

  return (
    <article className="page">
      <div className="address-block mb-(--space-after-paragraph)">
        <div>{applicant.fullName}</div>
        <div>{applicant.location.street}</div>
        <div>
          {applicant.location.city}, {applicant.location.state} {applicant.location.postalCode}
        </div>
        <div>
          <a href={`tel:${applicant.phone ?? ""}`}>{formatPhoneNumber(applicant.phone ?? "")}</a>
        </div>
        <div>
          <a href={`mailto:${applicant.email ?? ""}`}>{applicant.email}</a>
        </div>
      </div>

      <p>{date}</p>

      <div className="address-block mb-(--space-after-paragraph)">
        <div>{application.company}</div>
        <div>{application.location.street}</div>
        <div>
          {application.location.city}, {application.location.state}&nbsp;
          {application.location.postalCode}
        </div>
      </div>
      <RichText data={application.coverLetter} />
    </article>
  );
}
