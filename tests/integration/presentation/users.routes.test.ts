import { describe, expect, it } from "vitest";
import { CreateUser } from "../../../src/application/users/CreateUser.js";
import { DeleteUser } from "../../../src/application/users/DeleteUser.js";
import { GetUserById } from "../../../src/application/users/GetUserById.js";
import { UpdateUser } from "../../../src/application/users/UpdateUser.js";
import { buildServer } from "../../../src/presentation/http/server.js";
import { buildTestLogger } from "../../helpers/buildTestLogger.js";
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
    const repo = new InMemoryUserRepository();
    const createUser = new CreateUser(repo);
    const deleteUser = new DeleteUser(repo);
    const getUserById = new GetUserById(repo);
    const updateUser = new UpdateUser(repo);
    return buildServer(
      config,
      { createUser, deleteUser, getUserById, updateUser },
      buildTestLogger()
    );
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

  it("gets user by id", async () => {
    const server = await buildTestServer();
    try {
      const created = await server.inject({
        method: "POST",
        url: "/api/users",
        payload: { displayName: "Carol", sub: "oidc-sub-2" }
      });

      const createdBody = created.json() as { id: string };
      const response = await server.inject({
        method: "GET",
        url: `/api/users/${createdBody.id}`
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        id: createdBody.id,
        displayName: "Carol",
        sub: "oidc-sub-2",
        isActive: true
      });
    } finally {
      await server.close();
    }
  });

  it("returns 404 when user id does not exist", async () => {
    const server = await buildTestServer();
    try {
      const response = await server.inject({
        method: "GET",
        url: "/api/users/550e8400-e29b-41d4-a716-446655440099"
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        error: {
          statusCode: 404,
          code: "USER_NOT_FOUND",
          message: "User not found"
        }
      });
    } finally {
      await server.close();
    }
  });

  it("patches user displayName", async () => {
    const server = await buildTestServer();
    try {
      const created = await server.inject({
        method: "POST",
        url: "/api/users",
        payload: { displayName: "Dave" }
      });

      const createdBody = created.json() as { id: string };
      const response = await server.inject({
        method: "PATCH",
        url: `/api/users/${createdBody.id}`,
        payload: { displayName: "Dave Updated" }
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as {
        id: string;
        displayName: string;
        sub?: string;
        isActive: boolean;
      };
      expect(body.id).toBe(createdBody.id);
      expect(body.displayName).toBe("Dave Updated");
      expect(body.isActive).toBe(true);
    } finally {
      await server.close();
    }
  });

  it("deletes user and returns 404 afterwards", async () => {
    const server = await buildTestServer();
    try {
      const created = await server.inject({
        method: "POST",
        url: "/api/users",
        payload: { displayName: "Eve" }
      });

      const createdBody = created.json() as { id: string };
      const deleted = await server.inject({
        method: "DELETE",
        url: `/api/users/${createdBody.id}`
      });

      expect(deleted.statusCode).toBe(204);

      const response = await server.inject({
        method: "GET",
        url: `/api/users/${createdBody.id}`
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        error: {
          statusCode: 404,
          code: "USER_NOT_FOUND",
          message: "User not found"
        }
      });
    } finally {
      await server.close();
    }
  });

  it("returns 404 when deleting missing user", async () => {
    const server = await buildTestServer();
    try {
      const response = await server.inject({
        method: "DELETE",
        url: "/api/users/550e8400-e29b-41d4-a716-446655440100"
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        error: {
          statusCode: 404,
          code: "USER_NOT_FOUND",
          message: "User not found"
        }
      });
    } finally {
      await server.close();
    }
  });
});
