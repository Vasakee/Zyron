import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

type Json = any;

type Client = {
  res: Response;
  userId?: string;
};

@Injectable()
export class HealthInfoSseBus {
  private rooms = new Map<string, Set<Client>>();
  private readonly MAX_CONNECTIONS_PER_KIT = 10;

  attach(
    kitId: string,
    res: Response,
    userId?: string,
  ): { ok: true; size: number } | { ok: false; reason: string; size: number } {
    if (!this.rooms.has(kitId)) this.rooms.set(kitId, new Set());
    const set = this.rooms.get(kitId)!;

    if (set.size >= this.MAX_CONNECTIONS_PER_KIT) {
      return { ok: false, reason: 'ROOM_FULL', size: set.size };
    }

    set.add({ res, userId });
    return { ok: true, size: set.size };
  }

  detach(kitId: string, res?: Response) {
    const set = this.rooms.get(kitId);
    if (!set) return;

    if (res) {
      for (const c of set) {
        if (c.res === res) {
          set.delete(c);
          break;
        }
      }
    }

    if (set.size === 0) this.rooms.delete(kitId);
  }

  size(kitId: string): number {
    return this.rooms.get(kitId)?.size ?? 0;
  }

  private write(res: Response, event: string, data: Json, id?: string) {
    if (id) res.write(`id: ${id}\n`);
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  send(kitId: string, event: string, data: Json, id?: string) {
    const set = this.rooms.get(kitId);
    if (!set) return;
    for (const { res } of set) this.write(res, event, data, id);
  }

  sendOthers(kitId: string, resToSkip: Response, event: string, data: Json) {
    const set = this.rooms.get(kitId);
    if (!set) return;
    for (const { res } of set) {
      if (res !== resToSkip) this.write(res, event, data);
    }
  }

  has(kitId: string) {
    return this.rooms.has(kitId);
  }
}
