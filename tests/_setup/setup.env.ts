import { config } from "dotenv";

let configPaths = [".env.local", ".env"];
switch (process.env.NODE_ENV) {
  case "development":
    configPaths = [".env.development.local", ".env.development", ...configPaths];
    break;
  case "test":
    configPaths = [".env.test.local", ".env.test", ...configPaths];
    break;
}
config({ path: configPaths });
