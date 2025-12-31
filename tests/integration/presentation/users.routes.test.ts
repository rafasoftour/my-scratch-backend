import { describe, expect, it } from "vitest";
import { buildServer } from "../../../src/presentation/http/server.js";

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

  it("creates user without sub", async () => {
    const server = await buildServer(config);
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
    const server = await buildServer(config);
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
    const server = await buildServer(config);
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
          code: "CLIENT_ERROR",
          message: "Client Error"
        }
      });
    } finally {
      await server.close();
    }
  });
});
