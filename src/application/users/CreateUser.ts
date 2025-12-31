import { randomUUID } from "node:crypto";
import { User } from "../../domain/users/User.js";
import { UserId } from "../../domain/users/UserId.js";
import { UserSub } from "../../domain/users/UserSub.js";
import type { UserRepository } from "../ports/UserRepository.js";
import { UserAlreadyExistsError } from "./errors.js";

export type CreateUserInput = {
  displayName: string;
  sub?: string;
};

export class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const sub = input.sub ? UserSub.create(input.sub) : undefined;

    if (sub) {
      const existing = await this.userRepository.findBySub(sub);
      if (existing) {
        throw new UserAlreadyExistsError();
      }
    }

    const user = User.create({
      id: UserId.create(randomUUID()),
      displayName: input.displayName,
      sub,
      isActive: true
    });

    await this.userRepository.save(user);
    return user;
  }
}