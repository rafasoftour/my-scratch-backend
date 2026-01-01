import type { FastifyInstance } from "fastify";
import type { CreateUser } from "../../../application/users/CreateUser.js";
import type { GetUserById } from "../../../application/users/GetUserById.js";

type UsersRoutesOptions = {
  createUser: CreateUser;
  getUserById: GetUserById;
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

  server.get("/:id", async (request, reply) => {
    const params = request.params as { id?: string };
    const user = await options.getUserById.execute({
      id: params.id ?? ""
    });

    reply.status(200).send({
      id: user.id.toString(),
      displayName: user.displayName,
      sub: user.sub?.toString(),
      isActive: user.isActive
    });
  });
};
