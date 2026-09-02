import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { QueueNames, JobTypes, TestReportJobData } from '../types/queue.types';

@Processor(QueueNames.TEST)
@Injectable()
export class TestReportProcessor {
  private readonly logger = new Logger(TestReportProcessor.name);

  @Process({ name: JobTypes.TEST_REPORT, concurrency: 2 })
  async handle(job: Job<TestReportJobData>) {
    const testId = job?.data?.testId ?? `job-${job.id}`;
    const name = job?.data?.name ?? 'Anonymous';

    const iterations = (job.data as any)?.iterations ?? 10;
    const delayMs = (job.data as any)?.delayMs ?? 750;

    await job.log(
      `Starting test-report for "${name}" (testId=${testId}) with ${iterations} step(s).`,
    );

    for (let i = 1; i <= iterations; i++) {
      await job.log(`Step ${i}/${iterations} running...`);
      await this.sleep(delayMs);
    }

    await job.log(`All ${iterations} step(s) completed for testId=${testId}.`);
    this.logger.log(`Test report finished`, { jobId: job.id, testId, name });

    return {
      ok: true,
      testId,
      name,
      iterations,
      delayMs,
      finishedAt: new Date().toISOString(),
    };
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} is now active (${job.name}).`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: unknown) {
    this.logger.log(`Job ${job.id} completed (${job.name}).`, { result });
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed (${job.name}).`, {
      error: err?.message,
    });
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
