import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { CreateUser } from "../../application/users/CreateUser.js";
import { errorHandler, notFoundHandler } from "./errors/error-handler.js";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository.js";
import { registerRequestLogger } from "./plugins/request-logger.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerUsersRoutes } from "./routes/users.routes.js";

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

  const userRepository = new InMemoryUserRepository();
  const createUser = new CreateUser(userRepository);

  await server.register(registerHealthRoutes, {
    prefix: `/${config.VIRTUALHOST}`
  });

  await server.register(registerUsersRoutes, {
    prefix: `/${config.VIRTUALHOST}/users`,
    createUser
  });

  return server;
};
