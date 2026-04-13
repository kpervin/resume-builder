"use server";

import { ApiError, GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { toJsonSchema } from "@valibot/to-json-schema";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import * as v from "valibot";

import { getHandler } from "./job-handlers.server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ResponseSchema = v.object({
  title: v.pipe(v.string(), v.minLength(3)),
  company: v.pipe(v.string(), v.minLength(1)),
  location: v.pipe(v.string(), v.minLength(1)),
  description: v.pipe(v.string(), v.minLength(20), v.maxLength(2000)),
});

const JsonSchema = toJsonSchema(ResponseSchema);

function convertToTokenEfficientMarkdown(rawHtml: string) {
  const $ = cheerio.load(rawHtml);

  $("script, style, noscript, svg, path, img, iframe, meta, link").remove();

  $('header, footer, nav, aside, [role="dialog"]').remove();

  $(".visually-hidden").remove();

  const mainHtml = $("main").html() ?? $("body").html();

  if (!mainHtml) return null;

  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  let markdown = turndownService.turndown(mainHtml);

  markdown = markdown.replace(/\n{3,}/g, "\n\n").trim();

  return markdown;
}

export async function fetchJobMetadata(urlInput: string) {
  if (!urlInput) return null;

  try {
    new URL(urlInput);
    const { handler, url } = getHandler(urlInput);
    const targetUrl = handler.normalize(url);

    const res = await fetch(`${process.env.FLARESOLVERR_URL}/v1`, {
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

    // 2. The Optimized Prompt
    const prompt = `
      You are an expert Data Analyst. Your task is to scrape job posting data from the provided content.

      INSTRUCTIONS:
      - Extract the job title, company name, location, and a summary of the job description.
      - If a field is not present, use "Not specified".
      - For 'title', remove internal reference codes (e.g., "#12345").
      - For 'description', summarize the requirements and responsibilities into a professional paragraph. Do not just copy/paste the whole page.
      - If the page requires a login, displays a "404", or is blocked, return a JSON that signals an error instead of guessing data.
      - Do not include any conversational filler. Return pure JSON.
    `;

    let retries = 0;
    const maxRetries = 3;
    let delay = 1000;

    console.log("Sending HTML to Gemini for parsing...");

    const result = await (async function executeWithRetry(): Promise<GenerateContentResponse> {
      try {
        return await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: markdown,
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

    console.log("Parsed Response:", parsed);

    const lowerTitle = String(parsed.title).toLowerCase();
    if (
      lowerTitle.includes("login") ||
      lowerTitle.includes("sign in") ||
      lowerTitle.includes("404")
    ) {
      console.error("Scraping failed: Target site blocked access or returned error.");
      return null;
    }

    return { ...v.parse(ResponseSchema, parsed), url: targetUrl };
  } catch (error) {
    console.error("Scraping error:", error);
    return null;
  }
}
