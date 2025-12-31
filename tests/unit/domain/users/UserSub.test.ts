import { describe, expect, it } from "vitest";
import { InvalidUserSubError } from "../../../../src/domain/users/errors.js";
import { UserSub } from "../../../../src/domain/users/UserSub.js";

describe("UserSub", () => {
  it("normalizes and trims", () => {
    const sub = UserSub.create(" abc ");
    expect(sub.toString()).toBe("abc");
  });

  it("throws on empty value", () => {
    expect(() => UserSub.create("   ")).toThrow(InvalidUserSubError);
  });
});