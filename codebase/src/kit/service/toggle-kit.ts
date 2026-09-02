import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import {
  BadRequestErrorException,
  ConflictErrorException,
  NotFoundErrorException,
} from 'src/common';
import { LockStatus } from 'src/enum';

@Injectable()
export class UpdateKitLockStatusService {
  private readonly logger = new Logger(UpdateKitLockStatusService.name);
  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
  ) {}
  async execute(kitId: string) {
    try {
      const kitRecord = await this.kitRepo.findOne({
        where: { id: kitId },
      });

      if (!kitRecord) {
        throw new BadRequestErrorException('Kit not found');
      }

      kitRecord.lockStatus =
        kitRecord.lockStatus === LockStatus.LOCKED
          ? LockStatus.UNLOCKED
          : LockStatus.LOCKED;

      // Save the updated kit entity
      await this.kitRepo.save(kitRecord);

      // Return the updated kit
      return kitRecord;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
