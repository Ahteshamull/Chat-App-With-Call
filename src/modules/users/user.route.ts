import { Router } from 'express';
import { UserController } from './user.controller';
import auth from '../../shared/middlewares/auth';

const router = Router();

router.get('/profile', auth(), UserController.getProfile);
router.get('/', auth(), UserController.getAllUsers);

export const UserRoutes = router;
