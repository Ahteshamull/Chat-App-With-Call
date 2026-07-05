import { Router } from 'express';
import { MessageController } from './message.controller';
import auth from '../../shared/middlewares/auth';
import validateRequest from '../../shared/middlewares/validateRequest';
import { MessageValidation } from './message.validation';

const router = Router();

router.post(
  '/',
  auth(),
  validateRequest(MessageValidation.sendMessageZodSchema),
  MessageController.sendMessage
);

router.get(
  '/:targetId',
  auth(),
  MessageController.getMessages
);

export const MessageRoutes = router;
