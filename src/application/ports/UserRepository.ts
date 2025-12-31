import type { User } from "../../domain/users/User.js";
import type { UserSub } from "../../domain/users/UserSub.js";

export interface UserRepository {
  findBySub(sub: UserSub): Promise<User | null>;
  save(user: User): Promise<void>;
}