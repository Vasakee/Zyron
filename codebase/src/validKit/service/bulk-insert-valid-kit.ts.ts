import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidKit } from '../entity/valid-kit.entity';
import { CreateValidKitDto } from '../dto/create-kit.dto';
import { ConflictErrorException } from 'src/common';
import { ValidateKitCSV } from '../functions/validate-valid-kit-csv';

const csv = require('csvtojson');

@Injectable()
export class CreateValidKitService {
  private readonly logger = new Logger(CreateValidKitService.name);
  private readonly MAX_BATCH_SIZE = 300;
  constructor(
    @InjectRepository(ValidKit)
    private readonly validKitRepo: Repository<ValidKit>,
  ) {}
  async execute(csvFile: Express.Multer.File) {
    try {
      const response = await csv().fromString(csvFile.buffer.toString());
      const validKits: CreateValidKitDto[] = await ValidateKitCSV(response);
      for (let i = 0; i < validKits.length; i += this.MAX_BATCH_SIZE) {
        const batch = validKits.slice(i, i + this.MAX_BATCH_SIZE);
        await this.validKitRepo.save(batch);
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
