import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { User } from "../../../../src/domain/users/User.js";
import { UserId } from "../../../../src/domain/users/UserId.js";
import { UserSub } from "../../../../src/domain/users/UserSub.js";
import { MongoUserRepository } from "../../../../src/infrastructure/persistence/mongoose/MongoUserRepository.js";
import { UserModel } from "../../../../src/infrastructure/persistence/mongoose/models/UserModel.js";

describe("MongoUserRepository", () => {
  const repo = new MongoUserRepository();
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  beforeEach(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it("save persists user", async () => {
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440000"),
      displayName: "Alice",
      sub: UserSub.create("oidc-sub-1"),
      isActive: true
    });

    await repo.save(user);

    const persisted = await UserModel.findById(user.id.toString()).lean();
    expect(persisted?.displayName).toBe("Alice");
    expect(persisted?.sub).toBe("oidc-sub-1");
    expect(persisted?.isActive).toBe(true);
  });

  it("findBySub returns user", async () => {
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440001"),
      displayName: "Alice",
      sub: UserSub.create("oidc-sub-1"),
      isActive: true
    });

    await repo.save(user);

    const found = await repo.findBySub(UserSub.create("oidc-sub-1"));
    expect(found?.displayName).toBe("Alice");
  });

  it("findBySub returns null when missing", async () => {
    const found = await repo.findBySub(UserSub.create("missing-sub"));
    expect(found).toBeNull();
  });
});
