import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";

export const runtime = "nodejs";

function isBodyInit(body: unknown): body is BodyInit {
  return (
    body instanceof Uint8Array ||
    body instanceof ArrayBuffer ||
    typeof body === "string" ||
    body instanceof Blob
  );
}

export async function GET(
  request: Request,
  args: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await args.params;
  const headers = await getHeaders();

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Confirm access and gather filename data (and fail fast on required fields)
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

  const email = applicant?.email as string | undefined;
  if (!email) {
    return new Response("Applicant email is required to render the resume.", { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const previewUrl = `${origin}/admin/resumes/${encodeURIComponent(id)}/print`;

  // Lazy import so local dev without browsers installed fails clearly at runtime
  const { chromium } = await import("playwright");

  const cookie = headers.get("cookie") ?? "";

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      extraHTTPHeaders: cookie ? { cookie } : {},
    });
    const page = await context.newPage();

    await page.goto(previewUrl, { waitUntil: "networkidle" });

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: "18mm",
        bottom: "18mm",
        left: "18mm",
        right: "18mm",
      },
    });
    const url = new URL(request.url);
    const disposition = url.searchParams.get("disposition") === "inline" ? "inline" : "attachment";
    const downloadToken = url.searchParams.get("token");

    const fullName =
      applicant?.fullName ||
      `${applicant?.name?.firstName ?? ""} ${applicant?.name?.lastName ?? ""}`.trim() ||
      "Resume";
    const safeName = String(fullName)
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^A-Za-z0-9_.-]/g, "");
    const filename = `${safeName}_Resume.pdf`;

    if (!isBodyInit(pdf)) {
      return new Response("Internal Server Error: Invalid PDF body generated.", { status: 500 });
    }

    const response = new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
    if (downloadToken) {
      response.headers.set(
        "Set-Cookie",
        `pdf_downloaded_${downloadToken}=true; Path=/; Max-Age=60; SameSite=Lax`,
      );
    }
    return response;
  } finally {
    await browser.close();
  }
}
