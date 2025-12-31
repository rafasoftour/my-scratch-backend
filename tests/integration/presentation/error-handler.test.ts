import { afterAll, describe, expect, it } from "vitest";
import { CreateUser } from "../../../src/application/users/CreateUser.js";
import { buildServer } from "../../../src/presentation/http/server.js";
import { InMemoryUserRepository } from "../../helpers/fakes/InMemoryUserRepository.js";

describe("error handler", () => {
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

  it("returns 404 with standard payload", async () => {
    const createUser = new CreateUser(new InMemoryUserRepository());
    server = await buildServer(config, { createUser });

    const response = await server.inject({
      method: "GET",
      url: "/api/does-not-exist"
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Not Found"
      }
    });
  });

  it("returns 500 with standard payload", async () => {
    const createUser = new CreateUser(new InMemoryUserRepository());
    server = await buildServer(config, { createUser });

    await server.register(
      async (instance) => {
        instance.get("/boom", async () => {
          throw new Error("boom");
        });
      },
      { prefix: `/${config.VIRTUALHOST}` }
    );

    const response = await server.inject({
      method: "GET",
      url: "/api/boom"
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: {
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error"
      }
    });
  });
});
