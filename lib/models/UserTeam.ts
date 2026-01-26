import mongoose, { Schema, Model } from 'mongoose';
import { UserTeam } from '@/types/user';

const UserTeamSchema = new Schema<UserTeam>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    fplTeamId: {
      type: Number,
      required: true,
    },
    teamName: {
      type: String,
    },
    autoSync: {
      type: Boolean,
      default: true,
    },
    preferences: {
      defaultFormation: {
        type: String,
        default: '3-4-3',
      },
      showPrices: {
        type: Boolean,
        default: true,
      },
      showStats: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

UserTeamSchema.index({ userId: 1 });

const UserTeamModel: Model<UserTeam> =
  mongoose.models.UserTeam || mongoose.model<UserTeam>('UserTeam', UserTeamSchema);

export default UserTeamModel;

