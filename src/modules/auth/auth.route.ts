import { Router } from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../shared/middlewares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerZodSchema),
  AuthController.register
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.login
);

export const AuthRoutes = router;
