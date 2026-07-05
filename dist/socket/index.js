"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
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
