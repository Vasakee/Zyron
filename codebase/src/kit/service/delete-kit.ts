import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';

@Injectable()
export class DeleteKitService {
  private readonly logger = new Logger(DeleteKitService.name);

  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
  ) {}

  async execute(id: string) {
    try {
      await this.kitRepo.delete({
        id,
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
