import mongoose, { Schema, type Document } from 'mongoose';

export interface IPlayer extends Document {
  userId: string;
  robloxUsername: string;
  robloxId: string;
  robloxAvatarUrl: string;
  verified: boolean;
  blacklisted: boolean;
  blacklistReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    userId: { type: String, required: true, unique: true },
    robloxUsername: { type: String, default: '' },
    robloxId: { type: String, default: '' },
    robloxAvatarUrl: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    blacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String, default: null },
  },
  { timestamps: true },
);

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
