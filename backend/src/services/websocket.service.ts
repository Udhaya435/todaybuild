import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

interface ClientConnection {
  userId: string;
  socket: WebSocket;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public initialize(server: http.Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
      let currentUserId: string | null = null;

      // Parse userId from URL query ?userId=...
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId');

      if (userId) {
        currentUserId = userId;
        if (!this.clients.has(userId)) {
          this.clients.set(userId, new Set());
        }
        this.clients.get(userId)!.add(ws);
        console.log(`[WS] Client connected for user ${userId}`);
      }

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'IDENTIFY' && parsed.userId) {
            currentUserId = parsed.userId;
            if (!this.clients.has(currentUserId!)) {
              this.clients.set(currentUserId!, new Set());
            }
            this.clients.get(currentUserId!)!.add(ws);
            ws.send(JSON.stringify({ type: 'AUTHENTICATED', status: 'ok' }));
          }
        } catch (e) {
          console.error('[WS] Parse message error:', e);
        }
      });

      ws.on('close', () => {
        if (currentUserId && this.clients.has(currentUserId)) {
          this.clients.get(currentUserId)!.delete(ws);
          if (this.clients.get(currentUserId)!.size === 0) {
            this.clients.delete(currentUserId);
          }
          console.log(`[WS] Client disconnected for user ${currentUserId}`);
        }
      });
    });
  }

  /**
   * Broadcast an event to all open connections of a specific user
   */
  public emitToUser(userId: string, event: string, data: any): void {
    const userSockets = this.clients.get(userId);
    if (!userSockets || userSockets.size === 0) {
      return;
    }

    const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    for (const client of userSockets) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  /**
   * Broadcast live progressive transcript chunk as caller speaks
   */
  public emitLiveTranscript(userId: string, voicemailId: string, partialText: string, caller: any, isFinal = false): void {
    this.emitToUser(userId, 'LIVE_TRANSCRIPT_UPDATE', {
      voicemailId,
      partialText,
      caller,
      isFinal,
    });
  }
}
