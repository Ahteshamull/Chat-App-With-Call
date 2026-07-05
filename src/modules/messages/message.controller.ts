import { Request, Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { MessageService } from './message.service';
import ApiError from '../../shared/errors/ApiError';
import { Types } from 'mongoose';
import { getIo } from '../../socket';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const senderId = req.user?.userId;
  if (!senderId) throw new ApiError(401, 'Unauthorized');

  const payload = {
    ...req.body,
    sender: new Types.ObjectId(senderId),
  };

  const result = await MessageService.sendMessage(payload);

  // Broadcast real-time message via socket.io
  const io = getIo();
  if (payload.isGroupMessage && payload.groupName) {
    io.to(payload.groupName).emit('receive_message', result);
  } else if (payload.receiver) {
    io.to(payload.receiver.toString()).emit('receive_message', result);
  }

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  const targetId = req.params.targetId as string;
  const isGroup = req.query.isGroup === 'true';

  const result = await MessageService.getMessages(userId, targetId, isGroup);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Messages retrieved successfully',
    data: result,
  });
});

export const MessageController = {
  sendMessage,
  getMessages,
};
