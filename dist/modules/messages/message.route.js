"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRoutes = void 0;
const express_1 = require("express");
const message_controller_1 = require("./message.controller");
const auth_1 = __importDefault(require("../../shared/middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../shared/middlewares/validateRequest"));
const message_validation_1 = require("./message.validation");
const router = (0, express_1.Router)();
router.post('/', (0, auth_1.default)(), (0, validateRequest_1.default)(message_validation_1.MessageValidation.sendMessageZodSchema), message_controller_1.MessageController.sendMessage);
router.get('/:targetId', (0, auth_1.default)(), message_controller_1.MessageController.getMessages);
exports.MessageRoutes = router;
