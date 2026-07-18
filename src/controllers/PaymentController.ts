import express, { Request, Response, Router } from 'express';
import { RazorpayService } from '../services/RazorpayService';
import { SocketService } from '../services/SocketService';

export class PaymentController {
  private router: Router;
  private razorpayService: RazorpayService;
  private socketService: SocketService;
  // Demo-only store: premium status resets when the server restarts
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
        res.status(400).json({ success: false, error: 'A payment amount is required.' });
        return;
      }

      const order = await this.razorpayService.createOrder(amount, currency);

      res.json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Create payment order failed:', error);
      res.status(500).json({ success: false, error: 'Could not start the payment. Please try again.' });
    }
  }

  private async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, paymentId, signature, userId } = req.body;

      if (!orderId || !paymentId || !signature || !userId) {
        res.status(400).json({
          success: false,
          error: 'Payment details are incomplete. Please try again.'
        });
        return;
      }

      const isValid = this.razorpayService.verifyPayment(orderId, paymentId, signature);

      if (isValid) {
        this.premiumUsers.add(userId);
        this.socketService.broadcastPaymentSuccess(userId);

        res.json({
          success: true,
          message: 'Payment successful. Premium is now unlocked.',
          isPremium: true
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'We could not confirm this payment. Please try again or contact support.'
        });
      }
    } catch (error) {
      console.error('Verify payment failed:', error);
      res.status(500).json({ success: false, error: 'Could not verify your payment. Please try again.' });
    }
  }

  private async getKeyId(_req: Request, res: Response): Promise<void> {
    try {
      const keyId = this.razorpayService.getKeyId();
      res.json({
        success: true,
        keyId
      });
    } catch (error) {
      console.error('Get payment key failed:', error);
      res.status(500).json({ success: false, error: 'Could not load payment settings.' });
    }
  }

  private async getPremiumStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const isPremium = this.premiumUsers.has(userId);

      res.json({
        success: true,
        isPremium
      });
    } catch (error) {
      console.error('Get premium status failed:', error);
      res.status(500).json({ success: false, error: 'Could not check your premium status.' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
