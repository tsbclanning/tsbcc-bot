import mongoose, { Schema, type Document } from 'mongoose';
import { Region, ClanStatus } from '../../types/index.js';

export interface IClanRegion {
  region: string;
  rank: number;
  warManager: string | null;
  regionLead: string | null;
}

export interface IClan extends Document {
  clanId: string;
  name: string;
  ownerId: string;
  serverId: string;
  inviteLinks: string[];
  mainerCode: string;
  status: string;
  regions: IClanRegion[];
  createdAt: Date;
  updatedAt: Date;
}

const ClanRegionSchema = new Schema<IClanRegion>({
  region: { type: String, enum: Object.values(Region), required: true },
  rank: { type: Number, required: true },
  warManager: { type: String, default: null },
  regionLead: { type: String, default: null },
});

const ClanSchema = new Schema<IClan>(
  {
    clanId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    ownerId: { type: String, required: true },
    serverId: { type: String, required: true },
    inviteLinks: [{ type: String, default: [] }],
    mainerCode: { type: String, required: true },
    status: { type: String, enum: Object.values(ClanStatus), default: ClanStatus.ACTIVE },
    regions: [ClanRegionSchema],
  },
  { timestamps: true },
);

export const Clan = mongoose.model<IClan>('Clan', ClanSchema);
