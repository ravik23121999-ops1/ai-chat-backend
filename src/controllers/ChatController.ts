import express, { Request, Response, Router } from 'express';
import { SocketService } from '../services/SocketService';
import { GeminiService } from '../services/GeminiService';

export class ChatController {
  private router: Router;
  private socketService: SocketService;
  private geminiService: GeminiService;

  constructor(socketService: SocketService, geminiService: GeminiService) {
    this.router = express.Router();
    this.socketService = socketService;
    this.geminiService = geminiService;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/suggest-reply', this.suggestReply.bind(this));
    this.router.post('/summarize', this.summarizeChat.bind(this));
    this.router.get('/users', this.getConnectedUsers.bind(this));
  }

  private async suggestReply(req: Request, res: Response): Promise<void> {
    try {
      const { message, chatHistory } = req.body;

      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const history = chatHistory || [];
      const suggestion = await this.geminiService.suggestReply(message, history);

      res.json({
        success: true,
        suggestion
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to generate reply suggestion',
        details: error?.message
      });
    }
  }

  private async summarizeChat(req: Request, res: Response): Promise<void> {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: 'Messages array is required' });
        return;
      }

      const summary = await this.geminiService.summarizeChat(messages);

      res.json({
        success: true,
        summary
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to generate chat summary',
        details: error?.message
      });
    }
  }

  private async getConnectedUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = this.socketService.getConnectedUsers();
      res.json({
        success: true,
        users
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get connected users' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
