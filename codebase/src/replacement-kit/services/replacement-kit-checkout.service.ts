import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { KitReplacementRequest } from '../entity/kit-replacement-request.entity';
import { Order } from 'src/order/entity/order.entity';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import {
  NotFoundErrorException,
  BadRequestErrorException,
  ForbiddenErrorException,
} from 'src/common/filters';
import {
  Currency,
  InvoicingMode,
  KitType,
  OrderPaymentType,
  OrderStatus,
  OrderType,
  ReplacementKitStatus,
  ReplacementKitTargetType,
  Source,
} from 'src/enum';
import { CreateCheckoutSessionService } from 'src/payment/services/create-checkout-session.service';
import { FRONTEND_URL } from 'src/config';

@Injectable()
export class ReplacementKitCheckoutService {
  private readonly logger = new Logger(ReplacementKitCheckoutService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(KitReplacementRequest)
    private readonly kitReplacementRepo: Repository<KitReplacementRequest>,
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
    private readonly checkoutService: CreateCheckoutSessionService,
  ) {}

  async listForPractitioner(practitionerId: string) {
    return this.kitReplacementRepo.find({
      where: {
        practitionerId,
        targetType: ReplacementKitTargetType.PRACTITIONER,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createCheckoutLink(
    id: string,
    actor: { practitionerId?: string },
  ): Promise<{ url: string; sessionId: string }> {
    const request = await this.kitReplacementRepo.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundErrorException('Replacement kit request not found');
    }

    if (request.targetType === ReplacementKitTargetType.PRACTITIONER) {
      if (!actor.practitionerId) {
        throw new ForbiddenErrorException(
          'Practitioner id is required for this request',
        );
      }
      if (request.practitionerId !== actor.practitionerId) {
        throw new ForbiddenErrorException(
          'You cannot access this replacement kit request',
        );
      }
    }

    if (request.status !== ReplacementKitStatus.PENDING_PAYMENT) {
      throw new BadRequestErrorException(
        'Checkout link is only available for pending payment requests',
      );
    }

    let practitionerUserId: string | undefined;
    if (
      request.targetType === ReplacementKitTargetType.PRACTITIONER &&
      request.practitionerId
    ) {
      const practitioner = await this.practitionerRepo.findOne({
        where: { id: request.practitionerId },
      });
      if (!practitioner) {
        throw new NotFoundErrorException('Practitioner not found');
      }
      if (!practitioner.userId) {
        throw new BadRequestErrorException('Practitioner user is required');
      }
      practitionerUserId = practitioner.userId;
    }

    const { successUrl, cancelUrl } = this.getCheckoutUrls();

    const session = await this.checkoutService.execute({
      kitType: request.kitType as KitType,
      currency: request.currency as Currency,
      paymentType: OrderPaymentType.KIT_REPLACEMENT_ORDER,
      referenceId: request.referenceId,
      quantity: request.quantity,
      isAuthenticated:
        request.targetType === ReplacementKitTargetType.PRACTITIONER,
      userId:
        request.targetType === ReplacementKitTargetType.PRACTITIONER
          ? practitionerUserId
          : undefined,
      successUrl,
      cancelUrl,
    });

    const desiredSource =
      request.targetType === ReplacementKitTargetType.PRACTITIONER
        ? Source.Platform
        : Source.Website;

    const updateResult = await this.dataSource.transaction(async (manager) => {
      const requestRepo = manager.getRepository(KitReplacementRequest);
      const orderRepo = manager.getRepository(Order);
      const practitionerRepo = manager.getRepository(Practitioner);

      const lockedRequest = await requestRepo.findOne({
        where: { id: request.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedRequest) {
        throw new NotFoundErrorException('Replacement kit request not found');
      }

      if (lockedRequest.status !== ReplacementKitStatus.PENDING_PAYMENT) {
        throw new BadRequestErrorException(
          'Checkout link is only available for pending payment requests',
        );
      }

      let existingOrder = await orderRepo.findOne({
        where: { referenceId: lockedRequest.referenceId },
      });

      if (!existingOrder) {
        let userId = practitionerUserId;
        if (
          !userId &&
          lockedRequest.targetType === ReplacementKitTargetType.PRACTITIONER &&
          lockedRequest.practitionerId
        ) {
          const practitioner = await practitionerRepo.findOne({
            where: { id: lockedRequest.practitionerId },
          });
          userId = practitioner?.userId || undefined;
        }

        const order = orderRepo.create({
          referenceId: lockedRequest.referenceId,
          userId,
          firstName: lockedRequest.firstName,
          lastName: lockedRequest.lastName,
          email: lockedRequest.email,
          kitType: lockedRequest.kitType,
          country: lockedRequest.country,
          addressLineOne: lockedRequest.addressLineOne,
          addressLineTwo: lockedRequest.addressLineTwo,
          city: lockedRequest.city,
          state: lockedRequest.state,
          postalCode: lockedRequest.postalCode,
          quantity: lockedRequest.quantity,
          currency: lockedRequest.currency,
          status: OrderStatus.Pending,
          orderType: OrderType.PayAsYouGo,
          invoicingMode: InvoicingMode.Immediate,
          source: desiredSource,
          paymentUrl: session.url,
        });

        try {
          existingOrder = await orderRepo.save(order);
        } catch (error) {
          const err = error as { number?: number; code?: string };
          if (
            err?.number === 2601 ||
            err?.number === 2627 ||
            err?.code === '23505'
          ) {
            existingOrder = await orderRepo.findOne({
              where: { referenceId: lockedRequest.referenceId },
            });
          } else {
            throw error;
          }
        }
      }

      if (existingOrder) {
        const updates: Partial<Order> = {};
        if (!existingOrder.paymentUrl) {
          updates.paymentUrl = session.url;
        }
        if (existingOrder.source !== desiredSource) {
          updates.source = desiredSource;
        }
        if (Object.keys(updates).length > 0) {
          await orderRepo.update({ id: existingOrder.id }, updates);
        }
      }

      return requestRepo.update(
        {
          id: lockedRequest.id,
          paymentUrl: lockedRequest.paymentUrl ?? null,
          status: ReplacementKitStatus.PENDING_PAYMENT,
        },
        { paymentUrl: session.url },
      );
    });

    if (updateResult.affected && updateResult.affected > 0) {
      return { url: session.url, sessionId: session.id };
    }

    const latest = await this.kitReplacementRepo.findOne({
      where: { id: request.id },
    });
    if (latest?.paymentUrl) {
      return {
        url: latest.paymentUrl,
        sessionId: (latest as any).paymentSessionId || '',
      };
    }

    // Fallback to returning generated session if no cached url is found.
    return { url: session.url, sessionId: session.id };
  }

  private getCheckoutUrls(): { successUrl: string; cancelUrl: string } {
    if (!FRONTEND_URL) {
      throw new Error('FRONTEND_URL is not set');
    }

    return {
      successUrl: `${FRONTEND_URL}/payment/success?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${FRONTEND_URL}/payment/cancel`,
    };
  }
}
