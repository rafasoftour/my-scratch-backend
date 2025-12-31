import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { errorHandler, notFoundHandler } from "./errors/error-handler.js";
import { registerRequestLogger } from "./plugins/request-logger.js";
import { registerHealthRoutes } from "./routes/health.routes.js";

type ServerConfig = {
  VIRTUALHOST: string;
} & Record<string, unknown>;

export const buildServer = async (config: ServerConfig) => {
  const server = Fastify({
    logger: true,
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID()
  });

  await registerRequestLogger(server);
  server.setNotFoundHandler(notFoundHandler);
  server.setErrorHandler(errorHandler);

  await server.register(registerHealthRoutes, {
    prefix: `/${config.VIRTUALHOST}`
  });

  return server;
};
