import { afterAll, describe, expect, it } from "vitest";
import { CreateUser } from "../../../src/application/users/CreateUser.js";
import { DeleteUser } from "../../../src/application/users/DeleteUser.js";
import { GetUserById } from "../../../src/application/users/GetUserById.js";
import { UpdateUser } from "../../../src/application/users/UpdateUser.js";
import { buildServer } from "../../../src/presentation/http/server.js";
import { buildTestLogger } from "../../helpers/buildTestLogger.js";
import { buildTestVerifier } from "../../helpers/buildTestVerifier.js";
import { InMemoryUserRepository } from "../../helpers/fakes/InMemoryUserRepository.js";

describe("request id", () => {
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

  it("returns x-request-id header when not provided", async () => {
    const repo = new InMemoryUserRepository();
    const createUser = new CreateUser(repo);
    const deleteUser = new DeleteUser(repo);
    const getUserById = new GetUserById(repo);
    const updateUser = new UpdateUser(repo);
    const verifier = buildTestVerifier();
    server = await buildServer(
      config,
      { createUser, deleteUser, getUserById, updateUser, verifier },
      buildTestLogger()
    );

    const response = await server.inject({
      method: "GET",
      url: "/api/health"
    });

    expect(response.statusCode).toBe(200);
    const requestId = response.headers["x-request-id"];
    expect(requestId).toBeTruthy();
  });

  it("preserves incoming x-request-id header", async () => {
    const repo = new InMemoryUserRepository();
    const createUser = new CreateUser(repo);
    const deleteUser = new DeleteUser(repo);
    const getUserById = new GetUserById(repo);
    const updateUser = new UpdateUser(repo);
    const verifier = buildTestVerifier();
    server = await buildServer(
      config,
      { createUser, deleteUser, getUserById, updateUser, verifier },
      buildTestLogger()
    );

    const response = await server.inject({
      method: "GET",
      url: "/api/health",
      headers: {
        "x-request-id": "test-request-id"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-request-id"]).toBe("test-request-id");
  });
});
