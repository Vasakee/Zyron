import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ForbiddenErrorException } from '../filters/error-exceptions';
import { SECRET_KEY } from 'src/config';

dotenv.config();

export const verifyTokens = ({
  secret,
  token,
}: {
  secret: string;
  token: string;
}) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, function (err: Error, decoded: any) {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

interface CustomRequest extends Request {
  user?: { id: string };
}

@Injectable()
export class VerifyTokenMiddleware implements NestMiddleware {
  private readonly logger = new Logger(VerifyTokenMiddleware.name);
  use(req: CustomRequest, res: Response, next: NextFunction) {
    const accessToken = req.headers['x-access-token'] as string;

    verifyTokens({
      token: accessToken,
      secret: SECRET_KEY as string,
    })
      .then((decoded) => {
        const user = {
          id: decoded['id'],
        };
        req.user = user;
        next();
      })
      .catch((err) => {
        this.logger.error(err);
        res
          .status(401)
          .json(
            new ForbiddenErrorException(
              'Your login session is expired',
            ).getResponse(),
          );
      });
  }
}
