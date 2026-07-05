import { z } from 'zod';

const sendMessageZodSchema = z.object({
  body: z.object({
    receiver: z.string().optional(),
    content: z.string().optional(),
    imageUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    audioUrl: z.string().optional(),
    isGroupMessage: z.boolean().optional(),
    groupName: z.string().optional(),
  }).refine((data) => data.content || data.imageUrl || data.videoUrl || data.audioUrl, {
    message: 'Message must contain either text, an image, a video, or an audio recording',
  }),
});

export const MessageValidation = {
  sendMessageZodSchema,
};
