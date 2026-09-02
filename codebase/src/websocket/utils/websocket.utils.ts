import { Logger } from '@nestjs/common';
import {
  BaseSocketData,
  WebSocketResponse,
  WebSocketError,
} from '../types/websocket.types';

export class WebSocketUtils {
  private static logger = new Logger('WebSocketUtils');

  static createSuccessResponse<T>(
    data?: T,
    message?: string,
    requestId?: string,
  ): WebSocketResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      requestId: requestId || this.generateId(),
    };
  }

  static createErrorResponse(
    error: string | WebSocketError,
    data?: any,
    requestId?: string,
  ): WebSocketResponse {
    const errorObj =
      typeof error === 'string'
        ? { code: 'UNKNOWN_ERROR', message: error }
        : error;

    return {
      success: false,
      error: errorObj.message,
      data: {
        code: errorObj.code,
        details: errorObj.details,
        ...data,
      },
      timestamp: new Date().toISOString(),
      requestId: requestId || this.generateId(),
    };
  }

  static updateClientActivity(client: BaseSocketData): void {
    client.lastActivity = new Date();
  }

  static validateAuthentication(client: BaseSocketData): boolean {
    return client.isAuthenticated === true;
  }

  static generateRoomName(prefix: string, id: string): string {
    return `${prefix}_${id}`;
  }

  static logConnection(
    client: BaseSocketData,
    event: 'connect' | 'disconnect',
  ): void {
    const userInfo = client.userId ? `(User: ${client.userId})` : '';
    this.logger.log(`Client ${event}: ${client.id} ${userInfo}`);
  }

  static logError(error: any, context?: string, clientId?: string): void {
    const contextInfo = context ? ` in ${context}` : '';
    const clientInfo = clientId ? ` [Client: ${clientId}]` : '';
    this.logger.error(
      `WebSocket error${contextInfo}${clientInfo}: ${error.message}`,
      error.stack,
    );
  }

  static emitError(
    client: BaseSocketData,
    error: string | WebSocketError,
    event: string = 'error',
    requestId?: string,
  ): void {
    const response = this.createErrorResponse(error, undefined, requestId);
    client.emit(event, response);

    this.logError(
      typeof error === 'string' ? new Error(error) : error,
      event,
      client.id,
    );
  }

  static disconnectClient(client: BaseSocketData, reason: string): void {
    try {
      client.emit(
        'disconnect_reason',
        this.createErrorResponse({
          code: 'DISCONNECT',
          message: reason,
        }),
      );

      setTimeout(() => {
        if (client.connected) {
          client.disconnect(true);
        }
      }, 1000);

      this.logger.log(`Client ${client.id} disconnected: ${reason}`);
    } catch (error) {
      this.logger.error(
        `Error disconnecting client ${client.id}: ${error.message}`,
      );
    }
  }

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
