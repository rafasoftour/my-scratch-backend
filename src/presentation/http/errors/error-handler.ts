import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

const sendError = (
  reply: FastifyReply,
  statusCode: number,
  code: string,
  message: string
) => {
  reply.status(statusCode).send({
    error: {
      statusCode,
      code,
      message
    }
  });
};

export const notFoundHandler = (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  sendError(reply, 404, "NOT_FOUND", "Not Found");
};

export const errorHandler = (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    const code = error.statusCode === 404 ? "NOT_FOUND" : "BAD_REQUEST";
    const message = error.statusCode === 404 ? "Not Found" : "Bad Request";
    sendError(reply, error.statusCode, code, message);
    return;
  }

  reply.log.error({ err: error }, "Unhandled error");
  sendError(reply, 500, "INTERNAL_SERVER_ERROR", "Internal Server Error");
};