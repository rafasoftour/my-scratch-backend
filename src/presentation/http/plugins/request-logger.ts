import type { FastifyInstance, FastifyRequest } from "fastify";

export const registerRequestLogger = async (server: FastifyInstance) => {
  server.addHook("onSend", async (request, reply, payload) => {
    reply.header("x-request-id", request.id);
    return payload;
  });

  server.addHook("onResponse", async (request, reply) => {
    const durationMs = reply.getResponseTime();
    const logPayload = {
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTimeMs: Math.round(durationMs)
    };

    if (reply.statusCode >= 500) {
      request.log.error(logPayload, "request failed");
      return;
    }

    request.log.info(logPayload, "request completed");
  });
};
