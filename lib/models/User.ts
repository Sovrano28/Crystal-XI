import mongoose, { Schema, Model } from 'mongoose';
import { User } from '@/types/user';

interface UserDocument extends User {
  password?: string;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    fplTeamId: {
      type: Number,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;

