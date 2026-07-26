import mongoose, { Schema, type Document } from 'mongoose';

export interface IQuota extends Document {
  userId: string;
  clanId: string;
  region: string;
  warsParticipated: number;
  warsHosted: number;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuotaSchema = new Schema<IQuota>(
  {
    userId: { type: String, required: true },
    clanId: { type: String, required: true },
    region: { type: String, required: true },
    warsParticipated: { type: Number, default: 0 },
    warsHosted: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

QuotaSchema.index({ userId: 1, clanId: 1, region: 1 }, { unique: true });

export const Quota = mongoose.model<IQuota>('Quota', QuotaSchema);
