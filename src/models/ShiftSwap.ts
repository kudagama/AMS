import mongoose, { Schema, Document, Model } from 'mongoose';
import { SwapStatus, Shift } from '@/lib/types';

export interface IShiftSwapDocument extends Document {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAgentId?: string;
  requesterGroup?: string;
  requesterShiftCode?: string;
  requesterShiftId: string;
  requesterShift: Shift;
  targetPeerId: string;
  targetPeerName: string;
  targetPeerAgentId?: string;
  targetGroup?: string;
  targetShiftCode?: string;
  targetShiftId: string;
  targetShift: Shift;
  swapReason: string;
  status: SwapStatus;
  peerAcceptedAt?: string;
  tlApproverId?: string;
  tlApproverName?: string;
  tlReviewedAt?: string;
  tlNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const ShiftSwapSchema = new Schema<IShiftSwapDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    requesterId: { type: String, required: true, index: true },
    requesterName: { type: String, required: true },
    requesterAgentId: { type: String },
    requesterGroup: { type: String, default: 'CO_1' },
    requesterShiftCode: { type: String },
    requesterShiftId: { type: String, required: true },
    requesterShift: { type: Schema.Types.Mixed, required: true },
    targetPeerId: { type: String, required: true, index: true },
    targetPeerName: { type: String, required: true },
    targetPeerAgentId: { type: String },
    targetGroup: { type: String, default: 'CO_1' },
    targetShiftCode: { type: String },
    targetShiftId: { type: String, required: true },
    targetShift: { type: Schema.Types.Mixed, required: true },
    swapReason: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['PENDING_PEER', 'PEER_ACCEPTED', 'APPROVED_BY_TL', 'REJECTED', 'CANCELLED'],
      default: 'PENDING_PEER',
      index: true 
    },
    peerAcceptedAt: { type: String },
    tlApproverId: { type: String },
    tlApproverName: { type: String },
    tlReviewedAt: { type: String },
    tlNotes: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ShiftSwapModel: Model<IShiftSwapDocument> =
  mongoose.models.ShiftSwap || mongoose.model<IShiftSwapDocument>('ShiftSwap', ShiftSwapSchema);
