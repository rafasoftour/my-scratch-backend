import { afterAll, describe, expect, it } from "vitest";
import { CreateUser } from "../../../src/application/users/CreateUser.js";
import { DeleteUser } from "../../../src/application/users/DeleteUser.js";
import { GetUserById } from "../../../src/application/users/GetUserById.js";
import { UpdateUser } from "../../../src/application/users/UpdateUser.js";
import { buildServer } from "../../../src/presentation/http/server.js";
import { buildTestLogger } from "../../helpers/buildTestLogger.js";
import { InMemoryUserRepository } from "../../helpers/fakes/InMemoryUserRepository.js";

describe("security headers", () => {
  const baseConfig = {
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

  const buildTestServer = async (configOverrides: Record<string, unknown>) => {
    const repo = new InMemoryUserRepository();
    const createUser = new CreateUser(repo);
    const deleteUser = new DeleteUser(repo);
    const getUserById = new GetUserById(repo);
    const updateUser = new UpdateUser(repo);
    const config = { ...baseConfig, ...configOverrides };
    return buildServer(
      config,
      { createUser, deleteUser, getUserById, updateUser },
      buildTestLogger()
    );
  };

  let server: Awaited<ReturnType<typeof buildServer>>;

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  it("adds helmet headers when enabled", async () => {
    server = await buildTestServer({
      HELMET_ENABLED: true,
      CORS_ENABLED: false
    });

    const response = await server.inject({
      method: "GET",
      url: "/api/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("allows explicit CORS origin", async () => {
    server = await buildTestServer({
      HELMET_ENABLED: false,
      CORS_ENABLED: true,
      CORS_ORIGINS: "http://localhost:4200",
      CORS_ALLOW_CREDENTIALS: false
    });

    const response = await server.inject({
      method: "GET",
      url: "/api/health",
      headers: {
        origin: "http://localhost:4200"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:4200"
    );
  });

  it("blocks non-allowed CORS origin", async () => {
    server = await buildTestServer({
      HELMET_ENABLED: false,
      CORS_ENABLED: true,
      CORS_ORIGINS: "http://localhost:4200",
      CORS_ALLOW_CREDENTIALS: false
    });

    const response = await server.inject({
      method: "GET",
      url: "/api/health",
      headers: {
        origin: "http://evil.example.com"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
