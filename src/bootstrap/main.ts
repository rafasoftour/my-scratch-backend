import "./env.js";
import { config } from "./config/index.js";
import { buildServer } from "../presentation/http/server.js";

try {
  console.log(`base path: /${config.VIRTUALHOST}`);
  const server = await buildServer(config);
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
