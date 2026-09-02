import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { BadRequestErrorException } from 'src/common';
import { PaymentGateway } from '../payment-gateway.interface';
import { StripeGetOrCreateCustomerByEmail } from './stripe/get-or-create-customer-by-email';

@Injectable()
export class CreateSetupIntentService {
  private readonly logger = new Logger(CreateSetupIntentService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
    private readonly stripeGetOrCreateCustomerByEmail: StripeGetOrCreateCustomerByEmail,
  ) {}

  async execute(userId: string): Promise<{
    setupIntentId: string;
    clientSecret: string;
  }> {
    try {
      // Get user from database
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'stripeId', 'email', 'firstName', 'lastName'],
      });

      if (!user) {
        throw new BadRequestErrorException('User not found');
      }

      // Get or create Stripe customer ID
      const stripeCustomerId = await this.getOrCreateStripeCustomerId(user);

      // Create setup intent via payment gateway
      const result = await this.paymentGateway.createSetupIntent(
        stripeCustomerId,
      );

      this.logger.log(`Setup intent created for user ${userId}`);

      return result;
    } catch (error) {
      this.logger.error('Failed to create setup intent', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  private async getOrCreateStripeCustomerId(user: User): Promise<string> {
    // If user already has a Stripe customer ID, return it
    if (user.stripeId) {
      return user.stripeId;
    }

    // User doesn't have a Stripe customer ID, create one
    if (!user.email) {
      throw new BadRequestErrorException(
        'User must have an email to create a Stripe customer',
      );
    }

    this.logger.log(
      `User ${user.id} does not have a Stripe customer ID. Creating one...`,
    );

    // Get or create Stripe customer
    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    const stripeCustomer = await this.stripeGetOrCreateCustomerByEmail.execute(
      user.email,
      fullName || undefined,
      {
        metadata: {
          userId: user.id,
        },
      },
    );

    // Save the Stripe customer ID to the user record
    await this.userRepository.update(
      { id: user.id },
      { stripeId: stripeCustomer.id },
    );

    this.logger.log(
      `Stripe customer ${stripeCustomer.id} created and saved for user ${user.id}`,
    );

    return stripeCustomer.id;
  }
}
