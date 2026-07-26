import mongoose, { Schema, type Document } from 'mongoose';
import { TicketStatus, TicketType } from '../../types/index.js';

export interface ITicket extends Document {
  ticketId: string;
  channelId: string;
  type: string;
  status: string;
  challengerClanId?: string;
  defenderClanId?: string;
  region?: string;
  challengerRank?: number;
  defenderRank?: number;
  assigneeId?: string;
  clanId?: string;
  targetRegion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    type: { type: String, enum: Object.values(TicketType), required: true },
    status: { type: String, enum: Object.values(TicketStatus), default: TicketStatus.OPEN },
    challengerClanId: { type: String, default: null },
    defenderClanId: { type: String, default: null },
    region: { type: String, default: null },
    challengerRank: { type: Number, default: null },
    defenderRank: { type: Number, default: null },
    assigneeId: { type: String, default: null },
    clanId: { type: String, default: null },
    targetRegion: { type: String, default: null },
  },
  { timestamps: true },
);

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
