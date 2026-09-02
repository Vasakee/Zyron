import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestErrorException } from 'src/common';
import { CreateValidKitDto } from '../dto/create-kit.dto';
import * as dayjs from 'dayjs';

export async function ValidateKitCSV(validKit: CreateValidKitDto[]) {
  const validatedKits = [];

  for (const kit of validKit) {
    kit.expiryDate = dayjs(kit['expiryDate']).toISOString();
    const validateClass = plainToClass(CreateValidKitDto, kit);

    const errors = await validate(validateClass);

    if (errors.length > 0) {
      const errorConstraints: Record<string, string[]> = {};

      for (const error of errors) {
        for (const property in error.constraints || {}) {
          if (!errorConstraints[property]) {
            errorConstraints[property] = [];
          }
          errorConstraints[property].push(error.constraints[property]);
        }
      }

      throw new BadRequestErrorException('Validation error', errorConstraints);
    }

    validatedKits.push(kit);
  }

  return validatedKits;
}
