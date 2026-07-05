"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config"));
const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer_1.default.createTransport({
        host: config_1.default.email.host,
        port: Number(config_1.default.email.port),
        auth: {
            user: config_1.default.email.user,
            pass: config_1.default.email.pass,
        },
    });
    await transporter.sendMail({
        from: config_1.default.email.user,
        to,
        subject,
        html,
    });
};
exports.default = sendEmail;
