import mongoose, { Schema, Document, Model } from 'mongoose';
import { ExcuseCategory, ExcuseStatus } from '@/lib/types';

export interface IExcuseLogDocument extends Document {
  id: string;
  userId: string;
  userName: string;
  agentId: string;
  department: string;
  shiftGroup?: string;
  category: ExcuseCategory;
  subCategory: string;
  reason: string;
  remarks?: string;
  fromTime: string;
  toTime: string;
  durationMinutes: number;
  status: ExcuseStatus;
  ticketNumber?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  tlApproverId?: string;
  tlApproverName?: string;
  tlFeedback?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const ExcuseLogSchema = new Schema<IExcuseLogDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    agentId: { type: String, required: true, index: true },
    department: { type: String, required: true },
    shiftGroup: { type: String, default: 'CO_1' },
    category: { 
      type: String, 
      enum: ['SYSTEM_FAILURE', 'LEARNING_TRAINING', 'MEETINGS', 'MISCELLANEOUS', 'HEALTH_EMERGENCY'],
      required: true,
      index: true 
    },
    subCategory: { type: String, required: true },
    reason: { type: String, required: true },
    remarks: { type: String },
    fromTime: { type: String, required: true },
    toTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_INFO'],
      default: 'PENDING',
      index: true 
    },
    ticketNumber: { type: String },
    attachmentUrl: { type: String },
    attachmentName: { type: String },
    tlApproverId: { type: String },
    tlApproverName: { type: String },
    tlFeedback: { type: String },
    reviewedAt: { type: String },
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

export const ExcuseLogModel: Model<IExcuseLogDocument> =
  mongoose.models.ExcuseLog || mongoose.model<IExcuseLogDocument>('ExcuseLog', ExcuseLogSchema);
