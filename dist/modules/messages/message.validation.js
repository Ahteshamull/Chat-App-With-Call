"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageValidation = void 0;
const zod_1 = require("zod");
const sendMessageZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        receiver: zod_1.z.string().optional(),
        content: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().optional(),
        videoUrl: zod_1.z.string().optional(),
        audioUrl: zod_1.z.string().optional(),
        isGroupMessage: zod_1.z.boolean().optional(),
        groupName: zod_1.z.string().optional(),
    }).refine((data) => data.content || data.imageUrl || data.videoUrl || data.audioUrl, {
        message: 'Message must contain either text, an image, a video, or an audio recording',
    }),
});
exports.MessageValidation = {
    sendMessageZodSchema,
};
