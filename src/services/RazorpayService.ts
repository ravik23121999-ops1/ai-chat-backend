import Razorpay from 'razorpay';
import crypto from 'crypto';

export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are not set in environment variables');
    }
    
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }

  public async createOrder(amount: number, currency: string = 'INR'): Promise<any> {
    try {
      const options = {
        amount: amount * 100,
        currency,
        receipt: `order_${Date.now()}`,
        payment_capture: 1
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new Error('Failed to create payment order');
    }
  }

  public verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error('Razorpay key secret is not set');
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  }

  public getKeyId(): string {
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      throw new Error('Razorpay key ID is not set');
    }
    return keyId;
  }
}
