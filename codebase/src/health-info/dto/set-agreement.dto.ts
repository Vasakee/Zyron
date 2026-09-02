import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SetAgreementDto {
  @IsString()
  kitId: string;

  @IsOptional()
  @IsBoolean()
  acceptedTerms?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptedPolicy?: boolean;
}
