import { describe, expect, it } from "vitest";
import { DeleteUser } from "../../../../src/application/users/DeleteUser.js";
import { UserNotFoundError } from "../../../../src/application/users/errors.js";
import { User } from "../../../../src/domain/users/User.js";
import { UserId } from "../../../../src/domain/users/UserId.js";
import { InMemoryUserRepository } from "../../../helpers/fakes/InMemoryUserRepository.js";

describe("DeleteUser", () => {
  it("deactivates active user", async () => {
    const repo = new InMemoryUserRepository();
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440030"),
      displayName: "Alice",
      isActive: true
    });

    await repo.save(user);
    const useCase = new DeleteUser(repo);

    await useCase.execute({ id: user.id.toString() });
    const updated = await repo.findById(UserId.create(user.id.toString()));

    expect(updated?.isActive).toBe(false);
  });

  it("throws when user does not exist", async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new DeleteUser(repo);

    await expect(
      useCase.execute({ id: "550e8400-e29b-41d4-a716-446655440031" })
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("throws when user already inactive", async () => {
    const repo = new InMemoryUserRepository();
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440032"),
      displayName: "Carol",
      isActive: false
    });

    await repo.save(user);
    const useCase = new DeleteUser(repo);

    await expect(
      useCase.execute({ id: user.id.toString() })
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});