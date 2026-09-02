import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';

import {
  VaariAnalysisCacheService,
  MicrobiomeAnalysisInterface,
} from 'src/database/cache/vaari-analysis';
import { origins } from 'src/config';

interface VaariAnalysisSocketData extends Socket {
  kitId?: string;
  userId?: string;
  lastActivity?: Date;
}

export class WsExceptionFilter {
  catch(exception: any, host: any) {
    const client = host.switchToWs().getClient();
    const error =
      exception instanceof Error ? exception.message : 'Unknown error';

    client.emit('error', {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}

@WebSocketGateway({
  cors: {
    origin: origins,
    credentials: true,
  },
  namespace: '/vaari-analysis',
  transports: ['websocket', 'polling'],
})
@UseFilters(new WsExceptionFilter())
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class VaariAnalysisGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Namespace;

  private readonly logger = new Logger(VaariAnalysisGateway.name);
  private readonly MAX_CONNECTIONS_PER_KIT = 10;

  private roomConnections: Map<string, Set<string>> = new Map();

  constructor(
    private readonly vaariAnalysisCacheService: VaariAnalysisCacheService,
  ) {}

  afterInit(server: Namespace) {
    this.logger.log('VaariAnalysis WebSocket Gateway initialized');

    try {
      const adapterName =
        server?.adapter?.constructor?.name ??
        (server as any)?.server?.of?.('/')?.adapter?.constructor?.name ??
        'unknown';
      this.logger.log(`Adapter: ${adapterName}`);
    } catch (e: any) {
      this.logger.warn(`Could not determine adapter: ${e?.message || e}`);
    }
  }

  handleConnection(client: VaariAnalysisSocketData) {
    try {
      client.lastActivity = new Date();
      this.logger.log(`Client connected: ${client.id}`);

      client.emit('connected', {
        success: true,
        data: { socketId: client.id },
        message: 'Connected to VaariAnalysis WebSocket',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Connection failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleDisconnect(client: VaariAnalysisSocketData) {
    try {
      this.logger.log(`Client disconnected: ${client.id}`);

      if (client.kitId) {
        const roomName = `analysis_kit_${client.kitId}`;
        const roomClients = this.roomConnections.get(roomName);
        if (roomClients) {
          roomClients.delete(client.id);
          if (roomClients.size === 0) {
            this.roomConnections.delete(roomName);
          }
        }

        client.to(roomName).emit('user_left', {
          success: true,
          data: {
            userId: client.userId,
            kitId: client.kitId,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (error: any) {
      this.logger.error(`Disconnect error: ${error.message}`);
    }
  }

  private getRoomSize(roomName: string): number {
    try {
      const size = this.server?.adapter?.rooms?.get(roomName)?.size ?? 0;
      return size;
    } catch (error: any) {
      this.logger.warn(
        `Failed to get room size via adapter, using fallback: ${error.message}`,
      );
      return this.roomConnections.get(roomName)?.size || 0;
    }
  }

  private addToRoomTracking(roomName: string, clientId: string) {
    if (!this.roomConnections.has(roomName)) {
      this.roomConnections.set(roomName, new Set());
    }
    this.roomConnections.get(roomName)!.add(clientId);
  }

  @SubscribeMessage('join_kit')
  async handleJoinKit(
    @ConnectedSocket() client: VaariAnalysisSocketData,
    @MessageBody() data: { kitId: string },
  ) {
    try {
      if (!data?.kitId) {
        client.emit('error', {
          success: false,
          error: 'Kit ID is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const roomName = `analysis_kit_${data.kitId}`;
      const roomSize = this.getRoomSize(roomName);

      if (roomSize >= this.MAX_CONNECTIONS_PER_KIT) {
        client.emit('error', {
          success: false,
          error: 'Analysis kit room is full',
          code: 'ROOM_FULL',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (client.kitId) {
        const oldRoomName = `analysis_kit_${client.kitId}`;
        await client.leave(oldRoomName);

        const oldRoomClients = this.roomConnections.get(oldRoomName);
        if (oldRoomClients) {
          oldRoomClients.delete(client.id);
          if (oldRoomClients.size === 0) {
            this.roomConnections.delete(oldRoomName);
          }
        }
      }

      client.kitId = data.kitId;
      client.lastActivity = new Date();
      await client.join(roomName);

      this.addToRoomTracking(roomName, client.id);

      const currentState = await this.vaariAnalysisCacheService.getAnalysis(
        data.kitId,
      );

      const newRoomSize = this.getRoomSize(roomName);

      client.emit('analysis_state', {
        success: true,
        data: {
          ...currentState,
          roomInfo: {
            connectedUsers: newRoomSize,
            kitId: data.kitId,
          },
        },
        timestamp: new Date().toISOString(),
      });

      client.to(roomName).emit('user_joined', {
        success: true,
        data: {
          userId: client.userId,
          kitId: data.kitId,
          connectedUsers: newRoomSize,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(
        `Client ${client.id} joined analysis kit room: ${data.kitId} (${newRoomSize} users)`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to join analysis kit room: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to join analysis kit room',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('generate_analysis')
  async handleGenerateAnalysis(
    @ConnectedSocket() client: VaariAnalysisSocketData,
    @MessageBody() data: { kitId: string },
  ) {
    try {
      client.lastActivity = new Date();

      const { kitId } = data;

      const updatedState =
        await this.vaariAnalysisCacheService.setGeneratingStatus(kitId, true);

      const roomName = `analysis_kit_${kitId}`;

      this.server.to(roomName).emit('analysis_generation_started', {
        success: true,
        data: {
          ...updatedState,
          action: 'analysis_generation_started',
          userId: client.userId,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(
        `Analysis generation started for kit: ${kitId} by user: ${client.userId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to start analysis generation: ${error.message}`,
      );

      try {
        await this.vaariAnalysisCacheService.setGeneratingStatus(
          data.kitId,
          false,
        );
      } catch (cacheError) {
        this.logger.error(
          `Failed to reset generating status: ${cacheError.message}`,
        );
      }

      client.emit('error', {
        success: false,
        error: 'Failed to start analysis generation',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('get_analysis')
  async handleGetAnalysis(
    @ConnectedSocket() client: VaariAnalysisSocketData,
    @MessageBody() data: { kitId: string },
  ) {
    try {
      client.lastActivity = new Date();

      const analysis = await this.vaariAnalysisCacheService.getAnalysis(
        data.kitId,
      );

      client.emit('analysis_state', {
        success: true,
        data: analysis,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Analysis fetched for kit: ${data.kitId}`);
    } catch (error: any) {
      this.logger.error(`Failed to get analysis: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to get analysis',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('update_analysis')
  async handleUpdateAnalysis(
    @ConnectedSocket() client: VaariAnalysisSocketData,
    @MessageBody()
    data: { kitId: string; analysis: MicrobiomeAnalysisInterface },
  ) {
    try {
      client.lastActivity = new Date();

      const { kitId, analysis } = data;

      const updatedState = await this.vaariAnalysisCacheService.updateAnalysis(
        kitId,
        analysis,
      );

      const roomName = `analysis_kit_${kitId}`;

      this.server.to(roomName).emit('analysis_updated', {
        success: true,
        data: {
          ...updatedState,
          action: 'update_analysis',
          userId: client.userId,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(
        `Analysis updated for kit: ${kitId} by user: ${client.userId}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to update analysis: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to update analysis',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('delete_analysis')
  async handleDeleteAnalysis(
    @ConnectedSocket() client: VaariAnalysisSocketData,
    @MessageBody() data: { kitId: string },
  ) {
    try {
      client.lastActivity = new Date();

      const { kitId } = data;

      const updatedState = await this.vaariAnalysisCacheService.deleteAnalysis(
        kitId,
      );

      const roomName = `analysis_kit_${kitId}`;

      this.server.to(roomName).emit('analysis_updated', {
        success: true,
        data: {
          ...updatedState,
          action: 'delete_analysis',
          userId: client.userId,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(
        `Analysis deleted for kit: ${kitId} by user: ${client.userId}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to delete analysis: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to delete analysis',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('get_room_info')
  async handleGetRoomInfo(
    @ConnectedSocket() client: VaariAnalysisSocketData,
    @MessageBody() data: { kitId: string },
  ) {
    try {
      client.lastActivity = new Date();

      const roomName = `analysis_kit_${data.kitId}`;
      const roomSize = this.getRoomSize(roomName);

      client.emit('room_info', {
        success: true,
        data: {
          kitId: data.kitId,
          connectedUsers: roomSize,
          roomName,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.logger.error(`Failed to get room info: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to get room information',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: VaariAnalysisSocketData) {
    try {
      client.lastActivity = new Date();
      client.emit('pong', {
        timestamp: new Date().toISOString(),
        serverTime: Date.now(),
      });
    } catch (error: any) {
      this.logger.error(`Ping error: ${error.message}`);
    }
  }

  async notifyAnalysisCompleted(
    kitId: string,
    analysis: MicrobiomeAnalysisInterface,
    userId?: string,
  ) {
    try {
      const updatedState = await this.vaariAnalysisCacheService.setAnalysis(
        kitId,
        analysis,
      );

      const roomName = `analysis_kit_${kitId}`;

      this.server.to(roomName).emit('analysis_generation_completed', {
        success: true,
        data: {
          ...updatedState,
          action: 'analysis_generation_completed',
          userId: userId || 'system',
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(`Analysis generation completed for kit: ${kitId}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to notify analysis completion: ${error.message}`,
      );
      await this.notifyAnalysisGenerationFailed(kitId, error.message, userId);
    }
  }

  async notifyAnalysisGenerationFailed(
    kitId: string,
    errorMessage: string,
    userId?: string,
  ) {
    try {
      await this.vaariAnalysisCacheService.setGeneratingStatus(kitId, false);

      const roomName = `analysis_kit_${kitId}`;

      this.server.to(roomName).emit('analysis_generation_failed', {
        success: true,
        data: {
          action: 'analysis_generation_failed',
          userId: userId || 'system',
          error: errorMessage,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.error(
        `Analysis generation failed for kit: ${kitId}: ${errorMessage}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to notify analysis generation failure: ${error.message}`,
      );
    }
  }
}
