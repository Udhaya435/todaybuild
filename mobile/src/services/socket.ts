type MessageHandler = (data: any) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private reconnectTimer: any = null;
  private userId: string | null = null;

  public connect(userId: string, host = '10.0.2.2:5000'): void {
    this.userId = userId;
    const url = `ws://${host}/ws?userId=${userId}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[Socket] Connected to Live Voicemail stream');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { event: eventName, data } = payload;
          if (eventName && this.listeners.has(eventName)) {
            this.listeners.get(eventName)!.forEach((handler) => handler(data));
          }
        } catch (e) {
          console.error('[Socket] Parse message error:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('[Socket] Connection closed. Attempting reconnect in 3s...');
        this.scheduleReconnect(host);
      };

      this.ws.onerror = (err) => {
        console.error('[Socket] WebSocket error:', err);
      };
    } catch (e) {
      this.scheduleReconnect(host);
    }
  }

  private scheduleReconnect(host: string): void {
    if (this.reconnectTimer || !this.userId) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.userId) {
        this.connect(this.userId, host);
      }
    }, 3000);
  }

  public on(event: string, handler: MessageHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export const socketService = new SocketService();
