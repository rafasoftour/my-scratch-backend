import { afterAll, describe, expect, it } from "vitest";
import { CreateUser } from "../../../src/application/users/CreateUser.js";
import { DeleteUser } from "../../../src/application/users/DeleteUser.js";
import { GetUserById } from "../../../src/application/users/GetUserById.js";
import { UpdateUser } from "../../../src/application/users/UpdateUser.js";
import { buildServer } from "../../../src/presentation/http/server.js";
import { buildTestLogger } from "../../helpers/buildTestLogger.js";
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
    HELMET_ENABLED: false,
    CORS_ENABLED: false,
    CORS_ORIGINS: "",
    CORS_ALLOW_CREDENTIALS: false,
    VIRTUALHOST: "api"
  } as const;

  let server: Awaited<ReturnType<typeof buildServer>>;

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  it("GET /api/health returns 200", async () => {
    const repo = new InMemoryUserRepository();
    const createUser = new CreateUser(repo);
    const deleteUser = new DeleteUser(repo);
    const getUserById = new GetUserById(repo);
    const updateUser = new UpdateUser(repo);
    server = await buildServer(
      config,
      { createUser, deleteUser, getUserById, updateUser },
      buildTestLogger()
    );

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
    const deleteUser = new DeleteUser(repo);
    const getUserById = new GetUserById(repo);
    const updateUser = new UpdateUser(repo);
    server = await buildServer(
      config,
      { createUser, deleteUser, getUserById, updateUser },
      buildTestLogger()
    );

    const response = await server.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(404);
  });
});
