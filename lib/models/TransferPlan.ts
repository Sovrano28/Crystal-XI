import mongoose, { Schema, Model } from 'mongoose';
import { TransferPlan } from '@/types/user';

const TransferPlanSchema = new Schema<TransferPlan>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: 'My Transfer Plan',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    gameweek: {
      type: Number,
      required: true,
    },
    transfers: [
      {
        playerOut: {
          type: Number,
          required: true,
        },
        playerIn: {
          type: Number,
          required: true,
        },
        sellingPrice: {
          type: Number,
          required: true,
        },
        purchasePrice: {
          type: Number,
          required: true,
        },
      },
    ],
    chipUsed: {
      type: String,
      enum: ['wildcard', 'freehit', 'benchboost', 'triplecaptain', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
TransferPlanSchema.index({ userId: 1, gameweek: 1 });
TransferPlanSchema.index({ userId: 1, isActive: 1 });

// Ensure only one active plan per user
TransferPlanSchema.pre('save', async function () {
  if (this.isActive) {
    // Deactivate other plans for this user when activating one
    await mongoose.models.TransferPlan?.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isActive: false }
    );
  }
});

const TransferPlanModel: Model<TransferPlan> =
  mongoose.models.TransferPlan || mongoose.model<TransferPlan>('TransferPlan', TransferPlanSchema);

export default TransferPlanModel;
