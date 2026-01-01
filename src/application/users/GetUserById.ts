import { UserId } from "../../domain/users/UserId.js";
import type { UserRepository } from "../ports/UserRepository.js";
import { UserNotFoundError } from "./errors.js";

export type GetUserByIdInput = {
  id: string;
};

export class GetUserById {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetUserByIdInput) {
    const id = UserId.create(input.id);
    const user = await this.userRepository.findById(id);
    if (!user || user.isActive === false) {
      throw new UserNotFoundError();
    }
    return user;
  }
}
