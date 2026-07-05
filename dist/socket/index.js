"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const message_model_1 = require("../modules/messages/message.model");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
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
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
            socket.data.user = decoded;
            next();
        }
        catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: User ${socket.data.user.userId}`);
        // Automatically join a personal room named after their userId to receive 1-to-1 messages
        socket.join(socket.data.user.userId.toString());
        // Join a specific group room
        socket.on('join_group', (groupName) => {
            socket.join(groupName);
            console.log(`User ${socket.data.user.userId} joined group: ${groupName}`);
        });
        // Typing indicators
        socket.on('typing', ({ receiverId, groupName }) => {
            const senderId = socket.data.user.userId.toString();
            if (groupName) {
                socket.to(groupName).emit('typing', { senderId, groupName });
            }
            else if (receiverId) {
                socket.to(receiverId).emit('typing', { senderId });
            }
        });
        socket.on('stop_typing', ({ receiverId, groupName }) => {
            const senderId = socket.data.user.userId.toString();
            if (groupName) {
                socket.to(groupName).emit('stop_typing', { senderId, groupName });
            }
            else if (receiverId) {
                socket.to(receiverId).emit('stop_typing', { senderId });
            }
        });
        // Mark as seen
        socket.on('mark_seen', async ({ messageId, receiverId, groupName }) => {
            try {
                await message_model_1.Message.findByIdAndUpdate(messageId, { seen: true });
                const senderId = socket.data.user.userId.toString();
                if (groupName) {
                    socket.to(groupName).emit('message_seen', { messageId, senderId, groupName });
                }
                else if (receiverId) {
                    // Send to the person who originally sent the message (the 'receiver' from our perspective)
                    socket.to(receiverId).emit('message_seen', { messageId, senderId });
                }
            }
            catch (err) {
                console.error('Error marking message as seen', err);
            }
        });
        // WebRTC Signaling
        socket.on('call_user', ({ receiverId, isVideoCall }) => {
            const senderId = socket.data.user.userId.toString();
            socket.to(receiverId).emit('incoming_call', { senderId, isVideoCall });
        });
        socket.on('answer_call', ({ receiverId }) => {
            const senderId = socket.data.user.userId.toString();
            socket.to(receiverId).emit('call_answered', { senderId });
        });
        socket.on('call_ringing', ({ receiverId }) => {
            const senderId = socket.data.user.userId.toString();
            socket.to(receiverId).emit('call_ringing', { senderId });
        });
        socket.on('webrtc_offer', ({ receiverId, offer }) => {
            const senderId = socket.data.user.userId.toString();
            socket.to(receiverId).emit('webrtc_offer', { senderId, offer });
        });
        socket.on('webrtc_answer', ({ receiverId, answer }) => {
            const senderId = socket.data.user.userId.toString();
            socket.to(receiverId).emit('webrtc_answer', { senderId, answer });
        });
        socket.on('webrtc_ice_candidate', ({ receiverId, candidate }) => {
            const senderId = socket.data.user.userId.toString();
            socket.to(receiverId).emit('webrtc_ice_candidate', { senderId, candidate });
        });
        socket.on('end_call', ({ receiverId }) => {
            const senderId = socket.data.user.userId.toString();
            socket.to(receiverId).emit('end_call', { senderId });
        });
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: User ${socket.data.user.userId}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIo = getIo;
