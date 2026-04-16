import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { ApplicantsCollection } from "@/collections/applicants.collection";
import { JobApplicationsCollection } from "@/collections/job-applications.collection";
import { ReferencesCollection } from "@/collections/references.collection";
import { ResumesCollection } from "@/collections/resumes.collection";
import { env } from "@/env";

import { MediaCollection } from "./collections/media.collection";
import { UsersCollection } from "./collections/users.collection";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: UsersCollection.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    ApplicantsCollection,
    ResumesCollection,
    ReferencesCollection,
    JobApplicationsCollection,
    MediaCollection,
    UsersCollection,
  ],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL || "",
    },
    push: process.env.NODE_ENV === "development",
  }),
  sharp,
  plugins: [],
});
