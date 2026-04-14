export interface JobHandler {
  name: string;
  matches: (url: URL) => boolean;
  normalize: (url: URL) => string;
}

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
} as const satisfies JobHandler;

const GenericHandler = {
  name: "Generic",
  matches() {
    return true;
  },
  normalize(url) {
    return url.toString();
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
