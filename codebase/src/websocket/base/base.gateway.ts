import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { BaseSocketData, AuthenticationData, WebSocketGatewayOptions } from '../types/websocket.types';
import { WebSocketUtils } from '../utils/websocket.utils';
import { WEBSOCKET_EVENTS, WEBSOCKET_ERRORS } from '../websocket.config';

export abstract class BaseGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
{
  @WebSocketServer()
  server: Server;

  protected readonly logger: Logger;
  protected readonly options: WebSocketGatewayOptions;
  
  protected activeConnections: Map<string, BaseSocketData> = new Map();
  protected roomConnections: Map<string, Set<string>> = new Map();

  constructor(
    protected readonly gatewayName: string,
    options: Partial<WebSocketGatewayOptions> = {}
  ) {
    this.logger = new Logger(gatewayName);
    this.options = {
      maxConnections: 1000,
      authentication: {
        required: false,
        timeout: 30000,
      },
      ...options,
    };
  }

  afterInit(server: Server) {
    this.logger.log(`${this.gatewayName} WebSocket Gateway initialized`);
    this.onGatewayInit(server);
  }

  handleConnection(client: BaseSocketData) {
    if (this.activeConnections.size >= this.options.maxConnections) {
      WebSocketUtils.emitError(client, WEBSOCKET_ERRORS.ROOM_FULL);
      client.disconnect();
      return;
    }

    WebSocketUtils.logConnection(client, 'connect');
    WebSocketUtils.updateClientActivity(client);
    
    client.isAuthenticated = !this.options.authentication?.required;
    client.sessionId = WebSocketUtils.generateId();
    
    this.activeConnections.set(client.id, client);

    client.emit(WEBSOCKET_EVENTS.CONNECTED, WebSocketUtils.createSuccessResponse(
      { 
        socketId: client.id,
        sessionId: client.sessionId,
        authRequired: this.options.authentication?.required || false,
      },
      'Connected to WebSocket server'
    ));

    if (this.options.authentication?.required) {
      this.handleAuthenticationRequired(client);
    }

    this.onClientConnect(client);
  }

  handleDisconnect(client: BaseSocketData) {
    WebSocketUtils.logConnection(client, 'disconnect');
    
    this.activeConnections.delete(client.id);
    this.cleanupClientFromRooms(client);
    
    this.onClientDisconnect(client);
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: BaseSocketData,
    @MessageBody() data: AuthenticationData,
  ) {
    try {
      WebSocketUtils.updateClientActivity(client);
      
      const isValid = await this.validateAuthentication(data);
      
      if (isValid) {
        client.isAuthenticated = true;
        client.userId = data.userId;
        
        client.emit(WEBSOCKET_EVENTS.AUTH_SUCCESS, 
          WebSocketUtils.createSuccessResponse(
            { userId: client.userId },
            'Authentication successful'
          )
        );
        
        this.logger.log(`Client authenticated: ${client.id}, User: ${client.userId}`);
        this.onClientAuthenticated(client);
      } else {
        client.emit(WEBSOCKET_EVENTS.AUTH_FAILED, 
          WebSocketUtils.createErrorResponse(WEBSOCKET_ERRORS.INVALID_TOKEN)
        );
        
        setTimeout(() => {
          WebSocketUtils.disconnectClient(client, 'Authentication failed');
        }, 2000);
      }
    } catch (error) {
      WebSocketUtils.logError(error, 'authentication', client.id);
      client.emit(WEBSOCKET_EVENTS.AUTH_FAILED, 
        WebSocketUtils.createErrorResponse(WEBSOCKET_ERRORS.INTERNAL_ERROR)
      );
      
      setTimeout(() => {
        WebSocketUtils.disconnectClient(client, 'Authentication error');
      }, 2000);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: BaseSocketData) {
    WebSocketUtils.updateClientActivity(client);
    client.emit(WEBSOCKET_EVENTS.PONG, {
      timestamp: new Date().toISOString(),
      serverTime: Date.now(),
    });
  }

  protected validateClientAuthentication(client: BaseSocketData): boolean {
    if (this.options.authentication?.required && !WebSocketUtils.validateAuthentication(client)) {
      WebSocketUtils.emitError(client, WEBSOCKET_ERRORS.AUTHENTICATION_REQUIRED);
      return false;
    }
    return true;
  }

  protected joinClientToRoom(client: BaseSocketData, roomName: string): void {
    client.join(roomName);
    
    if (!this.roomConnections.has(roomName)) {
      this.roomConnections.set(roomName, new Set());
    }
    this.roomConnections.get(roomName).add(client.id);
    
    this.logger.log(`Client ${client.id} joined room: ${roomName}`);
  }

  protected leaveClientFromRoom(client: BaseSocketData, roomName: string): void {
    client.leave(roomName);
    
    const roomClients = this.roomConnections.get(roomName);
    if (roomClients) {
      roomClients.delete(client.id);
      if (roomClients.size === 0) {
        this.roomConnections.delete(roomName);
      }
    }
    
    this.logger.log(`Client ${client.id} left room: ${roomName}`);
  }

  protected getRoomSize(roomName: string): number {
    return this.server.sockets.adapter.rooms.get(roomName)?.size || 0;
  }

  protected broadcastToRoom<T>(roomName: string, event: string, data: T): void {
    this.server.to(roomName).emit(event, data);
    this.logger.debug(`Broadcast to room ${roomName}: ${event}`);
  }

  private handleAuthenticationRequired(client: BaseSocketData): void {
    client.emit(WEBSOCKET_EVENTS.AUTH_REQUIRED, 
      WebSocketUtils.createSuccessResponse(
        { timeout: this.options.authentication.timeout },
        'Authentication required'
      )
    );

    setTimeout(() => {
      if (!client.isAuthenticated && client.connected) {
        client.emit('auth_timeout', 
          WebSocketUtils.createErrorResponse('Authentication timeout')
        );
        WebSocketUtils.disconnectClient(client, 'Authentication timeout');
      }
    }, this.options.authentication.timeout);
  }

  private cleanupClientFromRooms(client: BaseSocketData): void {
    this.roomConnections.forEach((clients, roomName) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.roomConnections.delete(roomName);
        }
      }
    });
  }

  protected abstract onGatewayInit(server: Server): void;
  protected abstract onClientConnect(client: BaseSocketData): void;
  protected abstract onClientDisconnect(client: BaseSocketData): void;
  protected abstract validateAuthentication(data: AuthenticationData): Promise<boolean>;
  
  protected onClientAuthenticated(client: BaseSocketData): void {
    // Override in subclass if needed
  }
}