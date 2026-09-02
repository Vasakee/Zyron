import { Socket } from 'socket.io';

export interface BaseSocketData extends Socket {
  userId?: string;
  sessionId?: string;
  lastActivity?: Date;
  isAuthenticated?: boolean;
  metadata?: Record<string, any>;
}

export interface WebSocketResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  requestId?: string;
}

export interface WebSocketError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export interface AuthenticationData {
  token: string;
  userId?: string;
  refreshToken?: string;
}

export interface RoomData {
  roomId: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface WebSocketEventPayload<T = any> {
  event: string;
  data: T;
  userId?: string;
  timestamp: Date;
  requestId?: string;
}

export interface WebSocketGatewayOptions {
  namespace?: string;
  maxConnections?: number;
  authentication?: {
    required: boolean;
    timeout: number;
  };
}
