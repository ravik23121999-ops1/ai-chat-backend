import Razorpay from 'razorpay';
import crypto from 'crypto';

interface RazorpayOrder {
  id: string;
  amount: number | string;
  currency: string;
  receipt?: string;
  status?: string;
}

export class RazorpayService {
  private razorpay: Razorpay;
  private keyId: string;
  private keySecret: string;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }

    this.keyId = keyId;
    this.keySecret = keySecret;
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }

  public async createOrder(amount: number, currency: string = 'INR'): Promise<RazorpayOrder> {
    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100,
        currency,
        receipt: `order_${Date.now()}`,
        payment_capture: true
      });
      return order as RazorpayOrder;
    } catch (error) {
      console.error('Razorpay create order failed:', error);
      throw new Error('Could not create the payment order');
    }
  }

  public verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  }

  public getKeyId(): string {
    return this.keyId;
  }
}
