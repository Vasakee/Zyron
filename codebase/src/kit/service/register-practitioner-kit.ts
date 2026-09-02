import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { BadRequestErrorException, ConflictErrorException } from 'src/common';
import { ValidKit } from 'src/validKit/entity/valid-kit.entity';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { RegisterPractitionerKitDto } from '../dto/register-practitioner-kit.dto';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { Kit } from '../entity/kit.entity';
import {
  AccountRoles,
  OrderRegistrationStatus,
  ValidKitStatus,
} from 'src/enum';
import { Order } from 'src/order/entity/order.entity';
import { OrderKit } from 'src/order/entity/order-kit.entity';
import { isUniqueViolation } from 'src/common/utils/db-helpers';

@Injectable()
export class RegisterPractitionerKitService {
  private readonly logger = new Logger(RegisterPractitionerKitService.name);

  constructor(private readonly dataSource: DataSource) { }

  async execute(data: RegisterPractitionerKitDto, manager?: EntityManager) {
    if (manager) {
      return this.runInTransaction(manager, data);
    }

    return this.dataSource.transaction((newManager) =>
      this.runInTransaction(newManager, data),
    );
  }

  private async runInTransaction(
    manager: EntityManager,
    data: RegisterPractitionerKitDto,
  ) {
    const [practitioner, validKit] = await Promise.all([
      manager.findOne(Practitioner, {
        where: { userId: data.userId },
        select: ['id'],
      }),
      manager.findOne(ValidKit, {
        where: { kitId: data.kitNumber },
        lock: { mode: 'pessimistic_write' },
        select: ['id', 'status', 'kitId'],
      }),
    ]);

    if (!practitioner) {
      throw new BadRequestErrorException('Practitioner not found');
    }

    if (!validKit) {
      throw new BadRequestErrorException('Kit is not valid');
    }

    if (validKit.status === ValidKitStatus.Registered) {
      throw new ConflictErrorException('Kit has been registered before');
    }

    const [existingPractitionerKit, existingClientKit, orderKit] =
      await Promise.all([
        manager.findOne(PractitionerKit, {
          where: { kitNumber: data.kitNumber },
        }),
        manager.findOne(Kit, { where: { kitNumber: data.kitNumber } }),
        manager.findOne(OrderKit, {
          where: { kitId: data.kitNumber },
          relations: ['order'],
        }),
      ]);

    if (existingPractitionerKit || existingClientKit) {
      throw new ConflictErrorException('Kit is already registered');
    }

    const order = orderKit?.order;

    const dto = new RegisterPractitionerKitDto();
    const payload = dto.toEntity(data);
    payload.practitionerId = practitioner.id;

    try {
      await manager.save(PractitionerKit, payload);
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        throw new ConflictErrorException('Kit is already registered');
      }

      throw err;
    }

    if (order) {
      await manager.update(Order, order.id, {
        registeredBy: AccountRoles.PRACTITIONER,
        registrationStatus: OrderRegistrationStatus.YES,
      });
    }

    if (orderKit) {
      await manager.update(OrderKit, orderKit.id, {
        registrationStatus: OrderRegistrationStatus.YES,
        registeredBy: AccountRoles.PRACTITIONER,
        registeredByUserId: data.userId,
      });
    }

    await manager.update(ValidKit, validKit.id, {
      status: ValidKitStatus.Registered,
    });

    return payload;
  }
}
