"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageValidation = void 0;
const zod_1 = require("zod");
const sendMessageZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        receiver: zod_1.z.string().optional(),
        content: zod_1.z.string({ message: 'Content is required' }),
        isGroupMessage: zod_1.z.boolean().optional(),
        groupName: zod_1.z.string().optional(),
    }),
});
exports.MessageValidation = {
    sendMessageZodSchema,
};
