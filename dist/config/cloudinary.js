"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryUpload = void 0;
const cloudinary_1 = require("cloudinary");
const index_1 = __importDefault(require("./index"));
cloudinary_1.v2.config({
    cloud_name: index_1.default.cloudinary.cloud_name,
    api_key: index_1.default.cloudinary.api_key,
    api_secret: index_1.default.cloudinary.api_secret,
});
const cloudinaryUpload = async (filePath, folderName) => {
    try {
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder: folderName,
        });
        return result;
    }
    catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};
exports.cloudinaryUpload = cloudinaryUpload;
exports.default = cloudinary_1.v2;
