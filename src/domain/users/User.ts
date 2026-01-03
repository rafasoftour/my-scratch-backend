import { InvalidDisplayNameError, UserSubAlreadyAttachedError } from "./errors.js";
import { UserId } from "./UserId.js";
import { UserSub } from "./UserSub.js";

export type UserProps = {
  id: UserId;
  sub?: UserSub;
  displayName: string;
  isActive?: boolean;
};

export class User {
  private readonly _id: UserId;
  private _sub?: UserSub;
  private _displayName: string;
  private _isActive: boolean;

  private constructor(props: {
    id: UserId;
    sub?: UserSub;
    displayName: string;
    isActive: boolean;
  }) {
    this._id = props.id;
    this._sub = props.sub;
    this._displayName = props.displayName;
    this._isActive = props.isActive;
  }

  static create(props: UserProps): User {
    const normalizedName = props.displayName.trim();
    if (normalizedName.length === 0) {
      throw new InvalidDisplayNameError();
    }

    return new User({
      id: props.id,
      sub: props.sub,
      displayName: normalizedName,
      isActive: props.isActive ?? true
    });
  }

  get id(): UserId {
    return this._id;
  }

  get sub(): UserSub | undefined {
    return this._sub;
  }

  get displayName(): string {
    return this._displayName;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  changeDisplayName(newName: string): void {
    const normalizedName = newName.trim();
    if (normalizedName.length === 0) {
      throw new InvalidDisplayNameError();
    }
    this._displayName = normalizedName;
  }

  attachSub(sub: UserSub): void {
    if (this._sub) {
      throw new UserSubAlreadyAttachedError();
    }
    this._sub = sub;
  }
}