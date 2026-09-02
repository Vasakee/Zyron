import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Order } from '../entity/order.entity';
import { OrderDto, SaveOrderDto } from '../dto/create-order.dto';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import * as uuid from 'uuid';
import { BadRequestErrorException } from 'src/common';
import { ClientType, DeliveryMode, Source } from 'src/enum';

@Injectable()
export class SaveOrderService {
  private readonly logger = new Logger(SaveOrderService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async execute(data: SaveOrderDto) {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const referenceId = uuid.v4();

        if (data.clientType === ClientType.PRACTITIONER) {
          const practitioner = await manager.findOne(Practitioner, {
            where: { id: data.practitionerId },
          });

          data.userId = practitioner.userId;

          if (!practitioner) {
            throw new BadRequestErrorException('Practitioner does not exist');
          }
        }

        if (data.deliveryMode === DeliveryMode.DROPSHIP) {
          if (!data.firstName || !data.lastName || !data.email) {
            throw new BadRequestErrorException(
              'Client first name, last name, and email are required for dropship orders',
            );
          }
        } else if (data.deliveryMode === DeliveryMode.ON_SITE) {
          data.firstName = undefined;
          data.lastName = undefined;
          data.email = undefined;
        }

        const payload = new SaveOrderDto().toEntity(
          data,
          data.clientType === ClientType.PRACTITIONER
            ? Source.Platform
            : Source.Website,
          referenceId
        );

        const savedOrder = await manager.save(Order, payload);

        return new OrderDto().fromEntity(savedOrder);
      });

      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
