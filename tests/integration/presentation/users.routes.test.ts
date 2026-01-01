import { describe, expect, it } from "vitest";
import { CreateUser } from "../../../src/application/users/CreateUser.js";
import { buildServer } from "../../../src/presentation/http/server.js";
import { InMemoryUserRepository } from "../../helpers/fakes/InMemoryUserRepository.js";

describe("users routes", () => {
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

  const buildTestServer = async () => {
    const createUser = new CreateUser(new InMemoryUserRepository());
    return buildServer(config, { createUser });
  };

  it("creates user without sub", async () => {
    const server = await buildTestServer();
    try {
      const response = await server.inject({
        method: "POST",
        url: "/api/users",
        payload: { displayName: "Alice" }
      });

      expect(response.statusCode).toBe(201);
      const body = response.json() as {
        id: string;
        displayName: string;
        sub?: string;
        isActive: boolean;
      };
      expect(body.id).toBeTruthy();
      expect(body.displayName).toBe("Alice");
      expect(body.isActive).toBe(true);
    } finally {
      await server.close();
    }
  });

  it("creates user with sub", async () => {
    const server = await buildTestServer();
    try {
      const response = await server.inject({
        method: "POST",
        url: "/api/users",
        payload: { displayName: "Bob", sub: "oidc-sub-1" }
      });

      expect(response.statusCode).toBe(201);
      const body = response.json() as {
        id: string;
        displayName: string;
        sub?: string;
        isActive: boolean;
      };
      expect(body.sub).toBe("oidc-sub-1");
    } finally {
      await server.close();
    }
  });

  it("returns standard error when sub already exists", async () => {
    const server = await buildTestServer();
    try {
      await server.inject({
        method: "POST",
        url: "/api/users",
        payload: { displayName: "Bob", sub: "oidc-sub-1" }
      });

      const response = await server.inject({
        method: "POST",
        url: "/api/users",
        payload: { displayName: "Other", sub: "oidc-sub-1" }
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toEqual({
        error: {
          statusCode: 409,
          code: "USER_ALREADY_EXISTS",
          message: "User already exists"
        }
      });
    } finally {
      await server.close();
    }
  });
});
