import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestErrorException, NotFoundErrorException } from 'src/common';
import {
  generateAccessToken,
  generateAccessTokenForSignUp,
  generateRefreshToken,
} from 'src/common/utils';
import { FRONTEND_URL } from 'src/config';
import { AccountRoles, Strategy } from 'src/enum';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}
  async googleAuth(req, res) {
    try {
      if (!req.user) {
        return res.redirect(
          `${FRONTEND_URL}/login?error=User does not have a google account`,
        );
      }

      const userRecord = await this.userRepo.findOne({
        where: { email: req.user.email },
      });

      if (userRecord) {
        if (userRecord.strategy !== Strategy.GOOGLE) {
          return res.redirect(
            `${FRONTEND_URL}/login?error=Login with your email`,
          );
        }
        const access_token = generateAccessToken(
          userRecord.id,
          'user_access_key',
        );
        const refresh_token = generateRefreshToken(
          userRecord.id,
          'user_refresh_key',
        );

        return res.redirect(
          `${FRONTEND_URL}/authenticate?access_token=${access_token}&refresh_token=${refresh_token}`,
        );
      }

      const payload = {
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.picture,
        role: AccountRoles.USER,
        strategy: Strategy.GOOGLE,
        emailVerifiedAt: new Date(),
      };

      const result = await this.userRepo.save(payload);

      const token = await generateAccessTokenForSignUp(
        { id: result.id },
        'user_access_key',
      );

      res.redirect(`${FRONTEND_URL}/complete-registration?token=${token}`);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
