import { describe, expect, it } from "vitest";
import { GetUserById } from "../../../../src/application/users/GetUserById.js";
import { UserNotFoundError } from "../../../../src/application/users/errors.js";
import { User } from "../../../../src/domain/users/User.js";
import { UserId } from "../../../../src/domain/users/UserId.js";
import { UserSub } from "../../../../src/domain/users/UserSub.js";
import { InMemoryUserRepository } from "../../../helpers/fakes/InMemoryUserRepository.js";

describe("GetUserById", () => {
  it("returns existing user", async () => {
    const repo = new InMemoryUserRepository();
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440010"),
      displayName: "Alice",
      sub: UserSub.create("sub-1"),
      isActive: true
    });

    await repo.save(user);
    const useCase = new GetUserById(repo);

    const result = await useCase.execute({ id: user.id.toString() });
    expect(result.displayName).toBe("Alice");
  });

  it("throws when user does not exist", async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new GetUserById(repo);

    await expect(
      useCase.execute({ id: "550e8400-e29b-41d4-a716-446655440011" })
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("throws when user is inactive", async () => {
    const repo = new InMemoryUserRepository();
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440012"),
      displayName: "Inactive",
      isActive: false
    });

    await repo.save(user);
    const useCase = new GetUserById(repo);

    await expect(
      useCase.execute({ id: user.id.toString() })
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
