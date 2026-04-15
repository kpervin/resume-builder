import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";

import { buildPdfFromPreview, buildPdfResponseHeaders, isBodyInit } from "@/utils/pdf/buildPdf";

export const runtime = "nodejs";

export async function GET(request: Request, ctx: RouteContext<"/job-applications/[id]">) {
  const { id } = await ctx.params;
  const headers = await getHeaders();

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const application = await payload.findByID({
    collection: "job-applications",
    id,
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
          draft: true,
          user,
          overrideAccess: false,
        })
      : application.applicant;

  const pdf = await buildPdfFromPreview(`/job-applications/${encodeURIComponent(id)}/pdf`);

  if (!isBodyInit(pdf)) {
    return new Response("Internal Server Error: Invalid PDF body generated.", { status: 500 });
  }
  const filename = `${applicant.fullName} - ${application.company} Cover Letter.pdf`;

  return new Response(pdf, {
    status: 200,
    headers: buildPdfResponseHeaders(new URL(request.url), filename),
  });
}
