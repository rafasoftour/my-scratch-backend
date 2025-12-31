import { z } from "zod";

export const configSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  LOG_LEVEL: z.string().min(1),
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: z.coerce.number(),
  MONGO_URI: z.string().min(1),
  OIDC_ISSUER: z.string().url(),
  OIDC_AUDIENCE: z.string().min(1),
  VIRTUALHOST: z.preprocess(
    (value) =>
      typeof value === "string" ? value.replace(/^\/+|\/+$/g, "") : value,
    z
      .string()
      .min(1)
      .max(50)
      .regex(/^[A-Za-z0-9-_]+$/)
  )
});

export type Config = z.infer<typeof configSchema>;
