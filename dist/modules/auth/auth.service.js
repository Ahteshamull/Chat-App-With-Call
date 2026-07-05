"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_model_1 = require("../users/user.model");
const ApiError_1 = __importDefault(require("../../shared/errors/ApiError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const registerUser = async (payload) => {
    const isExist = await user_model_1.User.findOne({ email: payload.email });
    if (isExist) {
        throw new ApiError_1.default(400, 'User already exists');
    }
    const result = await user_model_1.User.create(payload);
    const userWithoutPassword = await user_model_1.User.findById(result._id).select('-password');
    return userWithoutPassword;
};
const loginUser = async (payload) => {
    const { email, password } = payload;
    const user = await user_model_1.User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError_1.default(404, 'User does not exist');
    }
    const isPasswordMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new ApiError_1.default(401, 'Password incorrect');
    }
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), role: user.role }, config_1.default.jwt.secret, { expiresIn: config_1.default.jwt.expires_in });
    const userWithoutPassword = await user_model_1.User.findById(user._id).select('-password');
    return {
        token,
        user: userWithoutPassword,
    };
};
exports.AuthService = {
    registerUser,
    loginUser,
};
