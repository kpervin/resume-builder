import { expect, test } from "vitest";

import { fetchJobMetadata } from "@/fields/JobPostingUrlField/fetch-job-metadata.server";

test(
  "should fetch job metadata from Indeed",
  {
    timeout: 100000,
  },
  async () => {
    const targetUrl = "https://ca.indeed.com/?advn=7489099380595880&vjk=044c7873cf329c97";
    await expect(fetchJobMetadata(targetUrl)).resolves.toMatchObject(
      expect.objectContaining({
        title: expect.any(String),
        company: expect.any(String),
        url: `https://ca.indeed.com/viewjob?jk=044c7873cf329c97`,
      }),
    );
  },
);
