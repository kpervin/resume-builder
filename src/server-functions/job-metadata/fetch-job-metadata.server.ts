"use server";

import { ApiError, GenerateContentResponse, GoogleGenAI } from "@google/genai";
import config from "@payload-config";
import {
  $convertFromMarkdownString,
  editorConfigFactory,
  getEnabledNodes,
} from "@payloadcms/richtext-lexical";
import { createHeadlessEditor } from "@payloadcms/richtext-lexical/lexical/headless";
import { toJsonSchema } from "@valibot/to-json-schema";
import * as cheerio from "cheerio";
import { getPayload } from "payload";
import TurndownService from "turndown";
import * as v from "valibot";

import { env } from "@/env";

import { getHandler } from "./job-handlers.server";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ResponseSchema = v.object({
  title: v.pipe(v.string(), v.minLength(3)),
  company: v.pipe(v.string(), v.minLength(1)),
  description: v.pipe(v.string(), v.minLength(20), v.maxLength(2000)),
  coverLetter: v.pipe(v.string(), v.nonEmpty()),
  location: v.object({
    fullAddress: v.string(),
    street: v.string(),
    city: v.string(),
    province: v.string(),
    postalCode: v.string(),
  }),
});

const JsonSchema = toJsonSchema(ResponseSchema);

function convertToTokenEfficientMarkdown(rawHtml: string) {
  const $ = cheerio.load(rawHtml);

  // 1. EXTRACT STRUCTURED METADATA (The "Source of Truth")
  let structuredData = "";

  // Try to find JSON-LD (Workday uses this for Google Jobs)
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

  if (ogTitle && !structuredData.includes(ogTitle)) {
    structuredData += `META TITLE: ${ogTitle}\n`;
  }
  if (ogDescription && !structuredData.includes(ogDescription)) {
    structuredData += `META DESCRIPTION: ${ogDescription}\n`;
  }

  $("script, style, noscript, svg, path, img, iframe, meta, link").remove();
  $('header, footer, nav, aside, [role="dialog"]').remove();
  $(".visually-hidden").remove();

  const mainHtml = $("main").html() ?? $("[role='main']").html() ?? $("body").html();

  if (!mainHtml) return structuredData || null;

  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
  });

  const bodyMarkdown = turndownService.turndown(mainHtml);

  return /* markdown */ `
    ---
    ${structuredData}
    ---
    JOB DESCRIPTION CONTENT:
    ${bodyMarkdown}
  `.trim();
}

export async function fetchJobMetadata(urlInput: string, resumeId: number) {
  const payload = await getPayload({ config });

  const resume = await payload.findByID({
    collection: "resumes",
    id: resumeId,
  });

  const applicant =
    typeof resume.applicant === "number"
      ? await payload.findByID({
          collection: "applicants",
          id: resume.applicant,
        })
      : resume.applicant;

  try {
    new URL(urlInput);
    const { handler, url } = getHandler(urlInput);
    const targetUrl = handler.normalize(url);

    const res = await fetch(`${env.FLARESOLVERR_URL}/v1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cmd: "request.get",
        url: targetUrl,
        maxTimeout: 60000,
      }),
    });

    if (!res.ok) {
      console.error("Failed to fetch URL using FlareSolverr:", res.statusText);
      return null;
    }

    const resJson = await res.json();
    const html = resJson.solution.response;
    if (!html) return null;

    const markdown = convertToTokenEfficientMarkdown(html);
    if (!markdown) return null;

    const template = /* markdown */ `
      Dear {{recipient_honorific_and_last_name}}:

      [//]: # ( Here fill in the body of the cover letter )

      Sincerely,

      {{sender_name}}
    `;

    const prompt = `
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
      - If a field is not present, use "Not specified".
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

      Follow this template as a guideline:
      \`\`\`markdown
      ${template}
      \`\`\`
    `;

    let retries = 0;
    const maxRetries = 3;
    let delay = 1000;

    console.log("Sending HTML to Gemini for parsing...");

    const result = await (async function executeWithRetry(): Promise<GenerateContentResponse> {
      try {
        return await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: JSON.stringify({ markdown, resume, applicant }),
          config: {
            tools: [{ urlContext: {} }],
            responseMimeType: "application/json",
            responseJsonSchema: JsonSchema,
            systemInstruction: prompt,
          },
        });
      } catch (error: unknown) {
        if (!(error instanceof ApiError)) throw error;
        if (error.status === 429 && retries < maxRetries) {
          retries++;
          await wait(delay);
          delay *= 2;
          return executeWithRetry();
        }
        throw error;
      }
    })();

    if (!result.text) return null;

    const parsed = JSON.parse(result.text);

    const lowerTitle = String(parsed.title).toLowerCase();
    if (
      lowerTitle.includes("login") ||
      lowerTitle.includes("sign in") ||
      lowerTitle.includes("404")
    ) {
      console.error("Scraping failed: Target site blocked access or returned error.");
      return null;
    }
    const json = v.parse(ResponseSchema, parsed);

    const defaultEditorConfig = await editorConfigFactory.default({ config: await config });

    const headlessEditor = createHeadlessEditor({
      nodes: getEnabledNodes({
        editorConfig: defaultEditorConfig,
      }),
    });

    headlessEditor.update(
      () => {
        $convertFromMarkdownString(
          json.coverLetter,
          defaultEditorConfig.features.markdownTransformers,
        );
      },
      { discrete: true },
    );

    const coverLetterLexical = headlessEditor.getEditorState().toJSON();

    const response = { ...json, coverLetterLexical, url: targetUrl };

    console.log("Response:", response);

    return response;
  } catch (error) {
    console.error("Scraping error:", error);
    return null;
  }
}
