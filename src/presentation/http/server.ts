import Fastify from "fastify";
import { errorHandler, notFoundHandler } from "./errors/error-handler.js";
import { registerHealthRoutes } from "./routes/health.routes.js";

type ServerConfig = {
  VIRTUALHOST: string;
} & Record<string, unknown>;

export const buildServer = async (config: ServerConfig) => {
  const server = Fastify();

  server.setNotFoundHandler(notFoundHandler);
  server.setErrorHandler(errorHandler);

  await server.register(registerHealthRoutes, {
    prefix: `/${config.VIRTUALHOST}`
  });

  return server;
};
