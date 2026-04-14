import config from "@payload-config";
import { getPayload } from "payload";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import type { Location } from "@/payload-types";
import { fetchJobMetadata } from "@/server-functions/job-metadata/fetch-job-metadata.server";

describe("JobPostingUrlField fetchJobMetadata", async () => {
  let payload: Awaited<ReturnType<typeof getPayload>>;
  let applicant: Awaited<ReturnType<Awaited<ReturnType<typeof getPayload>>["create"]>>;
  let resume: Awaited<ReturnType<Awaited<ReturnType<typeof getPayload>>["create"]>>;

  beforeAll(async () => {
    payload = await getPayload({ config });

    const address = {
      fullAddress: "123 Tech Lane, San Francisco, CA 94105, USA",
      street: "123 Tech Lane",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "USA",
    } satisfies Location;

    applicant = await payload.create({
      draft: true,
      collection: "applicants",
      data: {
        name: {
          firstName: "John",
          lastName: "Doe",
        },
        fullName: "John Doe",
        phone: "555-0100",
        location: address,
      },
    });
    resume = await payload.create({
      collection: "resumes",
      draft: true,
      data: {
        applicant: applicant.id,
        description: "Senior Full Stack Developer specializing in React and Node.js.",
        _status: "published",

        // This maps to the resumes_skill_sections table
        skillSections: [
          {
            category: "Frontend",
            skills: ["React"],
          },
          {
            category: "Backend",
            skills: ["NodeJS"],
          },
        ],

        // This maps to the resumes_experience table
        experience: [
          {
            company: "Tech Solutions Inc",
            jobTitle: "Senior Software Engineer",
            startDate: new Date("2021-01-01").toISOString(),
            current: true,
            location: address,
            // Payload RichText usually expects a Lexical or Slate JSON structure
            description: {
              root: {
                type: "root",
                children: [
                  {
                    type: "paragraph",
                    children: [{ text: "Led a team of 5 developers to build a Next.js platform." }],
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                version: 1,
              },
            },
          },
        ],
      },
    });
  });

  afterAll(async () => {
    await payload.delete({
      collection: "resumes",
      id: resume.id,
    });
    await payload.delete({
      collection: "applicants",
      id: applicant.id,
    });
    await payload.db.destroy?.();
  });

  test(
    "should fetch job metadata from Indeed",
    {
      timeout: 100000,
    },
    async () => {
      const targetUrl = "https://ca.indeed.com/?advn=7489099380595880&vjk=044c7873cf329c97";
      await expect(fetchJobMetadata(targetUrl, resume.id)).resolves.toMatchObject(
        expect.objectContaining({
          title: expect.any(String),
          company: expect.any(String),
          url: `https://ca.indeed.com/viewjob?jk=044c7873cf329c97`,
        }),
      );
    },
  );
});
