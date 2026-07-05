"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app/app"));
const config_1 = __importDefault(require("./config"));
const database_1 = __importDefault(require("./config/database"));
const socket_1 = require("./socket");
let server;
async function bootstrap() {
    try {
        await (0, database_1.default)();
        const httpServer = http_1.default.createServer(app_1.default);
        (0, socket_1.initSocket)(httpServer);
        server = httpServer.listen(config_1.default.port, () => {
            console.log(`Server is running on port ${config_1.default.port}`);
        });
    }
    catch (error) {
        console.error('Failed to connect database', error);
    }
    process.on('unhandledRejection', (error) => {
        if (server) {
            server.close(() => {
                console.error('Unhandled Rejection detected, shutting down...');
                process.exit(1);
            });
        }
        else {
            process.exit(1);
        }
    });
}
bootstrap();
process.on('uncaughtException', () => {
    console.error('Uncaught Exception detected, shutting down...');
    process.exit(1);
});
