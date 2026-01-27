import mongoose, { Schema, Model } from 'mongoose';
import { User } from '@/types/user';

interface UserDocument extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
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

const UserModel: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default UserModel;

