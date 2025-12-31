import type { FastifyInstance } from "fastify";
import type { CreateUser } from "../../../application/users/CreateUser.js";

type UsersRoutesOptions = {
  createUser: CreateUser;
};

export const registerUsersRoutes = async (
  server: FastifyInstance,
  options: UsersRoutesOptions
) => {
  server.post("/", async (request, reply) => {
    const body = request.body as { displayName?: string; sub?: string };
    const user = await options.createUser.execute({
      displayName: body.displayName ?? "",
      sub: body.sub
    });

    reply.status(201).send({
      id: user.id.toString(),
      displayName: user.displayName,
      sub: user.sub?.toString(),
      isActive: user.isActive
    });
  });
};
