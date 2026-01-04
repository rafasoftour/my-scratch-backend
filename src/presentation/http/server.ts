import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { errorHandler, notFoundHandler } from "./errors/error-handler.js";
import { registerAuth } from "./plugins/auth.js";
import { registerRequestLogger } from "./plugins/request-logger.js";
import { registerCors } from "./plugins/cors.js";
import { registerHelmet } from "./plugins/helmet.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerMeRoutes } from "./routes/me.routes.js";
import { registerUsersRoutes } from "./routes/users.routes.js";
import type { CreateUser } from "../../application/users/CreateUser.js";
import type { DeleteUser } from "../../application/users/DeleteUser.js";
import type { GetUserById } from "../../application/users/GetUserById.js";
import type { UpdateUser } from "../../application/users/UpdateUser.js";
import type { FastifyBaseLogger } from "fastify";

type ServerConfig = {
  VIRTUALHOST: string;
  NODE_ENV: "development" | "production" | "test";
  HELMET_ENABLED: boolean;
  CORS_ENABLED: boolean;
  CORS_ORIGINS: string;
  CORS_ALLOW_CREDENTIALS: boolean;
};

type ServerDeps = {
  createUser: CreateUser;
  deleteUser: DeleteUser;
  getUserById: GetUserById;
  updateUser: UpdateUser;
  verifier: {
    verify(token: string): Promise<{ sub: string; claims: Record<string, unknown> }>;
  };
};

export const buildServer = async (
  config: ServerConfig,
  deps: ServerDeps,
  logger: FastifyBaseLogger
) => {
  const server = Fastify({
    loggerInstance: logger,
    disableRequestLogging: false,
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID()
  });

  await registerRequestLogger(server);
  await registerHelmet(server, config);
  await registerCors(server, config);
  await registerAuth(server, { verifier: deps.verifier });
  server.setNotFoundHandler(notFoundHandler);
  server.setErrorHandler(errorHandler);

  await server.register(registerHealthRoutes, {
    prefix: `/${config.VIRTUALHOST}`
  });

  await server.register(registerMeRoutes, {
    prefix: `/${config.VIRTUALHOST}/me`,
    authenticate: server.authenticate
  });

  await server.register(registerUsersRoutes, {
    prefix: `/${config.VIRTUALHOST}/users`,
    createUser: deps.createUser,
    deleteUser: deps.deleteUser,
    getUserById: deps.getUserById,
    updateUser: deps.updateUser
  });

  return server;
};
