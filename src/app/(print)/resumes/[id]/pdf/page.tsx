import config from "@payload-config";
import { Metadata } from "next";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import React from "react";

import { ResumePrintView } from "./ResumePrintView";

export const runtime = "nodejs";

type Props = PageProps<"/resumes/[id]/pdf">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });
  const resume = await payload.findByID({
    collection: "resumes",
    id,
    depth: 2,
    draft: true,
    user,
    overrideAccess: false,
  });
  return {
    title: resume.title,
    description: resume.description,
  };
}

export default async function ResumePrintPage({ params }: Props) {
  const { id } = await params;

  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
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

  return <ResumePrintView resume={resume} applicant={applicant} references={references} />;
}
