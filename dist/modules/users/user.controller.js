"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const catchAsync_1 = __importDefault(require("../../shared/utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/utils/sendResponse"));
const user_service_1 = require("./user.service");
const ApiError_1 = __importDefault(require("../../shared/errors/ApiError"));
const getProfile = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        throw new ApiError_1.default(401, 'Unauthorized');
    const result = await user_service_1.UserService.getUserProfile(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Profile retrieved successfully',
        data: result,
    });
});
const getAllUsers = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserService.getAllUsers();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Users retrieved successfully',
        data: result,
    });
});
exports.UserController = {
    getProfile,
    getAllUsers,
};
