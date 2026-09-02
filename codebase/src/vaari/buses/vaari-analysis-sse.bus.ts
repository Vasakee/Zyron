import { Injectable } from '@nestjs/common';
import { Response } from 'express';

type Json = any;

@Injectable()
export class VaariAnalysisSseBus {
  private clients = new Map<string, Response>();

  attach(
    kitId: string,
    res: Response,
  ): { ok: true } | { ok: false; reason: string } {
    if (this.clients.has(kitId))
      return { ok: false, reason: 'ALREADY_CONNECTED' };
    this.clients.set(kitId, res);
    return { ok: true };
  }

  detach(kitId: string, res?: Response) {
    const current = this.clients.get(kitId);
    if (!current) return;
    if (!res || current === res) this.clients.delete(kitId);
  }

  send(kitId: string, event: string, data: Json, id?: string) {
    const res = this.clients.get(kitId);
    if (!res) return;
    if (id) res.write(`id: ${id}\n`);
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  has(kitId: string) {
    return this.clients.has(kitId);
  }
}
