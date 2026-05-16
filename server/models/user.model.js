import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true },
);

const UserModel = mongoose.model("users", UserSchema, "users");
export default UserModel;
