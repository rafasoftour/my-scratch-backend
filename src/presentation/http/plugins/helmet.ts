import type { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";

type HelmetConfig = {
  HELMET_ENABLED: boolean;
};

export const registerHelmet = async (
  server: FastifyInstance,
  config: HelmetConfig
) => {
  if (!config.HELMET_ENABLED) {
    return;
  }

  await server.register(helmet);
};
