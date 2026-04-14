export interface JobMetadata {
  jobTitle: string;
  company: string;
}

export interface JobHandler {
  name: string;
  matches: (url: URL) => boolean;
  normalize: (url: URL) => string;
  parse: (html: string) => JobMetadata;
}

const getMetaTag = (html: string, property: string): string => {
  const regex = new RegExp(`<meta\\s+(?:property|name)="${property}"\\s+content="([^"]+)"`, "i");
  return html.match(regex)?.[1] || "";
};

const isAllowedHost = (hostname: string, domain: string): boolean => {
  return hostname === domain || hostname.endsWith(`.${domain}`);
};

const LinkedInHandler = {
  name: "LinkedIn",
  matches(url) {
    return isAllowedHost(url.hostname, "linkedin.com");
  },
  normalize(url) {
    const jobId = url.searchParams.get("currentJobId");
    return jobId ? `https://www.linkedin.com/jobs/view/${jobId}/` : url.toString();
  },
  parse(html) {
    const ogTitle = getMetaTag(html, "og:title");
    let [part1, part2] = ogTitle.includes(" hiring ")
      ? ogTitle.split(" hiring ")
      : ogTitle.split(" at ");
    const jobTitle = (part2 || part1 || "Unknown Position").replace(/\sin\s.+$/, "").trim();
    const company = (part2 ? part1 : part2 || "Unknown Company").trim().replace(/\|.*$/, "").trim();
    return { jobTitle, company };
  },
} as const satisfies JobHandler;

const IndeedHandler = {
  name: "Indeed",

  matches(url) {
    return isAllowedHost(url.hostname, "indeed.com");
  },

  normalize(url) {
    const jk = url.searchParams.get("jk") || url.searchParams.get("vjk");

    const hostname = url.hostname;

    if (jk) {
      return `https://${hostname}/viewjob?jk=${jk}`;
    }

    return url.toString();
  },

  parse(html) {
    try {
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

      if (jsonLdMatch && jsonLdMatch[1]) {
        const data = JSON.parse(jsonLdMatch[1]);
        return {
          jobTitle: data.title || "Unknown Position",
          company: data.hiringOrganization?.name || "Unknown Company",
        };
      }
    } catch (_) {
      console.error("JSON-LD parse failed, falling back to regex");
    }
    const ogTitle = getMetaTag(html, "og:title") || "";
    const parts = ogTitle.split(" - ");
    return {
      jobTitle: parts[0]?.trim() || "Unknown Position",
      company: parts[parts.length - 2]?.trim() || "Unknown Company",
    };
  },
} as const satisfies JobHandler;

const GenericHandler = {
  name: "Generic",
  matches() {
    return true;
  },
  normalize(url) {
    return url.toString();
  },
  parse(html) {
    return {
      jobTitle: getMetaTag(html, "og:title") || "Unknown Position",
      company: getMetaTag(html, "og:description")?.split(" hiring")[0]?.trim() || "Unknown Company",
    };
  },
} as const satisfies JobHandler;

const HANDLERS = [LinkedInHandler, IndeedHandler];

export function getHandler(urlStr: string) {
  try {
    const url = new URL(urlStr);
    const handler = HANDLERS.find((h) => h.matches(url)) || GenericHandler;
    return { handler, url };
  } catch (_) {
    return { handler: GenericHandler, url: new URL(urlStr) };
  }
}
