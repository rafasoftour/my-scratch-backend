import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { errorHandler, notFoundHandler } from "./errors/error-handler.js";
import { registerRequestLogger } from "./plugins/request-logger.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerUsersRoutes } from "./routes/users.routes.js";
import type { CreateUser } from "../../application/users/CreateUser.js";
import type { DeleteUser } from "../../application/users/DeleteUser.js";
import type { GetUserById } from "../../application/users/GetUserById.js";
import type { UpdateUser } from "../../application/users/UpdateUser.js";
import type { FastifyBaseLogger } from "fastify";

type ServerConfig = {
  VIRTUALHOST: string;
};

type ServerDeps = {
  createUser: CreateUser;
  deleteUser: DeleteUser;
  getUserById: GetUserById;
  updateUser: UpdateUser;
};

export const buildServer = async (
  config: ServerConfig,
  deps: ServerDeps,
  logger: FastifyBaseLogger
) => {
  const server = Fastify({
    loggerInstance: logger,
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
    deleteUser: deps.deleteUser,
    getUserById: deps.getUserById,
    updateUser: deps.updateUser
  });

  return server;
};
