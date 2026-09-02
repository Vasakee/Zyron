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
  QuestionnaireResponseCacheService,
  ResponseInterface,
} from 'src/database/cache/response';
import { addQuestionResponseDto } from './dto/question-resonse.dto';
import { setSubmittedDto } from './dto/set-submitted.dto';
import { SetAgreementDto } from './dto/set-agreement.dto';
import { origins } from 'src/config';

interface HealthInfoSocketData extends Socket {
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
  namespace: '/health-info',
  transports: ['websocket', 'polling'],
})
@UseFilters(new WsExceptionFilter())
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class HealthInfoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Namespace;

  private readonly logger = new Logger(HealthInfoGateway.name);
  private readonly MAX_CONNECTIONS_PER_KIT = 10;
  private roomConnections: Map<string, Set<string>> = new Map();

  constructor(
    private readonly questionnaireResponseCacheService: QuestionnaireResponseCacheService,
  ) {}

  afterInit(server: Namespace) {
    this.logger.log('HealthInfo WebSocket Gateway initialized');
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

  handleConnection(client: HealthInfoSocketData) {
    try {
      client.lastActivity = new Date();
      this.logger.log(`Client connected: ${client.id}`);
      client.emit('connected', {
        success: true,
        data: { socketId: client.id },
        message: 'Connected to HealthInfo WebSocket',
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

  handleDisconnect(client: HealthInfoSocketData) {
    try {
      this.logger.log(`Client disconnected: ${client.id}`);
      if (client.kitId) {
        const roomName = `kit_${client.kitId}`;
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
    @ConnectedSocket() client: HealthInfoSocketData,
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

      const roomName = `kit_${data.kitId}`;
      const roomSize = this.getRoomSize(roomName);

      if (roomSize >= this.MAX_CONNECTIONS_PER_KIT) {
        client.emit('error', {
          success: false,
          error: 'Kit room is full',
          code: 'ROOM_FULL',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (client.kitId) {
        const oldRoomName = `kit_${client.kitId}`;
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

      const currentState =
        await this.questionnaireResponseCacheService.getResponse(data.kitId);

      const newRoomSize = this.getRoomSize(roomName);

      client.emit('kit_state', {
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
        `Client ${client.id} joined kit room: ${data.kitId} (${newRoomSize} users)`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to join kit room: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to join kit room',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('add_question_response')
  async handleAddQuestionResponse(
    @ConnectedSocket() client: HealthInfoSocketData,
    @MessageBody() data: addQuestionResponseDto,
  ) {
    try {
      client.lastActivity = new Date();
      const { kitId, categoryId, questionResponse, completed } = data;
      const updatedState =
        await this.questionnaireResponseCacheService.addQuestionResponse(
          kitId,
          categoryId,
          questionResponse,
          completed,
        );
      const roomName = `kit_${kitId}`;
      this.server.to(roomName).emit('response_updated', {
        success: true,
        data: {
          ...updatedState,
          action: 'add_question_response',
          userId: client.userId,
          timestamp: new Date().toISOString(),
        },
      });
      this.logger.log(
        `Question response added for kit: ${kitId} by user: ${client.userId}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to add question response: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to add question response',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('set_submitted')
  async handleSetSubmitted(
    @ConnectedSocket() client: HealthInfoSocketData,
    @MessageBody() data: setSubmittedDto,
  ) {
    try {
      client.lastActivity = new Date();
      const { kitId, submitted } = data;
      const updatedState =
        await this.questionnaireResponseCacheService.setSubmitted(
          kitId,
          submitted,
        );
      const roomName = `kit_${kitId}`;
      this.server.to(roomName).emit('response_updated', {
        success: true,
        data: {
          ...updatedState,
          action: 'set_submitted',
          userId: client.userId,
          timestamp: new Date().toISOString(),
        },
      });
      this.logger.log(
        `Submitted status set to ${submitted} for kit: ${kitId} by user: ${client.userId}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to set submitted status: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to set submitted status',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('set_agreement')
  async handleSetAgreement(
    @ConnectedSocket() client: HealthInfoSocketData,
    @MessageBody() data: SetAgreementDto,
  ) {
    try {
      client.lastActivity = new Date();
      const { kitId, acceptedTerms, acceptedPolicy } = data;
      const updatedState =
        await this.questionnaireResponseCacheService.setAgreement(kitId, {
          kitId,
          acceptedTerms,
          acceptedPolicy,
        });
      const roomName = `kit_${kitId}`;
      this.server.to(roomName).emit('response_updated', {
        success: true,
        data: {
          ...updatedState,
          action: 'set_agreement',
          userId: client.userId,
          timestamp: new Date().toISOString(),
        },
      });
      this.logger.log(
        `Agreement updated for kit: ${kitId} by user: ${client.userId}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to set agreement: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to set agreement',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('get_response')
  async handleGetResponse(
    @ConnectedSocket() client: HealthInfoSocketData,
    @MessageBody() data: { kitId: string },
  ) {
    try {
      client.lastActivity = new Date();
      const response = await this.questionnaireResponseCacheService.getResponse(
        data.kitId,
      );
     
      client.emit('kit_state', {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`Response fetched for kit: ${data.kitId}`);
    } catch (error: any) {
      this.logger.error(`Failed to get response: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to get response',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('add_bulk_responses')
  async handleAddBulkResponses(
    @ConnectedSocket() client: HealthInfoSocketData,
    @MessageBody()
    data: { kitId: string; responses: ResponseInterface[] },
  ) {
    try {
      client.lastActivity = new Date();
      const { kitId, responses } = data;
      const updatedState =
        await this.questionnaireResponseCacheService.addBulkResponses(
          kitId,
          responses,
        );
      const roomName = `kit_${kitId}`;
      this.server.to(roomName).emit('response_updated', {
        success: true,
        data: {
          ...updatedState,
          action: 'add_bulk_responses',
          userId: client.userId,
          timestamp: new Date().toISOString(),
        },
      });
      this.logger.log(
        `Bulk responses added for kit: ${kitId} by user: ${client.userId}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to add bulk responses: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to add bulk responses',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('reset_response')
  async handleResetResponse(
    @ConnectedSocket() client: HealthInfoSocketData,
    @MessageBody() data: { kitId: string },
  ) {
    try {
      client.lastActivity = new Date();
      const initialState = {
        submitted: false,
        responses: [],
        agreement: [],
      };
      await this.questionnaireResponseCacheService.setCache(
        data.kitId,
        initialState,
      );
      const roomName = `kit_${data.kitId}`;
      this.server.to(roomName).emit('response_updated', {
        success: true,
        data: {
          ...initialState,
          action: 'reset_response',
          userId: client.userId,
          timestamp: new Date().toISOString(),
        },
      });
      this.logger.log(
        `Response reset for kit: ${data.kitId} by user: ${client.userId}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to reset response: ${error.message}`);
      client.emit('error', {
        success: false,
        error: 'Failed to reset response',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('get_room_info')
  async handleGetRoomInfo(
    @ConnectedSocket() client: HealthInfoSocketData,
    @MessageBody() data: { kitId: string },
  ) {
    try {
      client.lastActivity = new Date();
      const roomName = `kit_${data.kitId}`;
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
  handlePing(@ConnectedSocket() client: HealthInfoSocketData) {
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
}
