import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler
} from "fastify";

type VerifiedUser = {
  sub: string;
  claims: Record<string, unknown>;
};

type AuthDeps = {
  verifier: { verify(token: string): Promise<VerifiedUser> };
};

declare module "fastify" {
  interface FastifyRequest {
    user?: VerifiedUser;
  }

  interface FastifyInstance {
    authenticate: preHandlerHookHandler;
  }
}

const sendUnauthorized = (reply: FastifyReply) => {
  reply.status(401).send({
    error: {
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Unauthorized"
    }
  });
};

export const registerAuth = async (server: FastifyInstance, deps: AuthDeps) => {
  server.decorateRequest("user", undefined);

  const authenticate: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      sendUnauthorized(reply);
      return;
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      sendUnauthorized(reply);
      return;
    }

    try {
      const verified = await deps.verifier.verify(token);
      request.user = verified;
    } catch {
      sendUnauthorized(reply);
    }
  };

  server.decorate("authenticate", authenticate);
};
