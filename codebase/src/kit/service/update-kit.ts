import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { ConflictErrorException } from 'src/common';
import { UpdateKitDto } from '../dto/update-kit.dto';

@Injectable()
export class UpdateKitService {
  private readonly logger = new Logger(UpdateKitService.name);
  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
  ) {}
  async execute(id: string, data: UpdateKitDto) {
    try {
      const kitRecord = await this.kitRepo.findOne({
        where: { id },
      });

      if (!kitRecord) {
        throw new ConflictErrorException('Kit not found');
      }

      const Dto = new UpdateKitDto();
      const payload = Dto.updateEntity(kitRecord, data);
      const result = await this.kitRepo.save(payload);

      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
