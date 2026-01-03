import type { FastifyInstance } from "fastify";
import type { CreateUser } from "../../../application/users/CreateUser.js";
import type { DeleteUser } from "../../../application/users/DeleteUser.js";
import type { GetUserById } from "../../../application/users/GetUserById.js";
import type { UpdateUser } from "../../../application/users/UpdateUser.js";

type UsersRoutesOptions = {
  createUser: CreateUser;
  deleteUser: DeleteUser;
  getUserById: GetUserById;
  updateUser: UpdateUser;
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

  server.patch("/:id", async (request, reply) => {
    const params = request.params as { id?: string };
    const body = request.body as { displayName?: string; isActive?: boolean };
    const user = await options.updateUser.execute({
      id: params.id ?? "",
      displayName: body.displayName,
      isActive: body.isActive
    });

    reply.status(200).send({
      id: user.id.toString(),
      displayName: user.displayName,
      sub: user.sub?.toString(),
      isActive: user.isActive
    });
  });

  server.delete("/:id", async (request, reply) => {
    const params = request.params as { id?: string };
    await options.deleteUser.execute({ id: params.id ?? "" });
    reply.status(204).send();
  });
};
