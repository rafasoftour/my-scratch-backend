import type { User } from "../../../domain/users/User.js";
import type { UserId } from "../../../domain/users/UserId.js";
import type { UserSub } from "../../../domain/users/UserSub.js";
import type { UserRepository } from "../../../application/ports/UserRepository.js";

export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [];

  async findById(id: UserId): Promise<User | null> {
    const idValue = id.toString();
    const found = this.users.find((user) => user.id.toString() === idValue);
    return found ?? null;
  }

  async findBySub(sub: UserSub): Promise<User | null> {
    const subValue = sub.toString();
    const found = this.users.find((user) => user.sub?.toString() === subValue);
    return found ?? null;
  }

  async save(user: User): Promise<void> {
    const existingIndex = this.users.findIndex(
      (stored) => stored.id.toString() === user.id.toString()
    );
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
      return;
    }
    this.users.push(user);
  }
}
