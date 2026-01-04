import Fastify from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SignJWT, exportJWK, generateKeyPair } from "jose";
import { CreateUser } from "../../../src/application/users/CreateUser.js";
import { DeleteUser } from "../../../src/application/users/DeleteUser.js";
import { GetUserById } from "../../../src/application/users/GetUserById.js";
import { UpdateUser } from "../../../src/application/users/UpdateUser.js";
import { OidcTokenVerifier } from "../../../src/infrastructure/auth/OidcTokenVerifier.js";
import { buildServer } from "../../../src/presentation/http/server.js";
import { buildTestLogger } from "../../helpers/buildTestLogger.js";
import { InMemoryUserRepository } from "../../helpers/fakes/InMemoryUserRepository.js";

describe("me route", () => {
  const issuer = "https://issuer.example.com";
  const audience = "aud";
  const kid = "test-kid-1";

  let jwksUrl = "";
  let privateKey: CryptoKey;
  let jwksServer: ReturnType<typeof Fastify>;

  const baseConfig = {
    NODE_ENV: "test",
    LOG_LEVEL: "info",
    HOST: "127.0.0.1",
    PORT: 3000,
    MONGO_URI: "mongodb://dummy",
    OIDC_ISSUER: issuer,
    OIDC_AUDIENCE: audience,
    HELMET_ENABLED: false,
    CORS_ENABLED: false,
    CORS_ORIGINS: "",
    CORS_ALLOW_CREDENTIALS: false,
    VIRTUALHOST: "api"
  } as const;

  beforeAll(async () => {
    const keyPair = await generateKeyPair("RS256");
    privateKey = keyPair.privateKey;
    const publicJwk = await exportJWK(keyPair.publicKey);
    publicJwk.kid = kid;
    publicJwk.use = "sig";
    publicJwk.alg = "RS256";

    jwksServer = Fastify();
    jwksServer.get("/.well-known/jwks.json", async () => ({
      keys: [publicJwk]
    }));
    await jwksServer.listen({ port: 0, host: "127.0.0.1" });
    const address = jwksServer.server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    jwksUrl = `http://127.0.0.1:${port}/.well-known/jwks.json`;
  });

  afterAll(async () => {
    if (jwksServer) {
      await jwksServer.close();
    }
  });

  const buildTestServer = async () => {
    const repo = new InMemoryUserRepository();
    const createUser = new CreateUser(repo);
    const deleteUser = new DeleteUser(repo);
    const getUserById = new GetUserById(repo);
    const updateUser = new UpdateUser(repo);
    const verifier = new OidcTokenVerifier({
      issuer,
      audience,
      jwksUrl
    });
    return buildServer(
      baseConfig,
      { createUser, deleteUser, getUserById, updateUser, verifier },
      buildTestLogger()
    );
  };

  it("returns 401 when authorization header is missing", async () => {
    const server = await buildTestServer();
    try {
      const response = await server.inject({
        method: "GET",
        url: "/api/me"
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        error: {
          statusCode: 401,
          code: "UNAUTHORIZED",
          message: "Unauthorized"
        }
      });
    } finally {
      await server.close();
    }
  });

  it("returns 401 for invalid token", async () => {
    const server = await buildTestServer();
    try {
      const response = await server.inject({
        method: "GET",
        url: "/api/me",
        headers: {
          authorization: "Bearer not-a-token"
        }
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        error: {
          statusCode: 401,
          code: "UNAUTHORIZED",
          message: "Unauthorized"
        }
      });
    } finally {
      await server.close();
    }
  });

  it("returns sub when token is valid", async () => {
    const server = await buildTestServer();
    try {
      const token = await new SignJWT({ sub: "oidc-sub-123" })
        .setProtectedHeader({ alg: "RS256", kid })
        .setIssuedAt()
        .setIssuer(issuer)
        .setAudience(audience)
        .setExpirationTime("2h")
        .sign(privateKey);

      const response = await server.inject({
        method: "GET",
        url: "/api/me",
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ sub: "oidc-sub-123" });
    } finally {
      await server.close();
    }
  });
});
