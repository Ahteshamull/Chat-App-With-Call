"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const catchAsync_1 = __importDefault(require("../../shared/utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/utils/sendResponse"));
const ApiError_1 = __importDefault(require("../../shared/errors/ApiError"));
const streamifier_1 = __importDefault(require("streamifier"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const uploadImage = (0, catchAsync_1.default)(async (req, res) => {
    if (!req.file) {
        throw new ApiError_1.default(400, 'Please upload an image');
    }
    // Upload to cloudinary via stream
    const uploadFromBuffer = (req) => {
        return new Promise((resolve, reject) => {
            const cld_upload_stream = cloudinary_1.default.uploader.upload_stream({ folder: 'chat_app_uploads' }, (error, result) => {
                if (result) {
                    resolve(result);
                }
                else {
                    reject(error);
                }
            });
            streamifier_1.default.createReadStream(req.file.buffer).pipe(cld_upload_stream);
        });
    };
    const result = await uploadFromBuffer(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Image uploaded successfully',
        data: result,
    });
});
exports.UploadController = {
    uploadImage,
};
