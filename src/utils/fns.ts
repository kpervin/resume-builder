import type { Route } from "next";

import { env } from "@/env";

const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v\.?|via)$/i;

export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index > 0 && word.match(smallWords)) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function generatePreviewUrl<T extends string>(path: Route<T>): string {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${baseUrl}${path}` as Route;
}
