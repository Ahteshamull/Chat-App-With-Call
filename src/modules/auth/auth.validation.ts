import { z } from 'zod';

const registerZodSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required' }),
    email: z.string({ message: 'Email is required' }).email(),
    password: z.string({ message: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  }),
});

const loginZodSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email(),
    password: z.string({ message: 'Password is required' }),
  }),
});

export const AuthValidation = {
  registerZodSchema,
  loginZodSchema,
};
