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
        res.status(400).json({ success: false, error: 'Please send a message first.' });
        return;
      }

      const history = chatHistory || [];
      const suggestion = await this.geminiService.suggestReply(message, history);

      res.json({
        success: true,
        suggestion
      });
    } catch (error) {
      console.error('Suggest reply failed:', error);
      res.status(500).json({
        success: false,
        error: 'Could not suggest a reply right now. Please try again.'
      });
    }
  }

  private async summarizeChat(req: Request, res: Response): Promise<void> {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ success: false, error: 'There are no messages to summarize yet.' });
        return;
      }

      const summary = await this.geminiService.summarizeChat(messages);

      res.json({
        success: true,
        summary
      });
    } catch (error) {
      console.error('Summarize chat failed:', error);
      res.status(500).json({
        success: false,
        error: 'Could not summarize the chat right now. Please try again.'
      });
    }
  }

  private async getConnectedUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = this.socketService.getConnectedUsers();
      res.json({
        success: true,
        users
      });
    } catch (error) {
      console.error('Get connected users failed:', error);
      res.status(500).json({ success: false, error: 'Could not load online users.' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
