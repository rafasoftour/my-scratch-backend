import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

type CorsConfig = {
  NODE_ENV: "development" | "production" | "test";
  CORS_ENABLED: boolean;
  CORS_ORIGINS: string;
  CORS_ALLOW_CREDENTIALS: boolean;
};

const parseOrigins = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const isLocalhostOrigin = (origin: string) => {
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

export const registerCors = async (
  server: FastifyInstance,
  config: CorsConfig
) => {
  if (!config.CORS_ENABLED) {
    return;
  }

  const explicitOrigins = parseOrigins(config.CORS_ORIGINS);
  const allowLocalhostFallback =
    config.NODE_ENV === "development" && explicitOrigins.length === 0;

  await server.register(cors, {
    credentials: config.CORS_ALLOW_CREDENTIALS,
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }

      if (explicitOrigins.length > 0) {
        cb(null, explicitOrigins.includes(origin));
        return;
      }

      if (allowLocalhostFallback) {
        cb(null, isLocalhostOrigin(origin));
        return;
      }

      cb(null, false);
    }
  });
};
