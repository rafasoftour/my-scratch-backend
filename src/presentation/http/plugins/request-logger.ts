import type { FastifyInstance } from "fastify";

export const registerRequestLogger = async (server: FastifyInstance) => {
  server.addHook("onRequest", (request, reply, done) => {
    reply.header("x-request-id", String(request.id));
    done();
  });
};
