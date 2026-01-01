import type { User } from "../../../src/domain/users/User.js";
import type { UserId } from "../../../src/domain/users/UserId.js";
import type { UserSub } from "../../../src/domain/users/UserSub.js";
import type { UserRepository } from "../../../src/application/ports/UserRepository.js";

export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [];

  async findBySub(sub: UserSub): Promise<User | null> {
    const subValue = sub.toString();
    const found = this.users.find((user) => user.sub?.toString() === subValue);
    return found ?? null;
  }

  async findById(id: UserId): Promise<User | null> {
    const idValue = id.toString();
    const found = this.users.find((user) => user.id.toString() === idValue);
    return found ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  count(): number {
    return this.users.length;
  }
}
