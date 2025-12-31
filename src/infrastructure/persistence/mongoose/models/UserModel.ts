import { model, Schema } from "mongoose";

export type UserDocument = {
  _id: string;
  displayName: string;
  sub?: string;
  isActive: boolean;
};

const userSchema = new Schema<UserDocument>(
  {
    _id: { type: String, required: true },
    displayName: { type: String, required: true },
    sub: { type: String, required: false, unique: true, sparse: true },
    isActive: { type: Boolean, required: true }
  },
  { collection: "users" }
);

export const UserModel = model<UserDocument>("User", userSchema);