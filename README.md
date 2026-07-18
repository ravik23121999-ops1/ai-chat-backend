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

## Related Repositories

- Backend (this repo): https://github.com/ravik23121999-ops1/ai-chat-backend
- Frontend: https://github.com/ravik23121999-ops1/ai-chat-frontend

---

## How to Access the Project (Step by Step)

Follow these steps in order to run and use the API locally.

### Step 1: Install Prerequisites

1. Install **Node.js v18 or higher** from [https://nodejs.org/](https://nodejs.org/)
2. Confirm installation:

```bash
node -v
npm -v
```

3. You will also need accounts for:
   - [Google Cloud Console](https://console.cloud.google.com/) (OAuth)
   - [Google AI Studio](https://aistudio.google.com/) (Gemini API)
   - [Razorpay Dashboard](https://dashboard.razorpay.com/) (payments)

### Step 2: Clone Both Repositories

```bash
git clone https://github.com/ravik23121999-ops1/ai-chat-backend.git
git clone https://github.com/ravik23121999-ops1/ai-chat-frontend.git
```

### Step 3: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Open **APIs & Services → OAuth consent screen** and configure it
4. Open **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth client ID**
6. Application type: **Web application**
7. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
8. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000`
9. Click **Create**
10. Copy the **Client ID** and **Client Secret**

### Step 4: Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **Get API key** / **Create API key**
4. Copy the API key

### Step 5: Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in
3. Open **Settings → API Keys**
4. Generate a key pair (use **Test Mode** for local development)
5. Copy the **Key ID** and **Key Secret**

### Step 6: Set Up This Backend

1. Open a terminal:

```bash
cd ai-chat-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create the env file:

```bash
cp .env.example .env
```

On Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

4. Open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

5. Start the backend:

```bash
npm run dev
```

6. Backend is ready at:

**http://localhost:5000**

Health check: **http://localhost:5000/health**

Keep this terminal open.

### Step 7: Set Up the Frontend

1. Open a **new** terminal:

```bash
cd ai-chat-frontend
```

2. Install and configure:

```bash
npm install
cp .env.example .env.local
```

3. Set `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

4. Start the frontend:

```bash
npm run dev
```

5. Open the app:

**http://localhost:3000**

### Step 8: Open and Use the App

1. Go to **http://localhost:3000**
2. Click **Sign in with Google**
3. Join the chat and send messages in real time
4. (Optional) Upgrade with Razorpay test payment to unlock AI features

---

## Access URLs Summary

| Service   | Local URL                    | Purpose              |
|-----------|------------------------------|----------------------|
| Frontend  | http://localhost:3000        | Open the chat app    |
| Backend   | http://localhost:5000        | API + WebSocket      |
| Health    | http://localhost:5000/health | Backend health check |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model name |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |

## Getting Started (Short)

```bash
npm install
cp .env.example .env
# edit .env with your keys
npm run dev
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

## Scripts

```bash
npm run dev        # run with ts-node
npm run dev:watch  # run with nodemon (auto-reload)
npm run build      # compile TypeScript
npm start          # run compiled dist/
```

## Deployment (Render)

1. Push this repo to GitHub
2. Create a new web service in [Render](https://render.com/)
3. Connect your GitHub repository
4. Build command: `npm install`
5. Start command: `npm start` or `node dist/index.js`
6. Add environment variables in the Render dashboard
7. Set `FRONTEND_URL` to your Vercel frontend URL
8. Deploy

The `render.yaml` file is configured for automatic deployment.

## Troubleshooting

### Backend not starting

- Check `.env` exists and all keys are filled
- Confirm Node.js is v18+
- Check port 5000 is free

### CORS / frontend cannot connect

- Set `FRONTEND_URL=http://localhost:3000` in `.env`
- Restart the backend after changing env

### AI Features Not Working

- Verify `GEMINI_API_KEY` is valid
- Check API quota in Google AI Studio

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

## Learn More

- [Express Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Razorpay Documentation](https://razorpay.com/docs/)
