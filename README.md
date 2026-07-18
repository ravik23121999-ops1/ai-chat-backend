# AI Chat Backend

A Node.js/Express backend API for the AI chat application, featuring real-time messaging with Socket.IO, Google OAuth authentication, and AI-powered features.

## Features

- Google OAuth authentication
- Real-time messaging with Socket.IO
- AI-powered reply suggestions using Google Gemini
- Chat summarization
- Razorpay payment processing
- Premium user management
- CORS support for frontend integration

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Google Cloud Console account
- Razorpay account
- Google Gemini API key

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
FRONTEND_URL=https://your-frontend-url.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Required Environment Variables

- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Your frontend URL for CORS
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `RAZORPAY_KEY_ID`: Razorpay Key ID
- `RAZORPAY_KEY_SECRET`: Razorpay Key Secret

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

5. For development with auto-reload:
```bash
npm run dev:watch
```

## API Endpoints

### Authentication

- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Chat

- `POST /api/chat/suggest-reply` - Get AI reply suggestion
- `POST /api/chat/summarize` - Summarize chat
- `GET /api/chat/users` - Get connected users

### Payment

- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/key-id` - Get Razorpay key ID
- `GET /api/payment/premium-status/:userId` - Check premium status

### Health

- `GET /health` - Health check endpoint

## Deployment

### Render Deployment

1. Push your code to GitHub
2. Create a new web service in Render
3. Connect your GitHub repository
4. Add environment variables in Render dashboard
5. Deploy

The `render.yaml` file is configured for automatic deployment.

### Environment Variables Setup

For local development, create a `.env` file. For production, set these variables in your deployment platform's environment settings.

## Project Structure

```
src/
├── controllers/       # API route handlers
│   ├── AuthController.ts
│   ├── ChatController.ts
│   └── PaymentController.ts
├── services/         # Business logic
│   ├── GeminiService.ts
│   ├── RazorpayService.ts
│   └── SocketService.ts
└── index.ts         # Application entry point
```

## Technologies Used

- Node.js
- Express
- TypeScript
- Socket.IO
- Google Auth Library
- Google Generative AI
- Razorpay
- CORS

## Learn More

- [Express Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Google Auth Library](https://googleapis.dev/nodejs/google-auth-library/latest/)
- [Razorpay Documentation](https://razorpay.com/docs/)