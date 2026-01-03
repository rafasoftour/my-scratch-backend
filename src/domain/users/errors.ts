export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidUserIdError extends DomainError {
  constructor(message = "Invalid user id") {
    super(message);
  }
}

export class InvalidUserSubError extends DomainError {
  constructor(message = "Invalid user sub") {
    super(message);
  }
}

export class InvalidDisplayNameError extends DomainError {
  constructor(message = "Invalid display name") {
    super(message);
  }
}

export class UserSubAlreadyAttachedError extends DomainError {
  constructor(message = "User sub already attached") {
    super(message);
  }
}