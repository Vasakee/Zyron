import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { hashPassword } from 'src/common/utils';
import { User } from 'src/user/entity/user.entity';
import { ValidatePractitionerAccountDto } from '../dto/create-bulk-practitioner.dto';
import { ValidatePractitionerCSV } from '../functions/validate-practitioner-csv';
var generator = require('generate-password');
var csv = require('csvtojson');
@Injectable()
export class CreateBulkPractitionerAccountService {
  private readonly logger = new Logger(
    CreateBulkPractitionerAccountService.name,
  );

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async execute(csvFile: Express.Multer.File) {
    try {
      const response = await csv().fromString(csvFile.buffer.toString());
      const practitioners: ValidatePractitionerAccountDto[] =
        await ValidatePractitionerCSV(response);

      let userPayloads: User[] = [];

      const emails = practitioners.map(p => p.email);
      const existingUsers = await this.userRepo.find({
        where: {
          email: In(emails),
        },
      });

      const existingEmails = new Set(existingUsers.map(user => user.email));

      for (const practitioner of practitioners) {
        if (existingEmails.has(practitioner.email)) {
          continue;
        }

        const passwordHash = await hashPassword(
          generator.generate({
            length: 10,
            numbers: true,
          }),
        );

        const Dto = new ValidatePractitionerAccountDto();

        userPayloads.push(Dto.toEntity(practitioner, passwordHash));
      }

      await this.userRepo.save(userPayloads);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}

