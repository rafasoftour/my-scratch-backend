import type { FastifyInstance, preHandlerHookHandler } from "fastify";

type MeRoutesOptions = {
  authenticate: preHandlerHookHandler;
};

export const registerMeRoutes = async (
  server: FastifyInstance,
  options: MeRoutesOptions
) => {
  server.get(
    "/",
    { preHandler: options.authenticate },
    async (request) => ({
      sub: request.user?.sub ?? ""
    })
  );
};
