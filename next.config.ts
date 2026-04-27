import path from "path";
import { fileURLToPath } from "url";

import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

import "@/env";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  ...(!!process.env.DOCKER && { output: "standalone" }),
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  images: {
    localPatterns: [
      {
        pathname: "/api/media/file/**",
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  redirects: () => [
    {
      source: "/",
      destination: "/admin",
      permanent: true,
    },
  ],
  typedRoutes: true,
  experimental: {
    authInterrupts: true,
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
