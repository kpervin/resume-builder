import type { Route } from "next";
import { cookies } from "next/headers";

import { generatePreviewUrl } from "@/utils/fns";

export async function buildPdfFromPreview<T extends string>(previewUrl: Route<T>) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({
      extraHTTPHeaders: { cookie: (await cookies()).toString() },
    });

    const page = await context.newPage();

    const url = generatePreviewUrl(previewUrl);
    await page.goto(url, { waitUntil: "networkidle" });

    return await page.pdf({
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
  } catch (e) {
    console.error("Failed to build PDF", e);
    throw e;
  } finally {
    await browser.close();
  }
}

export function buildPdfResponseHeaders(url: URL, filename: string) {
  const disposition =
    url.searchParams.get("disposition") === "attachment" ? "attachment" : "inline";

  const contentDisposition =
    disposition === "inline" ? "inline" : `attachment; filename="${filename}"`;

  return {
    "Content-Type": "application/pdf",
    "Content-Disposition": contentDisposition,
    "Cache-Control": "no-store",
  };
}

export function isBodyInit(body: unknown): body is BodyInit {
  return (
    body instanceof Uint8Array ||
    body instanceof ArrayBuffer ||
    typeof body === "string" ||
    body instanceof Blob
  );
}
