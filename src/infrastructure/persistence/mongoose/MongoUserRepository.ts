import type { UserRepository } from "../../../application/ports/UserRepository.js";
import { User } from "../../../domain/users/User.js";
import { UserId } from "../../../domain/users/UserId.js";
import { UserSub } from "../../../domain/users/UserSub.js";
import { UserModel, type UserDocument } from "./models/UserModel.js";

export class MongoUserRepository implements UserRepository {
  async findById(id: UserId): Promise<User | null> {
    const doc = await UserModel.findById(id.toString()).lean<UserDocument>();
    if (!doc) {
      return null;
    }

    return User.create({
      id: UserId.create(doc._id),
      displayName: doc.displayName,
      sub: doc.sub ? UserSub.create(doc.sub) : undefined,
      isActive: doc.isActive
    });
  }

  async findBySub(sub: UserSub): Promise<User | null> {
    const doc = await UserModel.findOne({ sub: sub.toString() }).lean<UserDocument>();
    if (!doc) {
      return null;
    }

    return User.create({
      id: UserId.create(doc._id),
      displayName: doc.displayName,
      sub: doc.sub ? UserSub.create(doc.sub) : undefined,
      isActive: doc.isActive
    });
  }

  async save(user: User): Promise<void> {
    await UserModel.updateOne(
      { _id: user.id.toString() },
      {
        $set: {
          displayName: user.displayName,
          sub: user.sub?.toString(),
          isActive: user.isActive
        }
      },
      { upsert: true }
    );
  }
}
