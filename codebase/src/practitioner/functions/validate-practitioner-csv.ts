import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestErrorException } from 'src/common';
import { ValidatePractitionerAccountDto } from '../dto/create-bulk-practitioner.dto';

export async function ValidatePractitionerCSV(
  practitioners: ValidatePractitionerAccountDto[],
) {
  const validatedPractitioners = [];

  for (const practitioner of practitioners) {
    const validateClass = plainToClass(
      ValidatePractitionerAccountDto,
      practitioner,
    );

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

    validatedPractitioners.push(practitioner);
  }

  return validatedPractitioners;
}
