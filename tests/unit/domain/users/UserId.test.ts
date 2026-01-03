import { describe, expect, it } from "vitest";
import { InvalidUserIdError } from "../../../../src/domain/users/errors.js";
import { UserId } from "../../../../src/domain/users/UserId.js";

describe("UserId", () => {
  it("creates with valid uuid v4", () => {
    const id = UserId.create("550e8400-e29b-41d4-a716-446655440000");
    expect(id.toString()).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("throws on invalid uuid", () => {
    expect(() => UserId.create("not-a-uuid")).toThrow(InvalidUserIdError);
  });
});