"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const catchAsync_1 = __importDefault(require("../../shared/utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/utils/sendResponse"));
const message_service_1 = require("./message.service");
const ApiError_1 = __importDefault(require("../../shared/errors/ApiError"));
const mongoose_1 = require("mongoose");
const socket_1 = require("../../socket");
const sendMessage = (0, catchAsync_1.default)(async (req, res) => {
    const senderId = req.user?.userId;
    if (!senderId)
        throw new ApiError_1.default(401, 'Unauthorized');
    const payload = {
        ...req.body,
        sender: new mongoose_1.Types.ObjectId(senderId),
    };
    const result = await message_service_1.MessageService.sendMessage(payload);
    // Broadcast real-time message via socket.io
    const io = (0, socket_1.getIo)();
    if (payload.isGroupMessage && payload.groupName) {
        io.to(payload.groupName).emit('receive_message', result);
    }
    else if (payload.receiver) {
        io.to(payload.receiver.toString()).emit('receive_message', result);
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Message sent successfully',
        data: result,
    });
});
const getMessages = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        throw new ApiError_1.default(401, 'Unauthorized');
    const targetId = req.params.targetId;
    const isGroup = req.query.isGroup === 'true';
    const result = await message_service_1.MessageService.getMessages(userId, targetId, isGroup);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Messages retrieved successfully',
        data: result,
    });
});
exports.MessageController = {
    sendMessage,
    getMessages,
};
