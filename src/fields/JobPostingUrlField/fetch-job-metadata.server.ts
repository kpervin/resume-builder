"use server";

import { getHandler, JobMetadata } from "./job-handlers.server";

export async function fetchJobMetadata(
  urlInput: string,
): Promise<(JobMetadata & { targetUrl: string }) | null> {
  if (!urlInput) return null;

  try {
    new URL(urlInput);
    const { handler, url } = getHandler(urlInput);
    const targetUrl = handler.normalize(url);

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        Cookie: "CTK=1; INDEED_CSRF_TOKEN=1; PV=1;",
      },
      redirect: "follow",
    });

    const html = await response.text();
    if (!response.ok) return null;

    return { ...handler.parse(html), targetUrl: handler.normalize(url) };
  } catch (error) {
    console.error("Scraping error:", error);
    return null;
  }
}
