import { Schema, model } from 'mongoose';
import { IMessage } from './message.interface';

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    imageUrl: { type: String },
    videoUrl: { type: String },
    audioUrl: { type: String },
    seen: { type: Boolean, default: false },
    isGroupMessage: { type: Boolean, default: false },
    groupName: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Message = model<IMessage>('Message', messageSchema);
