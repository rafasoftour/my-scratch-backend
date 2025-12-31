import { describe, expect, it } from "vitest";
import { buildServer } from "../../../src/presentation/http/server.js";

describe("health routes", () => {
  it("returns ok under virtual host prefix", async () => {
    const server = await buildServer({
      NODE_ENV: "test",
      LOG_LEVEL: "debug",
      PORT: 3000,
      MONGO_URI: "mongodb://user:pass@localhost:27017/mydb",
      OIDC_ISSUER: "https://wso2.example.com/oauth2/token",
      OIDC_AUDIENCE: "my-audience",
      VIRTUALHOST: "api"
    });

    try {
      const response = await server.inject({
        method: "GET",
        url: "/api/health"
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: "ok" });
    } finally {
      await server.close();
    }
  });
});