import { UserAlreadyExistsError } from "../../../application/users/errors.js";
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
      message,
    },
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
  if (reply.sent) {
    return;
  }

  if (error instanceof UserAlreadyExistsError) {
    sendError(reply, 409, "USER_ALREADY_EXISTS", error.message);
    return;
  }

  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    if (error.statusCode === 404) {
      return;
    }

    const statusCode = error.statusCode;
    const mapping: Record<number, { code: string; message: string }> = {
      400: { code: "BAD_REQUEST", message: "Bad Request" },
      401: { code: "UNAUTHORIZED", message: "Unauthorized" },
      403: { code: "FORBIDDEN", message: "Forbidden" },
      429: { code: "TOO_MANY_REQUESTS", message: "Too Many Requests" }
    };

    const mapped = mapping[statusCode] ?? {
      code: "CLIENT_ERROR",
      message: "Client Error"
    };

    sendError(reply, statusCode, mapped.code, mapped.message);
    return;
  }

  reply.log.error({ err: error }, "Unhandled error");
  sendError(reply, 500, "INTERNAL_SERVER_ERROR", "Internal Server Error");
};
