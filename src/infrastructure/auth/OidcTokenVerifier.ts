import { createRemoteJWKSet, jwtVerify } from "jose";
import { InvalidTokenError } from "./errors.js";

export type VerifiedUser = {
  sub: string;
  claims: Record<string, unknown>;
};

type VerifierConfig = {
  issuer: string;
  audience: string;
  jwksUrl: string;
};

export class OidcTokenVerifier {
  private readonly jwks;

  constructor(private readonly cfg: VerifierConfig) {
    this.jwks = createRemoteJWKSet(new URL(cfg.jwksUrl));
  }

  async verify(token: string): Promise<VerifiedUser> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.cfg.issuer,
        audience: this.cfg.audience
      });

      if (typeof payload.sub !== "string" || payload.sub.length === 0) {
        throw new InvalidTokenError("Token subject is missing");
      }

      return {
        sub: payload.sub,
        claims: payload as Record<string, unknown>
      };
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        throw error;
      }
      throw new InvalidTokenError();
    }
  }
}
