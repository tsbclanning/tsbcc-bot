import mongoose, { Schema, type Document } from 'mongoose';
import { WarningType } from '../../types/index.js';

export interface IWarning extends Document {
  clanId: string;
  type: string;
  reason: string;
  issuedBy: string;
  proof?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WarningSchema = new Schema<IWarning>(
  {
    clanId: { type: String, required: true },
    type: { type: String, enum: Object.values(WarningType), required: true },
    reason: { type: String, required: true },
    issuedBy: { type: String, required: true },
    proof: { type: String, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

WarningSchema.index({ clanId: 1, active: 1 });

export const Warning = mongoose.model<IWarning>('Warning', WarningSchema);
