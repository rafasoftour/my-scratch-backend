import { describe, expect, it } from "vitest";
import {
  InvalidDisplayNameError,
  UserSubAlreadyAttachedError
} from "../../../../src/domain/users/errors.js";
import { User } from "../../../../src/domain/users/User.js";
import { UserId } from "../../../../src/domain/users/UserId.js";
import { UserSub } from "../../../../src/domain/users/UserSub.js";

describe("User", () => {
  it("creates with displayName and no sub", () => {
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440000"),
      displayName: "Alice"
    });

    expect(user.displayName).toBe("Alice");
    expect(user.sub).toBeUndefined();
    expect(user.isActive).toBe(true);
  });

  it("changeDisplayName normalizes", () => {
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440000"),
      displayName: "Alice"
    });

    user.changeDisplayName("  Nuevo  ");
    expect(user.displayName).toBe("Nuevo");
  });

  it("changeDisplayName rejects empty", () => {
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440000"),
      displayName: "Alice"
    });

    expect(() => user.changeDisplayName(" ")).toThrow(
      InvalidDisplayNameError
    );
  });

  it("attachSub works once", () => {
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440000"),
      displayName: "Alice"
    });

    user.attachSub(UserSub.create("sub-123"));
    expect(user.sub?.toString()).toBe("sub-123");
  });

  it("attachSub fails when already attached", () => {
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440000"),
      displayName: "Alice",
      sub: UserSub.create("sub-123")
    });

    expect(() => user.attachSub(UserSub.create("sub-456"))).toThrow(
      UserSubAlreadyAttachedError
    );
  });

  it("deactivate and activate toggle state", () => {
    const user = User.create({
      id: UserId.create("550e8400-e29b-41d4-a716-446655440000"),
      displayName: "Alice"
    });

    user.deactivate();
    expect(user.isActive).toBe(false);

    user.activate();
    expect(user.isActive).toBe(true);
  });
});