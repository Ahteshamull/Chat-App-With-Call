import { Request, Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { cloudinaryUpload } from '../../config/cloudinary';
import ApiError from '../../shared/errors/ApiError';
import streamifier from 'streamifier';
import cloudinary from '../../config/cloudinary';

const uploadFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a file');
  }

  // Upload to cloudinary via stream
  const uploadFromBuffer = (req: Request) => {
    return new Promise((resolve, reject) => {
      // Cloudinary will auto-detect resource type (image, video, raw)
      const cld_upload_stream = cloudinary.uploader.upload_stream(
        { folder: 'chat_app_uploads', resource_type: 'auto' },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      streamifier.createReadStream(req.file!.buffer).pipe(cld_upload_stream);
    });
  };

  const result: any = await uploadFromBuffer(req);

  // Auto-optimize images (f_auto, q_auto)
  if (result && result.secure_url && result.resource_type === 'image') {
    const urlParts = result.secure_url.split('/upload/');
    if (urlParts.length === 2) {
      result.secure_url = `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}`;
    }
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'File uploaded successfully',
    data: result,
  });
});

export const UploadController = {
  uploadFile,
};
