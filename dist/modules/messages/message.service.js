"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const message_model_1 = require("./message.model");
const ApiError_1 = __importDefault(require("../../shared/errors/ApiError"));
const sendMessage = async (payload) => {
    if (!payload.isGroupMessage && !payload.receiver) {
        throw new ApiError_1.default(400, 'Receiver is required for 1-to-1 message');
    }
    if (payload.isGroupMessage && !payload.groupName) {
        throw new ApiError_1.default(400, 'Group name is required for group message');
    }
    const result = await message_model_1.Message.create(payload);
    return result;
};
const getMessages = async (userId, targetId, isGroup = false) => {
    let query = {};
    if (isGroup) {
        query = { isGroupMessage: true, groupName: targetId };
    }
    else {
        query = {
            isGroupMessage: false,
            $or: [
                { sender: userId, receiver: targetId },
                { sender: targetId, receiver: userId },
            ],
        };
    }
    const messages = await message_model_1.Message.find(query).sort({ createdAt: 1 }).populate('sender', 'name email profileImage');
    return messages;
};
exports.MessageService = {
    sendMessage,
    getMessages,
};
