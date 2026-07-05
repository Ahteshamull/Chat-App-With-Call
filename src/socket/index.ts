import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';

import { Message } from '../modules/messages/message.model';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware for Socket
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      const decoded = jwt.verify(token, config.jwt.secret as string) as JwtPayload;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: User ${socket.data.user.userId}`);

    // Automatically join a personal room named after their userId to receive 1-to-1 messages
    socket.join(socket.data.user.userId.toString());

    // Join a specific group room
    socket.on('join_group', (groupName: string) => {
      socket.join(groupName);
      console.log(`User ${socket.data.user.userId} joined group: ${groupName}`);
    });

    // Typing indicators
    socket.on('typing', ({ receiverId, groupName }: { receiverId?: string, groupName?: string }) => {
      const senderId = socket.data.user.userId.toString();
      if (groupName) {
        socket.to(groupName).emit('typing', { senderId, groupName });
      } else if (receiverId) {
        socket.to(receiverId).emit('typing', { senderId });
      }
    });

    socket.on('stop_typing', ({ receiverId, groupName }: { receiverId?: string, groupName?: string }) => {
      const senderId = socket.data.user.userId.toString();
      if (groupName) {
        socket.to(groupName).emit('stop_typing', { senderId, groupName });
      } else if (receiverId) {
        socket.to(receiverId).emit('stop_typing', { senderId });
      }
    });

    // Mark as seen
    socket.on('mark_seen', async ({ messageId, receiverId, groupName }: { messageId: string, receiverId?: string, groupName?: string }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { seen: true });
        
        const senderId = socket.data.user.userId.toString();
        if (groupName) {
          socket.to(groupName).emit('message_seen', { messageId, senderId, groupName });
        } else if (receiverId) {
          // Send to the person who originally sent the message (the 'receiver' from our perspective)
          socket.to(receiverId).emit('message_seen', { messageId, senderId });
        }
      } catch (err) {
        console.error('Error marking message as seen', err);
      }
    });

    // WebRTC Signaling
    socket.on('call_user', ({ receiverId, isVideoCall }: { receiverId: string, isVideoCall: boolean }) => {
      const senderId = socket.data.user.userId.toString();
      socket.to(receiverId).emit('incoming_call', { senderId, isVideoCall });
    });

    socket.on('answer_call', ({ receiverId }: { receiverId: string }) => {
      const senderId = socket.data.user.userId.toString();
      socket.to(receiverId).emit('call_answered', { senderId });
    });

    socket.on('webrtc_offer', ({ receiverId, offer }: { receiverId: string, offer: any }) => {
      const senderId = socket.data.user.userId.toString();
      socket.to(receiverId).emit('webrtc_offer', { senderId, offer });
    });

    socket.on('webrtc_answer', ({ receiverId, answer }: { receiverId: string, answer: any }) => {
      const senderId = socket.data.user.userId.toString();
      socket.to(receiverId).emit('webrtc_answer', { senderId, answer });
    });

    socket.on('webrtc_ice_candidate', ({ receiverId, candidate }: { receiverId: string, candidate: any }) => {
      const senderId = socket.data.user.userId.toString();
      socket.to(receiverId).emit('webrtc_ice_candidate', { senderId, candidate });
    });

    socket.on('end_call', ({ receiverId }: { receiverId: string }) => {
      const senderId = socket.data.user.userId.toString();
      socket.to(receiverId).emit('end_call', { senderId });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: User ${socket.data.user.userId}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
