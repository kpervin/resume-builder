import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";

import { buildPdfFromPreview, buildPdfResponseHeaders, isBodyInit } from "@/utils/pdf/buildPdf";

export const runtime = "nodejs";

export async function GET(request: Request, ctx: RouteContext<"/resumes/[id]">): Promise<Response> {
  const { id } = await ctx.params;
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
          draft: true,
          user,
          overrideAccess: false,
        })
      : resume.applicant;

  const email = applicant?.email;

  if (!email) {
    return new Response("Applicant email is required to render the resume.", { status: 400 });
  }

  const pdf = await buildPdfFromPreview(`/resumes/${encodeURIComponent(id)}/pdf`);

  const fullName =
    applicant?.fullName ||
    `${applicant?.firstName ?? ""} ${applicant?.lastName ?? ""}`.trim() ||
    "Resume";

  const safeName = String(fullName)
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_.-]/g, "");

  const filename = `${safeName}_Resume.pdf`;

  if (!isBodyInit(pdf)) {
    return new Response("Internal Server Error: Invalid PDF body generated.", { status: 500 });
  }

  return new Response(pdf, {
    status: 200,
    headers: buildPdfResponseHeaders(new URL(request.url), filename),
  });
}
