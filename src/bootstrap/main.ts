import "./env.js";
import { config } from "./config/index.js";
import { CreateUser } from "../application/users/CreateUser.js";
import { DeleteUser } from "../application/users/DeleteUser.js";
import { GetUserById } from "../application/users/GetUserById.js";
import { UpdateUser } from "../application/users/UpdateUser.js";
import { createLogger } from "../infrastructure/logging/createLogger.js";
import { connectMongo } from "../infrastructure/persistence/mongoose/connection.js";
import { MongoUserRepository } from "../infrastructure/persistence/mongoose/MongoUserRepository.js";
import { buildServer } from "../presentation/http/server.js";

try {
  console.log(`base path: /${config.VIRTUALHOST}`);
  await connectMongo(config);
  const logger = createLogger(config);
  const userRepository = new MongoUserRepository();
  const createUser = new CreateUser(userRepository);
  const deleteUser = new DeleteUser(userRepository);
  const getUserById = new GetUserById(userRepository);
  const updateUser = new UpdateUser(userRepository);
  const server = await buildServer(
    config,
    {
      createUser,
      deleteUser,
      getUserById,
      updateUser
    },
    logger
  );
  await server.listen({
    host: config.HOST,
    port: config.PORT
  });
  console.log(
    `Server listening on http://${config.HOST}:${config.PORT}/${config.VIRTUALHOST}`
  );
} catch (error) {
  console.error(error);
  process.exit(1);
}
