"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const auth = () => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new ApiError_1.default(401, 'You are not authorized');
            }
            const verifiedUser = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
            req.user = verifiedUser;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.default = auth;
