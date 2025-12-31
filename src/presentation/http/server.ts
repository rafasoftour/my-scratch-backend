import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health.routes.js";

type ServerConfig = {
  VIRTUALHOST: string;
} & Record<string, unknown>;

export const buildServer = async (config: ServerConfig) => {
  const server = Fastify();

  await server.register(registerHealthRoutes, {
    prefix: `/${config.VIRTUALHOST}`
  });

  return server;
};