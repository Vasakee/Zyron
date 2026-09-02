import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import {
  BadRequestErrorException,
  UnauthorizedErrorException,
} from 'src/common';
import { OrderType, Source } from 'src/enum';
import { SaveOrderExternalDto } from '../dto/save-order-external.dto';
import { Order } from 'src/order/entity/order.entity';

@Injectable()
export class SaveOrderExternalService {
  private readonly logger = new Logger(SaveOrderExternalService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async execute(data: SaveOrderExternalDto) {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        if (data.username !== Source.Elyxium) {
          throw new UnauthorizedErrorException('Action is not authorized');
        }

        if (data.usePractitionerAccount) {
          const practitioner = await manager.findOne(Practitioner, {
            where: { user: { email: data.practitionerEmail } },
          });

          if (!practitioner) {
            throw new BadRequestErrorException('Practitioner does not exist');
          }

          data.userId = practitioner.userId;
        }

        const payload = new SaveOrderExternalDto().toEntity(
          data,
          Source.Elyxium,
        );

        const savedOrder = await manager.save(Order, payload);

        return new SaveOrderExternalDto().fromEntity(savedOrder);
      });

      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
