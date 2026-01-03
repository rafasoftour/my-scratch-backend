import { z } from "zod";

const parseBoolean = (value: unknown) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no"].includes(normalized)) {
      return false;
    }
  }
  return value;
};

export const configSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  LOG_LEVEL: z.string().min(1),
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: z.coerce.number(),
  MONGO_URI: z.string().min(1),
  MONGO_DB_NAME: z.string().min(1),
  MONGO_OPTIONS: z.string().min(1),
  OIDC_ISSUER: z.string().url(),
  OIDC_AUDIENCE: z.string().min(1),
  GRAYLOG_ENABLED: z.preprocess(parseBoolean, z.boolean()).default(false),
  GRAYLOG_HOSTNAME: z.string().min(1).optional(),
  GRAYLOG_HOST: z.string().min(1).optional(),
  GRAYLOG_PORT: z.coerce.number().optional(),
  GRAYLOG_USESSL: z.preprocess(parseBoolean, z.boolean()).default(false),
  VIRTUALHOST: z.preprocess(
    (value) =>
      typeof value === "string" ? value.replace(/^\/+|\/+$/g, "") : value,
    z
      .string()
      .min(1)
      .max(50)
      .regex(/^[A-Za-z0-9-_]+$/)
  )
}).superRefine((data, context) => {
  if (!data.GRAYLOG_ENABLED) {
    return;
  }

  if (!data.GRAYLOG_HOSTNAME) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["GRAYLOG_HOSTNAME"],
      message: "GRAYLOG_HOSTNAME is required when GRAYLOG_ENABLED is true"
    });
  }

  if (!data.GRAYLOG_HOST) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["GRAYLOG_HOST"],
      message: "GRAYLOG_HOST is required when GRAYLOG_ENABLED is true"
    });
  }

  if (data.GRAYLOG_PORT === undefined || Number.isNaN(data.GRAYLOG_PORT)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["GRAYLOG_PORT"],
      message: "GRAYLOG_PORT is required when GRAYLOG_ENABLED is true"
    });
  }
});

export type Config = z.infer<typeof configSchema>;
