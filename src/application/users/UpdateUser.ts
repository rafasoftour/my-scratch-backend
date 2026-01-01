import { User } from "../../domain/users/User.js";
import { UserId } from "../../domain/users/UserId.js";
import type { UserRepository } from "../ports/UserRepository.js";
import { UserNotFoundError } from "./errors.js";

export type UpdateUserInput = {
  id: string;
  displayName?: string;
  isActive?: boolean;
};

export class UpdateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const id = UserId.create(input.id);
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new UserNotFoundError();
    }

    const updated = User.create({
      id: existing.id,
      sub: existing.sub,
      displayName: input.displayName ?? existing.displayName,
      isActive: input.isActive ?? existing.isActive
    });

    await this.userRepository.save(updated);
    return updated;
  }
}