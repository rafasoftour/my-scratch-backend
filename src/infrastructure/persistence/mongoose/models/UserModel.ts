import mongoose, { Schema } from "mongoose";

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
    sub: { type: String, required: false },
    isActive: { type: Boolean, required: true }
  },
  { collection: "users" }
);

userSchema.index({ sub: 1 }, { unique: true, sparse: true });

export const UserModel =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
