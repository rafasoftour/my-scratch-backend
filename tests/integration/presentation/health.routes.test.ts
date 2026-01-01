import { afterAll, describe, expect, it } from "vitest";
import { CreateUser } from "../../../src/application/users/CreateUser.js";
import { GetUserById } from "../../../src/application/users/GetUserById.js";
import { buildServer } from "../../../src/presentation/http/server.js";
import { InMemoryUserRepository } from "../../helpers/fakes/InMemoryUserRepository.js";

describe("health routes", () => {
  const config = {
    NODE_ENV: "test",
    LOG_LEVEL: "info",
    HOST: "127.0.0.1",
    PORT: 3000,
    MONGO_URI: "mongodb://dummy",
    OIDC_ISSUER: "https://issuer.example.com",
    OIDC_AUDIENCE: "aud",
    VIRTUALHOST: "api"
  };

  let server: Awaited<ReturnType<typeof buildServer>>;

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  it("GET /api/health returns 200", async () => {
    const repo = new InMemoryUserRepository();
    const createUser = new CreateUser(repo);
    const getUserById = new GetUserById(repo);
    server = await buildServer(config, { createUser, getUserById });

    const response = await server.inject({
      method: "GET",
      url: "/api/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("GET /health returns 404 (prefix required)", async () => {
    const repo = new InMemoryUserRepository();
    const createUser = new CreateUser(repo);
    const getUserById = new GetUserById(repo);
    server = await buildServer(config, { createUser, getUserById });

    const response = await server.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(404);
  });
});
