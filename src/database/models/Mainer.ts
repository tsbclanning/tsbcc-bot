import mongoose, { Schema, type Document } from 'mongoose';
import { Region } from '../../types/index.js';

export interface IMainer extends Document {
  userId: string;
  robloxUsername: string;
  robloxId: string;
  clanId: string;
  region: string;
  warEligibleAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MainerSchema = new Schema<IMainer>(
  {
    userId: { type: String, required: true },
    robloxUsername: { type: String, required: true },
    robloxId: { type: String, required: true },
    clanId: { type: String, required: true },
    region: { type: String, enum: Object.values(Region), required: true },
    warEligibleAt: { type: Date, required: true },
  },
  { timestamps: true },
);

MainerSchema.index({ userId: 1, clanId: 1, region: 1 }, { unique: true });
MainerSchema.index({ clanId: 1, region: 1 });

export const Mainer = mongoose.model<IMainer>('Mainer', MainerSchema);
