import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import router from './routes';
import globalErrorHandler from '../shared/middlewares/globalErrorHandler';

const app: Application = express();

// Trust proxy for rate limiting behind reverse proxies (like Vercel, Heroku, etc.)
app.set('trust proxy', 1);

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Application Routes
app.use('/api/v1', router);

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Backend API!');
});

// Serve test HTML client
app.get('/test-chat', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// Global Error Handler
app.use(globalErrorHandler);

// Not Found Route
app.use((req: Request, res: Response) => {
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

export default app;
