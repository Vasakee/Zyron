import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { API_KEYS } from 'src/config';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private readonly validApiKeys: Set<string>;

  constructor() {
    const apiKeys = API_KEYS;
    this.validApiKeys = new Set(
      apiKeys?.split(',')?.filter((key) => key?.trim()),
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = this.extractApiKey(req);

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    if (!this.validateApiKey(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    next();
  }

  private extractApiKey(req: Request): string | undefined {
    const headerKey = req.headers['x-api-key'] as string;
    if (headerKey) return headerKey;

    return undefined;
  }

  private validateApiKey(apiKey: string): boolean {
    return this.validApiKeys.has(apiKey);
  }
}
