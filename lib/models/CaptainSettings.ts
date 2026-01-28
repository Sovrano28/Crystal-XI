import mongoose, { Schema, Document } from 'mongoose';

/**
 * CaptainSettings Model
 * 
 * Stores user's captain/vice-captain selections per gameweek.
 * This is a NEW collection - it does NOT modify or delete any existing data.
 * 
 * When a new gameweek starts or user logs in, the system checks:
 * 1. If record exists for this user+gameweek with lastFetchedFromFPL=false -> use DB values
 * 2. Otherwise -> reset to FPL API values and save with lastFetchedFromFPL=true
 * 
 * When user changes captain/VC in planner -> save with lastFetchedFromFPL=false
 */

export interface ICaptainSettings extends Document {
  userId: string;
  gameweek: number;
  captainId: number;
  viceCaptainId: number;
  lastFetchedFromFPL: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CaptainSettingsSchema = new Schema<ICaptainSettings>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    gameweek: {
      type: Number,
      required: true,
      min: 1,
      max: 38,
    },
    captainId: {
      type: Number,
      required: true,
    },
    viceCaptainId: {
      type: Number,
      required: true,
    },
    lastFetchedFromFPL: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
CaptainSettingsSchema.index({ userId: 1, gameweek: 1 }, { unique: true });

// Ensure we don't create duplicate model during hot reload in development
const CaptainSettings = mongoose.models.CaptainSettings || 
  mongoose.model<ICaptainSettings>('CaptainSettings', CaptainSettingsSchema);

export default CaptainSettings;
