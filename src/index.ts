import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AuthController } from './controllers/AuthController';
import { ChatController } from './controllers/ChatController';
import { PaymentController } from './controllers/PaymentController';
import { SocketService } from './services/SocketService';
import { GeminiService } from './services/GeminiService';
import { RazorpayService } from './services/RazorpayService';

dotenv.config();

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaults = [
    'http://localhost:3000',
    'https://ai-chatt-nine.vercel.app'
  ];

  return [...new Set([...fromEnv, ...defaults])];
}

class App {
  private app: express.Application;
  private httpServer: HttpServer;
  private io: SocketIOServer;
  private port: number;
  private allowedOrigins: string[];

  private socketService!: SocketService;
  private geminiService!: GeminiService;
  private razorpayService!: RazorpayService;

  private authController!: AuthController;
  private chatController!: ChatController;
  private paymentController!: PaymentController;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000', 10);
    this.allowedOrigins = getAllowedOrigins();

    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: this.allowedOrigins,
        methods: ['GET', 'POST']
      }
    });

    this.initializeServices();
    this.initializeControllers();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocket();
  }

  private initializeServices(): void {
    this.socketService = new SocketService(this.io);
    this.geminiService = new GeminiService();
    this.razorpayService = new RazorpayService();
  }

  private initializeControllers(): void {
    this.authController = new AuthController();
    this.chatController = new ChatController(this.socketService, this.geminiService);
    this.paymentController = new PaymentController(this.razorpayService, this.socketService);
  }

  private setupMiddleware(): void {
    this.app.use(cors({
      origin: (origin, callback) => {
        if (!origin || this.allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true
    }));
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.use('/api/auth', this.authController.getRouter());
    this.app.use('/api/chat', this.chatController.getRouter());
    this.app.use('/api/payment', this.paymentController.getRouter());

    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', message: 'Server is running' });
    });
  }

  private setupSocket(): void {
    this.socketService.initialize();
  }

  public start(): void {
    this.httpServer.listen(this.port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${this.port}`);
      console.log(`Allowed frontend origins: ${this.allowedOrigins.join(', ')}`);
    });
  }
}

const app = new App();
app.start();

export { App };
