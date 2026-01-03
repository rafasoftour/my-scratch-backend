import type { FastifyInstance } from "fastify";

export const registerHealthRoutes = async (server: FastifyInstance) => {
  server.get("/health", async () => ({ status: "ok" }));
};