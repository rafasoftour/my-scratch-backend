import type { User } from "../../domain/users/User.js";
import type { UserId } from "../../domain/users/UserId.js";
import type { UserSub } from "../../domain/users/UserSub.js";

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findBySub(sub: UserSub): Promise<User | null>;
  save(user: User): Promise<void>;
}
