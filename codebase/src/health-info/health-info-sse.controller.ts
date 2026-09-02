// src/modules/health-info/health-info-sse.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { HealthInfoSseBus } from './health-info-sse.bus';
import {
  QuestionnaireResponseCacheService,
  ResponseInterface,
} from 'src/database/cache/response';

@Controller('sse/health-info')
export class HealthInfoSseController {
  private readonly HEARTBEAT_MS = 25000;

  constructor(
    private readonly bus: HealthInfoSseBus,
    private readonly cache: QuestionnaireResponseCacheService,
  ) {}

  @Get('stream')
  async stream(
    @Query('kitId') kitId: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    if (!kitId)
      throw new HttpException('kitId is required', HttpStatus.BAD_REQUEST);

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const attached = this.bus.attach(kitId, res, userId);
    if (!attached.ok) {
      res.write(
        `event: error\ndata: ${JSON.stringify({
          success: false,
          error: 'Kit room is full',
          code:
            !attached.ok && 'reason' in attached ? attached.reason : undefined,
        })}\n\n`,
      );
      return res.end();
    }

    // notify this client
    res.write(
      `event: connected\ndata: ${JSON.stringify({
        success: true,
        data: { kitId, connectedUsers: this.bus.size(kitId) },
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    // initial snapshot
    const state = await this.cache.getResponse(kitId);
    res.write(
      `event: kit_state\ndata: ${JSON.stringify({
        success: true,
        data: {
          ...state,
          roomInfo: {
            connectedUsers: this.bus.size(kitId),
            kitId,
          },
        },
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    // tell other clients someone joined
    this.bus.sendOthers(kitId, res, 'user_joined', {
      success: true,
      data: {
        userId: userId || 'unknown',
        kitId,
        connectedUsers: this.bus.size(kitId),
        timestamp: new Date().toISOString(),
      },
    });

    // heartbeat
    const t = setInterval(() => {
      try {
        res.write(
          `event: ping\ndata: ${JSON.stringify({
            serverTime: Date.now(),
          })}\n\n`,
        );
      } catch {
        /* ignore */
      }
    }, this.HEARTBEAT_MS);

    const req: any = (res as any).req;
    const cleanup = () => {
      clearInterval(t);
      this.bus.detach(kitId, res);

      // broadcast leave
      this.bus.send(kitId, 'user_left', {
        success: true,
        data: {
          userId: userId || 'unknown',
          kitId,
          connectedUsers: this.bus.size(kitId),
          timestamp: new Date().toISOString(),
        },
      });
    };
    req.on('close', cleanup);
    req.on('end', cleanup);
    req.on('error', cleanup);
  }

  // ---------- REST actions that replaced socket emits ----------

  @Post('add_question_response')
  async addQuestionResponse(
    @Body()
    body: {
      kitId: string;
      categoryId: number;
      questionResponse: {
        KitId: string;
        questionId: number;
        answers: any[];
      };
      completed?: boolean;
      userId?: string;
    },
  ) {
    const { kitId, categoryId, questionResponse, completed, userId } =
      body || {};
    if (!kitId || categoryId === undefined || !questionResponse)
      throw new HttpException('Invalid body', 400);

    const updated = await this.cache.addQuestionResponse(
      kitId,
      categoryId,
      questionResponse,
      completed,
    );

    this.bus.send(kitId, 'response_updated', {
      success: true,
      data: {
        ...updated,
        action: 'add_question_response',
        userId: userId || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
    return { ok: true };
  }

  @Post('add_bulk_responses')
  async addBulkResponses(
    @Body()
    body: {
      kitId: string;
      responses: ResponseInterface[];
      userId?: string;
    },
  ) {
    const { kitId, responses, userId } = body || {};
    if (!kitId || !Array.isArray(responses))
      throw new HttpException('Invalid body', 400);

    const updated = await this.cache.addBulkResponses(kitId, responses);
    this.bus.send(kitId, 'response_updated', {
      success: true,
      data: {
        ...updated,
        action: 'add_bulk_responses',
        userId: userId || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
    return { ok: true };
  }

  @Post('set_submitted')
  async setSubmitted(
    @Body() body: { kitId: string; submitted: boolean; userId?: string },
  ) {
    const { kitId, submitted, userId } = body || {};
    if (!kitId || typeof submitted !== 'boolean')
      throw new HttpException('Invalid body', 400);

    const updated = await this.cache.setSubmitted(kitId, submitted);
    this.bus.send(kitId, 'response_updated', {
      success: true,
      data: {
        ...updated,
        action: 'set_submitted',
        userId: userId || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
    return { ok: true };
  }

  @Post('set_agreement')
  async setAgreement(
    @Body()
    body: {
      kitId: string;
      acceptedTerms?: boolean;
      acceptedPolicy?: boolean;
      userId?: string;
    },
  ) {
    const { kitId, acceptedTerms, acceptedPolicy, userId } = body || {};
    if (!kitId) throw new HttpException('Invalid body', 400);

    const updated = await this.cache.setAgreement(kitId, {
      kitId,
      acceptedTerms,
      acceptedPolicy,
    });
    this.bus.send(kitId, 'response_updated', {
      success: true,
      data: {
        ...updated,
        action: 'set_agreement',
        userId: userId || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
    return { ok: true };
  }

  @Post('reset_response')
  async resetResponse(@Body() body: { kitId: string; userId?: string }) {
    const { kitId, userId } = body || {};
    if (!kitId) throw new HttpException('kitId required', 400);

    const initial = { submitted: false, responses: [], agreement: [] };
    await this.cache.setCache(kitId, initial);

    this.bus.send(kitId, 'response_updated', {
      success: true,
      data: {
        ...initial,
        action: 'reset_response',
        userId: userId || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
    return { ok: true };
  }

  @Post('get')
  async get(@Body() body: { kitId: string }) {
    if (!body?.kitId) throw new HttpException('kitId required', 400);
    const state = await this.cache.getResponse(body.kitId);
    this.bus.send(body.kitId, 'kit_state', {
      success: true,
      data: state,
      timestamp: new Date().toISOString(),
    });
    return { ok: true };
  }

  @Post('get_room_info')
  async getRoomInfo(@Body() body: { kitId: string }) {
    if (!body?.kitId) throw new HttpException('kitId required', 400);
    this.bus.send(body.kitId, 'room_info', {
      success: true,
      data: {
        kitId: body.kitId,
        connectedUsers: this.bus.size(body.kitId),
      },
      timestamp: new Date().toISOString(),
    });
    return { ok: true };
  }
}
