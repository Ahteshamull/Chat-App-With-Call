"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const globalErrorHandler_1 = __importDefault(require("../shared/middlewares/globalErrorHandler"));
const app = (0, express_1.default)();
// Trust proxy for rate limiting behind reverse proxies (like Vercel, Heroku, etc.)
app.set('trust proxy', 1);
// Security Middlewares
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
}));
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static assets
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
// Application Routes
app.use('/api/v1', routes_1.default);
// Root Endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Backend API!');
});
// Serve test HTML client
app.get('/test-chat', (req, res) => {
    res.sendFile(path_1.default.join(process.cwd(), 'public', 'index.html'));
});
// Global Error Handler
app.use(globalErrorHandler_1.default);
// Not Found Route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API Not Found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: 'API Not Found',
            },
        ],
    });
});
exports.default = app;
