import { randomUUID } from 'crypto';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class SocketService {
  private io: SocketIOServer;
  private users: Map<string, string> = new Map(); // socketId -> userId

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  public initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('join-room', (userId: string) => {
        if (!userId) return;

        this.users.set(socket.id, userId);
        socket.join('chat-room');

        socket.to('chat-room').emit('user-joined', {
          userId,
          socketId: socket.id
        });
      });

      socket.on('send-message', (data: { message: string; userId: string; username: string }) => {
        if (!data?.message?.trim() || !data.userId || !data.username) {
          return;
        }

        const messageData = {
          id: randomUUID(),
          message: data.message.trim(),
          userId: data.userId,
          username: data.username,
          timestamp: new Date().toISOString()
        };

        this.io.to('chat-room').emit('receive-message', messageData);
      });

      socket.on('disconnect', () => {
        const userId = this.users.get(socket.id);
        if (userId) {
          this.users.delete(socket.id);
          this.io.to('chat-room').emit('user-left', {
            userId,
            socketId: socket.id
          });
        }
      });
    });
  }

  public broadcastPaymentSuccess(userId: string): void {
    this.io.to('chat-room').emit('payment-success', { userId });
  }

  public getConnectedUsers(): string[] {
    return [...new Set(this.users.values())];
  }
}
