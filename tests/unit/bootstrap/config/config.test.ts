import { describe, expect, it, afterEach } from "vitest";
import { loadConfig } from "../../../../src/bootstrap/config/config.js";

type EnvMap = NodeJS.ProcessEnv;
const originalEnv: EnvMap = { ...process.env };

const setEnv = (nextEnv: EnvMap) => {
  for (const key of Object.keys(process.env)) {
    if (!(key in nextEnv)) {
      delete process.env[key];
    }
  }
  for (const [key, value] of Object.entries(nextEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
};

afterEach(() => {
  setEnv(originalEnv);
});

describe("bootstrap config", () => {
  it("returns typed config when valid", () => {
    setEnv({
      NODE_ENV: "development",
      LOG_LEVEL: "debug",
      PORT: "3000",
      MONGO_URI: "mongodb://user:pass@localhost:27017/mydb",
      MONGO_DB_NAME: "mydb",
      MONGO_OPTIONS: "directConnection=true",
      OIDC_ISSUER: "https://wso2.example.com/oauth2/token",
      OIDC_AUDIENCE: "my-audience",
      VIRTUALHOST: "api"
    });

    const config = loadConfig();

    expect(config.PORT).toBe(3000);
    expect(config.NODE_ENV).toBe("development");
  });

  it("throws when a required variable is missing", () => {
    setEnv({
      NODE_ENV: "development",
      LOG_LEVEL: "debug",
      PORT: "3000",
      OIDC_ISSUER: "https://wso2.example.com/oauth2/token",
      OIDC_AUDIENCE: "my-audience",
      MONGO_DB_NAME: "mydb",
      MONGO_OPTIONS: "directConnection=true",
      VIRTUALHOST: "api"
    });

    expect(() => loadConfig()).toThrow(/MONGO_URI/);
  });

  it("throws when PORT is not numeric", () => {
    setEnv({
      NODE_ENV: "development",
      LOG_LEVEL: "debug",
      PORT: "not-a-number",
      MONGO_URI: "mongodb://user:pass@localhost:27017/mydb",
      MONGO_DB_NAME: "mydb",
      MONGO_OPTIONS: "directConnection=true",
      OIDC_ISSUER: "https://wso2.example.com/oauth2/token",
      OIDC_AUDIENCE: "my-audience",
      VIRTUALHOST: "api"
    });

    expect(() => loadConfig()).toThrow(/PORT/);
  });
});
