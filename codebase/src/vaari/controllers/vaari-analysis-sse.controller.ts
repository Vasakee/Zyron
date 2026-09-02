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
import { Response } from 'express';
import { VaariAnalysisSseBus } from '../buses/vaari-analysis-sse.bus';
import {
  VaariAnalysisCacheService,
  MicrobiomeAnalysisInterface,
} from 'src/database/cache/vaari-analysis';
import { origins } from 'src/config';

@Controller('sse/vaari-analysis')
export class VaariAnalysisSseController {
  private readonly HEARTBEAT_MS = 25000;

  constructor(
    private readonly bus: VaariAnalysisSseBus,
    private readonly cache: VaariAnalysisCacheService,
  ) {}

  @Get('stream')
  async stream(@Query('kitId') kitId: string, @Res() res: Response) {
    if (!kitId)
      throw new HttpException('kitId is required', HttpStatus.BAD_REQUEST);

    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const attached = this.bus.attach(kitId, res) as {
      ok: false;
      reason: string;
    };
    if (!attached.ok) {
      res.write(
        `event: error\ndata: ${JSON.stringify({
          success: false,
          error: 'Client already connected for this kit',
          code: attached.reason,
        })}\n\n`,
      );
      return res.end();
    }

    res.write(
      `event: connected\ndata: ${JSON.stringify({
        success: true,
        data: { kitId },
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    const state = await this.cache.getAnalysis(kitId);
    res.write(
      `event: analysis_state\ndata: ${JSON.stringify({
        success: true,
        data: state,
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

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
    };
    req.on('close', cleanup);
    req.on('end', cleanup);
    req.on('error', cleanup);
  }

  @Post('generate')
  async generate(@Body() body: { kitId: string }) {
    if (!body?.kitId) throw new HttpException('kitId is required', 400);
    const updated = await this.cache.setGeneratingStatus(body.kitId, true);
    this.bus.send(body.kitId, 'analysis_generation_started', {
      success: true,
      data: {
        ...updated,
        action: 'analysis_generation_started',
        timestamp: new Date().toISOString(),
      },
    });
    return { ok: true };
  }

  @Post('get')
  async get(@Body() body: { kitId: string }) {
    if (!body?.kitId) throw new HttpException('kitId is required', 400);
    const analysis = await this.cache.getAnalysis(body.kitId);
    this.bus.send(body.kitId, 'analysis_state', {
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    });
    return { ok: true };
  }

  @Post('update')
  async update(
    @Body() body: { kitId: string; analysis: MicrobiomeAnalysisInterface },
  ) {
    const { kitId, analysis } = body || {};
    if (!kitId || !analysis)
      throw new HttpException('kitId & analysis required', 400);
    const updated = await this.cache.updateAnalysis(kitId, analysis);
    this.bus.send(kitId, 'analysis_updated', {
      success: true,
      data: {
        ...updated,
        action: 'update_analysis',
        timestamp: new Date().toISOString(),
      },
    });
    return { ok: true };
  }

  @Post('delete')
  async delete(@Body() body: { kitId: string }) {
    if (!body?.kitId) throw new HttpException('kitId is required', 400);
    const updated = await this.cache.deleteAnalysis(body.kitId);
    this.bus.send(body.kitId, 'analysis_updated', {
      success: true,
      data: {
        ...updated,
        action: 'delete_analysis',
        timestamp: new Date().toISOString(),
      },
    });
    return { ok: true };
  }

  async notifyAnalysisCompleted(
    kitId: string,
    analysis: MicrobiomeAnalysisInterface,
  ) {
    const updated = await this.cache.setAnalysis(kitId, analysis);
    this.bus.send(kitId, 'analysis_generation_completed', {
      success: true,
      data: {
        ...updated,
        action: 'analysis_generation_completed',
        timestamp: new Date().toISOString(),
      },
    });
  }

  async notifyAnalysisGenerationFailed(kitId: string, errorMessage: string) {
    await this.cache.setGeneratingStatus(kitId, false);
    this.bus.send(kitId, 'analysis_generation_failed', {
      success: true,
      data: {
        action: 'analysis_generation_failed',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
