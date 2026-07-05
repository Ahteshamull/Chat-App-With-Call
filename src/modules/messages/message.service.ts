import { Message } from './message.model';
import { IMessage } from './message.interface';
import ApiError from '../../shared/errors/ApiError';

const sendMessage = async (payload: IMessage) => {
  if (!payload.isGroupMessage && !payload.receiver) {
    throw new ApiError(400, 'Receiver is required for 1-to-1 message');
  }
  if (payload.isGroupMessage && !payload.groupName) {
    throw new ApiError(400, 'Group name is required for group message');
  }

  const result = await Message.create(payload);
  return result;
};

const getMessages = async (userId: string, targetId: string, isGroup = false) => {
  let query = {};
  
  if (isGroup) {
    query = { isGroupMessage: true, groupName: targetId };
  } else {
    query = {
      isGroupMessage: false,
      $or: [
        { sender: userId, receiver: targetId },
        { sender: targetId, receiver: userId },
      ],
    };
  }

  const messages = await Message.find(query).sort({ createdAt: 1 }).populate('sender', 'name email profileImage');
  return messages;
};

export const MessageService = {
  sendMessage,
  getMessages,
};
