import "./env.js";
import { config } from "./config/index.js";
import { CreateUser } from "../application/users/CreateUser.js";
import { GetUserById } from "../application/users/GetUserById.js";
import { connectMongo } from "../infrastructure/persistence/mongoose/connection.js";
import { MongoUserRepository } from "../infrastructure/persistence/mongoose/MongoUserRepository.js";
import { buildServer } from "../presentation/http/server.js";

try {
  console.log(`base path: /${config.VIRTUALHOST}`);
  await connectMongo(config);
  const userRepository = new MongoUserRepository();
  const createUser = new CreateUser(userRepository);
  const getUserById = new GetUserById(userRepository);
  const server = await buildServer(config, { createUser, getUserById });
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
