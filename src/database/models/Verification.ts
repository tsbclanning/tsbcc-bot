import mongoose, { Schema, type Document } from 'mongoose';

export interface IVerification extends Document {
  verificationId: string;
  clanName: string;
  ownerId: string;
  serverId: string;
  region: string;
  code: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    verificationId: { type: String, required: true, unique: true },
    clanName: { type: String, required: true },
    ownerId: { type: String, required: true },
    serverId: { type: String, default: null },
    region: { type: String, required: true },
    code: { type: String, required: true },
    status: { type: String, default: 'PENDING' },
    memberCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Verification = mongoose.model<IVerification>('Verification', VerificationSchema);
