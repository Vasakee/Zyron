import { Injectable, Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { ConflictErrorException } from 'src/common';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Order } from '../entity/order.entity';
import { OrderKit } from '../entity/order-kit.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueService } from 'src/queues/services/queue.service';
import {
  AllowedCountries,
  AllowedCountriesAbbrev,
  DeliveryMode,
  OrderRegistrationStatus,
} from 'src/enum';

@Injectable()
export class UpdateOrderService {
  private readonly logger = new Logger(UpdateOrderService.name);
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly queueService: QueueService,
    private readonly dataSource: DataSource,
  ) {}

  private getEmailRecipient(order: Order) {
    const practitioner = order.user;
    if (order.deliveryMode === DeliveryMode.ON_SITE) {
      return {
        email: practitioner?.email ?? order.email,
        name: practitioner?.firstName ?? order.firstName ?? 'there',
      };
    }
    return {
      email: order.email,
      name: order.firstName ?? 'there',
    };
  }

  async execute(id: string, data: UpdateOrderDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const OrderRecord = await manager.findOne(Order, {
          where: { id },
          relations: ['orderKits', 'user'],
        });

        if (!OrderRecord) {
          throw new ConflictErrorException('Order not found');
        }

        // Track if shipment fields are being updated
        const isShippingDateUpdated =
          data.shippingDate && !OrderRecord.shippingDate;
        const isTrackingNumberUpdated =
          data.trackingNumber && !OrderRecord.trackingNumber;
        const isTrackingUrlUpdated =
          data.trackingUrl && !OrderRecord.trackingUrl;
        const hasShipmentFieldsUpdated =
          isShippingDateUpdated ||
          isTrackingNumberUpdated ||
          isTrackingUrlUpdated;

        const existingKitIds = new Set(
          OrderRecord.orderKits.map((k) => k.kitId),
        );
        const incomingKitIds = new Set(data.kitIds);

        const kitsToAdd = data.kitIds.filter((k) => !existingKitIds.has(k));
        const kitsToRemove = OrderRecord.orderKits
          .filter((k) => !incomingKitIds.has(k.kitId))
          .map((k) => k.kitId);

        if (kitsToAdd.length) {
          await manager.getRepository(OrderKit).insert(
            kitsToAdd.map((kitId) => ({
              orderId: OrderRecord.id,
              kitId,
              registrationStatus: OrderRegistrationStatus.NO,
            })),
          );
        }

        if (kitsToRemove.length) {
          await manager.getRepository(OrderKit).delete({
            orderId: OrderRecord.id,
            kitId: In(kitsToRemove),
          });
        }

        const Dto = new UpdateOrderDto();
        const updatePayload: Partial<Order> = {};

        if (data.shippingDate) {
          const shippingDate = new Date(data.shippingDate);
          shippingDate.setDate(shippingDate.getDate() + 10);
          updatePayload.shippingDate = data.shippingDate;
          updatePayload.expectedDeliveryDate = shippingDate;
          OrderRecord.shippingDate = data.shippingDate;
          OrderRecord.expectedDeliveryDate = shippingDate;
        }
        if (data.trackingUrl) {
          updatePayload.trackingUrl = data.trackingUrl;
          OrderRecord.trackingUrl = data.trackingUrl;
        }
        if (data.trackingNumber) {
          updatePayload.trackingNumber = data.trackingNumber;
          OrderRecord.trackingNumber = data.trackingNumber;
        }
        if (data.quantity) {
          updatePayload.quantity = data.quantity;
          OrderRecord.quantity = data.quantity;
        }
        if (data?.extraPackages?.length) {
          updatePayload.extraPackages = data.extraPackages;
          OrderRecord.extraPackages = data.extraPackages;
        }
        const justShipped =
          hasShipmentFieldsUpdated && !OrderRecord.trackingEmailStatus;

        if (justShipped) {
          updatePayload.trackingEmailStatus = true;
          OrderRecord.trackingEmailStatus = true;
        }

        await manager.update(Order, { id }, updatePayload);

        if (justShipped) {
          const recipient = this.getEmailRecipient(OrderRecord);

          if (updatePayload.trackingNumber) {
            await this.eventEmitter.emitAsync('tracking.email', {
              email: recipient.email,
              name: recipient.name,
              orderNumber: OrderRecord.id,
              trackingNumber: updatePayload.trackingNumber,
              trackingUrl: updatePayload.trackingUrl,
            });

            await this.eventEmitter.emitAsync('sample-collection.guideline', {
              email: recipient.email,
              name: recipient.name,
              orderNumber: OrderRecord.id,
              trackingNumber: updatePayload.trackingNumber,
              trackingUrl: updatePayload.trackingUrl,
            });

            if (
              OrderRecord.country === AllowedCountriesAbbrev.CA ||
              OrderRecord.country === AllowedCountries.CA
            ) {
              await this.eventEmitter.emitAsync('return-label.clarification', {
                email: recipient.email,
                name: recipient.name,
                orderNumber: OrderRecord.id,
              });
            }
          }
          // Trigger auto-register job for practitioner orders (first shipment only)
          // Skip auto-registration for on-site orders
          if (OrderRecord.deliveryMode !== DeliveryMode.ON_SITE) {
            const jobs = data.kitIds.map((kit) => ({
              orderId: OrderRecord.id,
              kitId: kit,
            }));

            await this.queueService.addAutoRegisterPractitionerOrderKitsJobsBulk(
              jobs,
            );
          } else {
            this.logger.log(
              `Skipping auto-registration for on-site order ${OrderRecord.id}`,
            );
          }
        } else if (hasShipmentFieldsUpdated) {
          this.logger.log(
            'this order has been updated with tracking details prior',
            OrderRecord.trackingEmailStatus,
            OrderRecord.expectedDeliveryDate,
          );
        }
        return Dto.fromEntity(OrderRecord);
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
