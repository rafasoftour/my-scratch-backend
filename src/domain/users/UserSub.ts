import { InvalidUserSubError } from "./errors.js";

export class UserSub {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): UserSub {
    const normalized = value.trim();
    if (normalized.length === 0) {
      throw new InvalidUserSubError();
    }
    return new UserSub(normalized);
  }

  toString(): string {
    return this.value;
  }
}