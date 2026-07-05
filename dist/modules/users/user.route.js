"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../shared/middlewares/auth"));
const router = (0, express_1.Router)();
router.get('/profile', (0, auth_1.default)(), user_controller_1.UserController.getProfile);
router.get('/', (0, auth_1.default)(), user_controller_1.UserController.getAllUsers);
exports.UserRoutes = router;
