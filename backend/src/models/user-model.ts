import mongoose, { Schema, Document } from "mongoose";

interface Chat {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  chats: Chat[];
}

const ChatSchema = new Schema<Chat>({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  chats: [ChatSchema],
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
