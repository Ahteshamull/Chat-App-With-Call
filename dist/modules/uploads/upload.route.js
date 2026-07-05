"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadRoutes = void 0;
const express_1 = require("express");
const upload_controller_1 = require("./upload.controller");
const upload_middleware_1 = require("../../shared/middlewares/upload.middleware");
const auth_1 = __importDefault(require("../../shared/middlewares/auth"));
const router = (0, express_1.Router)();
router.post('/file', (0, auth_1.default)(), upload_middleware_1.upload.single('file'), // expect 'file' as field name
upload_controller_1.UploadController.uploadFile);
// Keep image route for backward compatibility
router.post('/image', (0, auth_1.default)(), upload_middleware_1.upload.single('image'), upload_controller_1.UploadController.uploadFile);
exports.UploadRoutes = router;
