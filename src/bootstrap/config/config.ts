import { configSchema, type Config } from "./config.schema.js";

const requiredKeys: Array<keyof Config> = [
  "NODE_ENV",
  "LOG_LEVEL",
  "PORT",
  "MONGO_URI",
  "MONGO_DB_NAME",
  "MONGO_OPTIONS",
  "OIDC_ISSUER",
  "OIDC_AUDIENCE",
  "VIRTUALHOST"
];

export const loadConfig = (): Config => {
  const raw = process.env;
  const parsed = configSchema.safeParse(raw);

  if (!parsed.success) {
    const invalidKeys = new Set(
      parsed.error.issues
        .map((issue) => issue.path[0])
        .filter((key): key is keyof Config => typeof key === "string")
    );

    const missingKeys = requiredKeys.filter(
      (key) => raw[key] === undefined || raw[key] === ""
    );

    const allKeys = Array.from(new Set([...invalidKeys, ...missingKeys]));
    const list = allKeys.length > 0 ? allKeys.join(", ") : "unknown";

    throw new Error(`Invalid environment variables: ${list}`);
  }

  return parsed.data;
};
