import { faker } from "@faker-js/faker";
import config from "@payload-config";
import { DataFromCollectionSlug, getPayload, Payload } from "payload";
import * as v from "valibot";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import type { Location } from "@/payload-types";
import { fetchJobMetadata } from "@/server-functions/job-metadata/fetch-job-metadata.server";
import { ResponseSchema } from "@/server-functions/job-metadata/response.schema";

const { mockGeminiResponse } = vi.hoisted(() => ({
  mockGeminiResponse: {
    text: JSON.stringify({
      title: "Senior Developer",
      company: "Tech Corp",
      description: "A professional job summary...",
      coverLetter: "## Cover Letter\nDear Hiring Manager...",
      location: {
        fullAddress: "123 Tech Lane, SF",
        street: "123 Tech Lane",
        city: "San Francisco",
        province: "CA",
        postalCode: "94105",
        country: "US",
      },
    } satisfies v.InferOutput<typeof ResponseSchema>),
  },
}));
vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: vi.fn(
      class {
        models = {
          generateContent: vi.fn().mockResolvedValue(mockGeminiResponse),
        };
      },
    ),
    ApiError: class extends Error {
      status: number;

      constructor(message: string, status: number) {
        super(message);
        this.status = status;
      }
    },
  };
});

vi.stubGlobal("fetch", vi.fn());

let payload: Payload;

describe("JobPostingUrlField fetchJobMetadata", async () => {
  let applicant: DataFromCollectionSlug<"applicants">;
  let resume: DataFromCollectionSlug<"resumes">;

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
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        },
        phone: faker.phone.number(),
        location: address,
        email: faker.internet.email(),
      },
    });
    resume = await payload.create({
      collection: "resumes",
      draft: true,
      data: {
        applicant: applicant.id,
        description: "Senior Full Stack Developer specializing in React and Node.js.",
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

        experience: [
          {
            company: "Tech Solutions Inc",
            jobTitle: "Senior Software Engineer",
            startDate: new Date("2021-01-01").toISOString(),
            current: true,
            location: address,
            description: {
              root: {
                type: "root",
                children: [
                  {
                    type: "paragraph",
                    children: [{ text: faker.lorem.paragraph() }],
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
    vi.unstubAllGlobals();
    await payload.delete({
      collection: "resumes",
      id: resume.id,
    });
    await payload.delete({
      collection: "applicants",
      id: applicant.id,
    });
  });

  test("should fetch job metadata from Indeed", async () => {
    const targetUrl = "https://ca.indeed.com/?advn=7489099380595880&vjk=044c7873cf329c97";

    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          solution: {
            response:
              "<html lang='en'><body><main><h1>Software Engineer</h1><p>Tech Corp</p></main></body></html>",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await fetchJobMetadata(targetUrl, resume.id);

    expect(result).toMatchObject({
      title: "Senior Developer",
      company: "Tech Corp",
      url: `https://ca.indeed.com/viewjob?jk=044c7873cf329c97`,
    });

    expect(fetch).toHaveBeenCalled();
  });
});
