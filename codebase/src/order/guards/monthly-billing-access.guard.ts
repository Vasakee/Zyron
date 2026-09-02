import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { PaymentMethod } from 'src/payment/entity/payment-method.entity';
import { OrderType } from 'src/enum';
import {
  CustomRequest,
  isCardExpired,
  parseCardMetadata,
} from 'src/common/utils';
import { OrderDto } from '../dto/create-order.dto';

@Injectable()
export class MonthlyBillingAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const body = (request.body ?? {}) as Partial<OrderDto>;

    const requestedOrderType =
      (body.orderType as OrderType | undefined) ?? null;

    if (requestedOrderType !== OrderType.MonthlyBilling) {
      return true;
    }

    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user context is required');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'monthlyBillingAccess'],
    });

    const hasAccess =
      typeof user?.monthlyBillingAccess === 'boolean'
        ? user.monthlyBillingAccess
        : Boolean(user?.monthlyBillingAccess);

    if (!hasAccess) {
      throw new ForbiddenException(
        'Monthly billing access is not enabled for this account',
      );
    }

    const paymentMethods = await this.paymentMethodRepository.find({
      where: { userId },
    });

    if (paymentMethods.length === 0) {
      throw new ForbiddenException(
        'A payment method is required to create monthly billing orders. Please add a payment method first.',
      );
    }

    // Check if user has at least one valid (non-expired) payment method
    const hasValidCard = paymentMethods.some((method) => {
      const metadata = parseCardMetadata(method.metadata);
      if (!metadata) return false;
      return !isCardExpired(metadata.exp_month, metadata.exp_year);
    });

    if (!hasValidCard) {
      throw new ForbiddenException(
        'All your payment methods have expired. Please add a valid payment method to create monthly billing orders.',
      );
    }

    return true;
  }
}
