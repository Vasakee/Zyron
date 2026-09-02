import {
  Controller,
  Get,
  Post,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueueNames } from '../types/queue.types';
import { QueueService } from '../services/queue.service';

@ApiTags('Queue Management')
@Controller('queues')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({
    status: 200,
    description: 'Queue statistics retrieved successfully',
  })
  async getQueueStats() {
    return await this.queueService.getQueueStats();
  }

  @Post(':queueName/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause a queue' })
  @ApiResponse({ status: 200, description: 'Queue paused successfully' })
  @ApiResponse({ status: 400, description: 'Invalid queue name' })
  async pauseQueue(@Param('queueName') queueName: string) {
    if (!Object.values(QueueNames).includes(queueName as QueueNames)) {
      throw new Error('Invalid queue name');
    }

    await this.queueService.pauseQueue(queueName as QueueNames);
    return { message: `Queue ${queueName} paused successfully` };
  }

  @Post(':queueName/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume a queue' })
  @ApiResponse({ status: 200, description: 'Queue resumed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid queue name' })
  async resumeQueue(@Param('queueName') queueName: string) {
    if (!Object.values(QueueNames).includes(queueName as QueueNames)) {
      throw new Error('Invalid queue name');
    }

    await this.queueService.resumeQueue(queueName as QueueNames);
    return { message: `Queue ${queueName} resumed successfully` };
  }
}
