import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppNotificationDocument extends Document {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  type: string;
  read: boolean;
}

const AppNotificationSchema = new Schema<IAppNotificationDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: false, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, required: true },
    type: { type: String, default: 'INFO' },
    read: { type: Boolean, default: false },
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

export const AppNotificationModel: Model<IAppNotificationDocument> =
  mongoose.models.AppNotification ||
  mongoose.model<IAppNotificationDocument>('AppNotification', AppNotificationSchema);
