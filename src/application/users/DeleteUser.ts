import { User } from "../../domain/users/User.js";
import { UserId } from "../../domain/users/UserId.js";
import type { UserRepository } from "../ports/UserRepository.js";
import { UserNotFoundError } from "./errors.js";

export type DeleteUserInput = {
  id: string;
};

export class DeleteUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: DeleteUserInput): Promise<void> {
    const id = UserId.create(input.id);
    const existing = await this.userRepository.findById(id);
    if (!existing || existing.isActive === false) {
      throw new UserNotFoundError();
    }

    const updated = User.create({
      id: existing.id,
      sub: existing.sub,
      displayName: existing.displayName,
      isActive: false
    });

    await this.userRepository.save(updated);
  }
}