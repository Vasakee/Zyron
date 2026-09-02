import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { CreateKitDto } from '../dto/create-kit.dto';
import { BadRequestErrorException, ConflictErrorException } from 'src/common';
import { ValidKit } from 'src/validKit/entity/valid-kit.entity';
import {
  AccountRoles,
  OrderRegistrationStatus,
  PractitionerAccessStatus,
  ValidKitStatus,
} from 'src/enum';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { Order } from 'src/order/entity/order.entity';
import { OrderKit } from 'src/order/entity/order-kit.entity';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { ClientPractitioner } from 'src/practitioner/entity/client-practitioner.entity';
import { isUniqueViolation } from 'src/common/utils/db-helpers';
import { detectKitTypeFromNumber } from 'src/common/utils/kit-type-detector';

@Injectable()
export class CreateKitService {
  private readonly logger = new Logger(CreateKitService.name);

  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
    private readonly dataSource: DataSource,
  ) { }

  async execute(data: CreateKitDto) {
    try {
      const Dto = new CreateKitDto();

      if (data.kitId) {
        const payload = Dto.toUpdateEntity(data);
        const res = await this.kitRepo.update({ id: data.kitId }, payload);
        if (!res.affected) {
          throw new BadRequestErrorException('Kit not found');
        }
        return;
      }

      return await this.dataSource.transaction(async (manager) => {
        const kitNumber = data.kitNumber;
        const [kitRecord, practitionerKitRecord, orderKit, validKitRecord] =
          await Promise.all([
            manager.findOne(Kit, { where: { kitNumber } }),
            manager.findOne(PractitionerKit, { where: { kitNumber } }),
            manager.findOne(OrderKit, {
              where: { kitId: kitNumber },
              relations: ['order'],
            }),
            manager.findOne(ValidKit, {
              where: { kitId: kitNumber },
              lock: { mode: 'pessimistic_write' },
            }),
          ]);

        if (kitRecord || practitionerKitRecord) {
          throw new ConflictErrorException('Kit is already registered');
        }

        if (
          !validKitRecord ||
          validKitRecord.status === ValidKitStatus.Registered
        ) {
          throw new ConflictErrorException(
            'Kit is not valid or it has been registered before',
          );
        }

        data.kitType = detectKitTypeFromNumber(kitNumber);

        const payload = Dto.toEntity(data);
        const result = await manager.save(Kit, payload);

        if (orderKit) {
          orderKit.registrationStatus = OrderRegistrationStatus.YES;
          orderKit.registeredBy = AccountRoles.CLIENT;
          orderKit.registeredByUserId = data.userId;
          await manager.save(OrderKit, orderKit);
        }

        const orderRecord = orderKit?.order;

        if (orderRecord) {
          orderRecord.registeredBy = AccountRoles.CLIENT;
          orderRecord.registrationStatus = OrderRegistrationStatus.YES;
          await manager.save(Order, orderRecord);

          if (orderRecord.userId) {
            const practitioner = await manager.findOne(Practitioner, {
              where: { userId: orderRecord.userId },
              select: ['id'],
            });

            if (practitioner) {
              let clientPractitioner = await manager.findOne(
                ClientPractitioner,
                {
                  where: {
                    userId: data.userId,
                    practitionerId: practitioner.id,
                  },
                },
              );

              if (!clientPractitioner) {
                clientPractitioner = manager.create(ClientPractitioner, {
                  userId: data.userId,
                  practitionerId: practitioner.id,
                  reportAccess: PractitionerAccessStatus.GRANTED,
                });
              } else {
                clientPractitioner.reportAccess =
                  PractitionerAccessStatus.GRANTED;
              }

              await manager.save(ClientPractitioner, clientPractitioner);
              this.logger.log(
                `Auto-granted visibility to practitioner ${practitioner.id} for client ${data.userId}`,
              );
            }
          }
        }

        await manager.update(ValidKit, validKitRecord.id, {
          status: ValidKitStatus.Registered,
        });

        return Dto.fromEntity(result);
      });
    } catch (error: any) {
      this.logger.error('CreateKitService failed', error?.stack ?? error);

      if (isUniqueViolation(error)) {
        throw new ConflictErrorException('Kit is already registered');
      }

      throw error;
    }
  }
}
