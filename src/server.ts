import mongoose from 'mongoose';
import http from 'http';
import app from './app/app';
import config from './config';
import connectDB from './config/database';
import { initSocket } from './socket';

let server: any;

async function bootstrap() {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    server = httpServer.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to connect database', error);
  }

  process.on('unhandledRejection', (error) => {
    if (server) {
      server.close(() => {
        console.error('Unhandled Rejection detected, shutting down...');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

bootstrap();

process.on('uncaughtException', () => {
  console.error('Uncaught Exception detected, shutting down...');
  process.exit(1);
});
