import mongoose, { Schema, Document, Model } from 'mongoose';
import { Role, UserShiftStatus } from '@/lib/types';

export interface IUserDocument extends Document {
  id: string;
  agentId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  shiftGroup: string;
  avatarUrl?: string;
  isActive: boolean;
  currentShiftStatus: UserShiftStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    agentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { 
      type: String, 
      enum: ['AGENT', 'TEAM_LEADER', 'ADMIN', 'SUPER_ADMIN'], 
      required: true,
      default: 'AGENT' 
    },
    department: { type: String, required: true },
    shiftGroup: { type: String, required: true, default: 'CO_1' },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
    currentShiftStatus: { 
      type: String, 
      enum: ['ON_SHIFT', 'ON_BREAK', 'OFF_SHIFT', 'EXCUSED'], 
      default: 'OFF_SHIFT' 
    },
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

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
