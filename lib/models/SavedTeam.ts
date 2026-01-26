import mongoose, { Schema, Model } from 'mongoose';
import { SavedTeam } from '@/types/user';

const SavedTeamSchema = new Schema<SavedTeam>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    formation: {
      type: String,
      required: true,
      default: '3-4-3',
    },
    players: [
      {
        playerId: {
          type: Number,
          required: true,
        },
        position: {
          type: Number,
          required: true,
          min: 1,
          max: 15,
        },
        isCaptain: {
          type: Boolean,
          default: false,
        },
        isViceCaptain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    gameweek: {
      type: Number,
      required: true,
    },
    transfers: [
      {
        playerIn: {
          type: Number,
          required: true,
        },
        playerOut: {
          type: Number,
          required: true,
        },
        gameweek: {
          type: Number,
          required: true,
        },
      },
    ],
    chips: [
      {
        chip: {
          type: String,
          enum: ['wildcard', 'freehit', 'benchboost', 'triplecaptain'],
        },
        gameweek: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

SavedTeamSchema.index({ userId: 1, gameweek: 1 });

const SavedTeamModel: Model<SavedTeam> =
  mongoose.models.SavedTeam || mongoose.model<SavedTeam>('SavedTeam', SavedTeamSchema);

export default SavedTeamModel;

