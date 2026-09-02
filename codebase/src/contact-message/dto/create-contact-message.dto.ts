import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ContactMessage } from '../entity/contact-message.entity';

export class CreateContactMessageDto {
  @ApiProperty({
    description: 'First name of the contact person',
    example: 'John',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the contact person',
    example: 'Doe',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Email address of the contact person',
    example: 'john.doe@example.com',
    type: 'string',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number of the contact person (optional)',
    example: '+1234567890',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Contact message',
    example: 'Hello, I would like to know more about your services.',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'File attachment (optional)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  file?: Express.Multer.File;

  // This will be populated after file upload
  fileUrl?: string;

  @Transform(({ obj }) => `${obj.firstName} ${obj.lastName}`)
  get name(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public toEntity(payload: CreateContactMessageDto) {
    const data = new ContactMessage();
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.email = payload.email;
    data.phone = payload.phone;
    data.message = payload.message;
    data.fileUrl = payload.fileUrl;
    return data;
  }

  public fromEntity(payload: ContactMessage) {
    const data = new ContactMessage();
    data.id = payload.id;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.email = payload.email;
    data.phone = payload.phone;
    data.message = payload.message;
    data.fileUrl = payload.fileUrl;
    return data;
  }
}
