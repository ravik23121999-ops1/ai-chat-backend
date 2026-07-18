import express, { Request, Response, Router } from 'express';
import { RazorpayService } from '../services/RazorpayService';
import { SocketService } from '../services/SocketService';

export class PaymentController {
  private router: Router;
  private razorpayService: RazorpayService;
  private socketService: SocketService;
  private premiumUsers: Set<string> = new Set();

  constructor(razorpayService: RazorpayService, socketService: SocketService) {
    this.router = express.Router();
    this.razorpayService = razorpayService;
    this.socketService = socketService;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/create-order', this.createOrder.bind(this));
    this.router.post('/verify', this.verifyPayment.bind(this));
    this.router.get('/key-id', this.getKeyId.bind(this));
    this.router.get('/premium-status/:userId', this.getPremiumStatus.bind(this));
  }

  private async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency } = req.body;

      if (!amount) {
        res.status(400).json({ error: 'Amount is required' });
        return;
      }

      const order = await this.razorpayService.createOrder(amount, currency);

      res.json({
        success: true,
        order
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create payment order' });
    }
  }

  private async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, paymentId, signature, userId } = req.body;

      if (!orderId || !paymentId || !signature || !userId) {
        res.status(400).json({ 
          error: 'Order ID, payment ID, signature, and user ID are required' 
        });
        return;
      }

      const isValid = this.razorpayService.verifyPayment(orderId, paymentId, signature);

      if (isValid) {
        this.premiumUsers.add(userId);
        this.socketService.broadcastPaymentSuccess(userId);

        res.json({
          success: true,
          message: 'Payment verified successfully',
          isPremium: true
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid payment signature'
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  }

  private async getKeyId(req: Request, res: Response): Promise<void> {
    try {
      const keyId = this.razorpayService.getKeyId();
      res.json({
        success: true,
        keyId
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get Razorpay key ID' });
    }
  }

  private async getPremiumStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userIdStr = Array.isArray(userId) ? userId[0] : userId;
      const isPremium = this.premiumUsers.has(userIdStr);

      res.json({
        success: true,
        isPremium
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get premium status' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
