import express, { Request, Response, Router } from 'express';
import { OAuth2Client } from 'google-auth-library';

export class AuthController {
  private router: Router;
  private oauth2Client: OAuth2Client;

  constructor() {
    this.router = express.Router();
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables');
    }

    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'postmessage'
    );
    
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/google', this.googleLogin.bind(this));
    this.router.get('/me', this.getCurrentUser.bind(this));
  }

  private async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        res.status(400).json({ error: 'ID token is required' });
        return;
      }

      // Verify the ID token with Google
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        res.status(400).json({ error: 'Invalid token payload' });
        return;
      }

      res.json({
        success: true,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
      });
    } catch (error: any) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }

  private async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({ error: 'No authorization header' });
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        res.status(400).json({ error: 'Invalid token payload' });
        return;
      }

      res.json({
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
      });
    } catch (error: any) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
