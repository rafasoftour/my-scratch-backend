import { InvalidUserIdError } from "./errors.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UserId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): UserId {
    if (!UUID_V4_REGEX.test(value)) {
      throw new InvalidUserIdError();
    }
    return new UserId(value);
  }

  toString(): string {
    return this.value;
  }
}