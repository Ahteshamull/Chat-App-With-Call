import { Types, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver?: Types.ObjectId; // Optional for group messages
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  seen?: boolean;
  isGroupMessage: boolean;
  groupName?: string; // Optional for 1-to-1
  createdAt?: Date;
  updatedAt?: Date;
}
