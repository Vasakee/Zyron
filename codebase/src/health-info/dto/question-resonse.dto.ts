import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionResponseInterface } from 'src/database/cache/response';

export class AnswerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  questionItemId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selectedOption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  selectedOptions?: string[];
}

// QuestionResponseInterface DTO
export class QuestionResponseDto {
  @ApiProperty()
  @IsString()
  KitId: string;

  @ApiProperty()
  @IsNumber()
  questionId: number;

  @ApiProperty({ type: [AnswerDto] })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @IsArray()
  answers: AnswerDto[];
}

export class addQuestionResponseDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  kitId: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  categoryId: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  completed: boolean;

  @ApiProperty({ type: QuestionResponseDto })
  @ValidateNested()
  @Type(() => QuestionResponseDto)
  questionResponse: QuestionResponseDto;

  //   @ApiProperty()
  //   questionResponse: QuestionResponseInterface;
}
