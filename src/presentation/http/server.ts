import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { errorHandler, notFoundHandler } from "./errors/error-handler.js";
import { registerRequestLogger } from "./plugins/request-logger.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerUsersRoutes } from "./routes/users.routes.js";
import type { CreateUser } from "../../application/users/CreateUser.js";
import type { GetUserById } from "../../application/users/GetUserById.js";

type ServerConfig = {
  VIRTUALHOST: string;
};

type ServerDeps = {
  createUser: CreateUser;
  getUserById: GetUserById;
};

export const buildServer = async (config: ServerConfig, deps: ServerDeps) => {
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

  await server.register(registerUsersRoutes, {
    prefix: `/${config.VIRTUALHOST}/users`,
    createUser: deps.createUser,
    getUserById: deps.getUserById
  });

  return server;
};
