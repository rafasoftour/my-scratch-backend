export class UserAlreadyExistsError extends Error {
  readonly statusCode = 409;

  constructor(message = "User already exists") {
    super(message);
    this.name = "UserAlreadyExistsError";
  }
}
