import type { User } from "../../../domain/users/User.js";
import type { UserSub } from "../../../domain/users/UserSub.js";
import type { UserRepository } from "../../../application/ports/UserRepository.js";

export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [];

  async findBySub(sub: UserSub): Promise<User | null> {
    const subValue = sub.toString();
    const found = this.users.find((user) => user.sub?.toString() === subValue);
    return found ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }
}
