import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const setRequestIdHeader = (request: FastifyRequest, reply: FastifyReply) => {
  const value = String(request.id);
  reply.header("x-request-id", value);
  reply.raw.setHeader("x-request-id", value);
};

export const registerRequestLogger = async (server: FastifyInstance) => {
  const startTimes = new WeakMap<FastifyRequest, bigint>();

  server.addHook("onRequest", (request, reply, done) => {
    startTimes.set(request, process.hrtime.bigint());
    setRequestIdHeader(request, reply);
    done();
  });

  server.addHook("onSend", (request, reply, payload, done) => {
    setRequestIdHeader(request, reply);
    done(null, payload);
  });

  server.addHook("onResponse", (request, reply, done) => {
    const start = startTimes.get(request);
    const durationMs = start
      ? Number((process.hrtime.bigint() - start) / 1000000n)
      : 0;
    const logPayload = {
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTimeMs: Math.round(durationMs)
    };

    if (reply.statusCode >= 500) {
      request.log.error(logPayload, "request failed");
      done();
      return;
    }

    request.log.info(logPayload, "request completed");
    done();
  });
};
