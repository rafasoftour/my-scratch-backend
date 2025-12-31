import { describe, expect, it } from "vitest";
import { CreateUser } from "../../../../src/application/users/CreateUser.js";
import { UserAlreadyExistsError } from "../../../../src/application/users/errors.js";
import { InMemoryUserRepository } from "../../../helpers/fakes/InMemoryUserRepository.js";

describe("CreateUser", () => {
  it("creates user without sub", async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new CreateUser(repo);

    const user = await useCase.execute({
      displayName: "Alice"
    });

    expect(user.displayName).toBe("Alice");
    expect(user.sub).toBeUndefined();
    expect(repo.count()).toBe(1);
  });

  it("creates user with sub", async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new CreateUser(repo);

    const user = await useCase.execute({
      displayName: "Bob",
      sub: "sub-123"
    });

    expect(user.sub?.toString()).toBe("sub-123");
    expect(repo.count()).toBe(1);
  });

  it("throws when sub already exists", async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new CreateUser(repo);

    await useCase.execute({
      displayName: "Bob",
      sub: "sub-123"
    });

    await expect(
      useCase.execute({
        displayName: "Other",
        sub: "sub-123"
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});