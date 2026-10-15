import mongoose, { Schema, Document, Model } from 'mongoose';
import { ShiftType, ShiftStatus, LocationType, Role } from '@/lib/types';

export interface IShiftDocument extends Document {
  id: string;
  userId: string;
  userName?: string;
  userRole?: Role;
  shiftDate: string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  shiftCode?: string;
  status: ShiftStatus;
  location: LocationType;
  notes?: string;
  allowSwap?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema = new Schema<IShiftDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String },
    userRole: { type: String },
    shiftDate: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['MORNING', 'AFTERNOON', 'NIGHT', 'SPLIT', 'OVERTIME', 'OFF_DAY', 'ON_CALL', 'TRAINING'],
      required: true 
    },
    shiftCode: { type: String, default: '8' },
    status: { 
      type: String, 
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SWAP_PENDING', 'CANCELLED'],
      default: 'SCHEDULED' 
    },
    location: { 
      type: String, 
      enum: ['ON_SITE', 'REMOTE', 'HYBRID'],
      default: 'ON_SITE' 
    },
    notes: { type: String },
    allowSwap: { type: Boolean, default: true },
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

export const ShiftModel: Model<IShiftDocument> =
  mongoose.models.Shift || mongoose.model<IShiftDocument>('Shift', ShiftSchema);
