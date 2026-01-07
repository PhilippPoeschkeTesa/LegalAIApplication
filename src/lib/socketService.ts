import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(): Socket {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    console.log('🔌 Connecting to WebSocket server:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Connection error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      console.log('👋 Disconnecting from WebSocket server');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event: string, data: any): void {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected. Attempting to reconnect...');
      this.connect();
    }
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
