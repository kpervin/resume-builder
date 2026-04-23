"use server";

import { ApiError, GoogleGenAI } from "@google/genai";
import config from "@payload-config";
import {
  $convertFromMarkdownString,
  editorConfigFactory,
  getEnabledNodes,
} from "@payloadcms/richtext-lexical";
import { createHeadlessEditor } from "@payloadcms/richtext-lexical/lexical/headless";
import * as cheerio from "cheerio";
import { getPayload } from "payload";
import TurndownService from "turndown";
import { Result } from "typescript-result";
import * as v from "valibot";

import { env } from "@/env";
import { JsonSchema, ResponseSchema } from "@/server-functions/job-metadata/response.schema";
import { IOError, NotFoundError, ParseError } from "@/utils/errors";
import { sleep } from "@/utils/fns";
import { withServerResult } from "@/utils/server-result";

import { getHandler } from "./job-handlers.server";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const COVER_LETTER_TEMPLATE = /*markdown*/ `
    Dear {{recipient_honorific_and_last_name}}:

    [//]: # ( Here fill in the body of the cover letter )

    Sincerely,

    {{sender_name}}
  `;

const AI_SYSTEM_INSTRUCTION = /*markdown*/ `
    You are an expert Data Analyst.
    I have provided a markdown version of a job posting.
    It contains a "OFFICIAL METADATA" section and a "JOB DESCRIPTION CONTENT" section.

    You have also been provided with a resume in JSON format as well as an applicant in JSON format.

    INSTRUCTIONS:
    - Use the "OFFICIAL METADATA" section as the primary source for the 'company', 'title', and 'location' fields.
    - Use the "JOB DESCRIPTION CONTENT" to summarize the role and generate the cover letter.
    - Extract the job title, company name, location, and a summary of the job description from the markdown content.
    - Create a cover letter based on the resume provided and the description of the job. Go for high ATS score.
    - Ensure the cover letter is professional and tailored to the job description.
    - Ensure the cover letter is formatted in markdown with paragraphs and proper spacing.
    - For 'title', remove internal reference codes (e.g., "#12345").
    - For 'description', summarize the requirements and responsibilities into a professional paragraph. Do not just copy/paste the whole page.
    - If the page requires a login, displays a "404", or is blocked, return a JSON that signals an error instead of guessing data.
    - Do not include any conversational filler. Return pure JSON.
    - When fetching the location, search for the company using Google Places API while cross-referencing with the listing to accurately gain their address.
      - If you cannot find the address via the Google Places API (while ensuring that the address is accurate and matches the company), return the city/province/country instead.
      - If multiple addresses are present, match the location closest to the provided applicant's listed address.
    - DO NOT UNDER ANY CIRCUMSTANCES include any sort of description of skills that are not directly provided via the included resume.
    - Please keep the cover letter addressee generic (i.e. Hiring Team, "To Whom it may concern", etc.) in accordance to professional standards.
    - Try not to mention education unless absolutely necessary and relevant to ATS score.
    - Add some human element to make it less dry.
    - Try not to use em-dashes.

    Follow this template as a guideline:
    \`\`\`markdown
    ${COVER_LETTER_TEMPLATE}
    \`\`\`
  `;

function convertToTokenEfficientMarkdown(rawHtml: string) {
  const $ = cheerio.load(rawHtml);

  let structuredData = "";

  const jsonLdScript = $('script[type="application/ld+json"]').html();
  if (jsonLdScript) {
    const parsed = JSON.parse(jsonLdScript);
    structuredData += `
      OFFICIAL METADATA (JSON-LD):
      Title: ${parsed.title}
      Company: ${parsed.hiringOrganization?.name}
      Location: ${parsed.jobLocation?.address?.addressLocality}, ${parsed.jobLocation?.address?.addressCountry}
      Date Posted: ${parsed.datePosted}
    `;
  }

  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDescription = $('meta[property="og:description"]').attr("content");

  if (ogTitle && !structuredData.includes(ogTitle)) structuredData += `META TITLE: ${ogTitle}\n`;
  if (ogDescription && !structuredData.includes(ogDescription))
    structuredData += `META DESCRIPTION: ${ogDescription}\n`;

  $("script, style, noscript, svg, path, img, iframe, meta, link").remove();
  $('header, footer, nav, aside, [role="dialog"]').remove();
  $(".visually-hidden").remove();

  const mainHtml = $("main").html() ?? $("[role='main']").html() ?? $("body").html();

  if (!structuredData) return Result.error(new ParseError("Unexpected empty structured data."));
  if (!mainHtml) return Result.ok(structuredData);

  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
  });

  const bodyMarkdown = turndownService.turndown(mainHtml);

  return Result.ok(
    `
    ---
    ${structuredData}
    ---
    JOB DESCRIPTION CONTENT:
    ${bodyMarkdown}
  `.trim(),
  );
}

async function callGeminiWithRetry(
  contents: string,
  systemInstruction: string,
  retries = 0,
  delay = 1000,
) {
  const MAX_RETRIES = 3;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json",
        responseJsonSchema: JsonSchema,
        systemInstruction,
      },
    });

    if (!res.text) return Result.error(new IOError("No text returned from Gemini."));

    const { output, issues } = v.safeParse(ResponseSchema, JSON.parse(res.text));

    if (issues) {
      return Result.error(
        new ParseError("Failed to parse Gemini response", {
          cause: JSON.stringify(v.flatten(issues), null, 2),
        }),
      );
    }

    const lowerTitle = String(output.title).toLowerCase();
    if (
      lowerTitle.includes("login") ||
      lowerTitle.includes("sign in") ||
      lowerTitle.includes("404")
    ) {
      return Result.error(
        new ParseError("Scraping failed: target site blocked access or returned an error."),
      );
    }

    return Result.ok(output);
  } catch (error) {
    if (error instanceof ApiError && error.status === 429 && retries < MAX_RETRIES) {
      await sleep(delay);
      return callGeminiWithRetry(contents, systemInstruction, retries + 1, delay * 2);
    }
    return Result.error(new IOError("Gemini API error", { cause: error }));
  }
}

async function* runFetchJobMetadata(urlInput: string, resumeId: number) {
  yield* Result.try(
    () => new URL(urlInput),
    () => new ParseError(`Invalid URL: ${urlInput}`),
  );

  const { handler, url } = getHandler(urlInput);
  const targetUrl = handler.normalize(url);

  const html = yield* await Result.try(
    async (): Promise<string> => {
      const res = await fetch(`${env.FLARESOLVERR_URL}/v1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd: "request.get", url: targetUrl, maxTimeout: 60000 }),
      });
      if (!res.ok) throw new NotFoundError(`FlareSolverr request failed: ${res.statusText}`);
      const json = await res.json();
      if (!json.solution?.response) throw new ParseError("Empty HTML response");
      return json.solution.response;
    },
    (error) => {
      if (error instanceof NotFoundError) return error;
      if (error instanceof ParseError) return error;
      return new IOError("Unexpected fetch error", { cause: error });
    },
  );

  const markdown = yield* convertToTokenEfficientMarkdown(html);

  const { resume, applicant } = yield* await Result.try(
    async () => {
      const payload = await getPayload({ config });
      const resume = await payload.findByID({ collection: "resumes", id: resumeId });
      const applicant =
        typeof resume.applicant === "number"
          ? await payload.findByID({ collection: "applicants", id: resume.applicant })
          : resume.applicant;
      return { resume, applicant };
    },
    (error) => new IOError("Failed to load resume/applicant from Payload", { cause: error }),
  );

  console.log("Sending HTML to Gemini for parsing...");
  const geminiResponse = yield* await callGeminiWithRetry(
    JSON.stringify({ markdown, resume, applicant }),
    AI_SYSTEM_INSTRUCTION,
  );

  const coverLetterLexical = yield* await Result.try(
    async () => {
      const defaultEditorConfig = await editorConfigFactory.default({ config: await config });

      const headlessEditor = createHeadlessEditor({
        nodes: getEnabledNodes({ editorConfig: defaultEditorConfig }),
      });

      headlessEditor.update(
        () => {
          $convertFromMarkdownString(
            geminiResponse.coverLetter,
            defaultEditorConfig.features.markdownTransformers,
          );
        },
        { discrete: true },
      );

      return headlessEditor.getEditorState().toJSON();
    },
    (error) => new IOError("Failed to convert cover letter to Lexical state", { cause: error }),
  );

  return Result.ok({ ...geminiResponse, coverLetterLexical, url: targetUrl });
}

export async function fetchJobMetadata(urlInput: string, resumeId: number) {
  return withServerResult(Result.gen(runFetchJobMetadata(urlInput, resumeId)));
}
