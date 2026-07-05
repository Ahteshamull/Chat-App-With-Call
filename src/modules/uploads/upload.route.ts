import { Router } from 'express';
import { UploadController } from './upload.controller';
import { upload } from '../../shared/middlewares/upload.middleware';
import auth from '../../shared/middlewares/auth';

const router = Router();

router.post(
  '/file',
  auth(),
  upload.single('file'), // expect 'file' as field name
  UploadController.uploadFile
);

// Keep image route for backward compatibility
router.post(
  '/image',
  auth(),
  upload.single('image'),
  UploadController.uploadFile
);

export const UploadRoutes = router;
