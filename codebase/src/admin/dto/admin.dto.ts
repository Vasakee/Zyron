import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AccountRoles, AdminPermissions } from 'src/enum';
import { User } from 'src/user/entity/user.entity';
import { Admin } from '../entity/admin.entity';

export class CreateAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AdminPermissions, { each: true })
  permissions: string[];

  public toAdminEntity(payload: CreateAdminDto) {
    const data = new Admin();
    data.permissions = payload.permissions;
    return data;
  }

  public toEntity(payload: CreateAdminDto, passwordHash: string) {
    const data = new User();
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.email = payload.email;
    data.role = AccountRoles.ADMIN;
    data.password = passwordHash;
    data.emailVerifiedAt = new Date();
    data.admin = this.toAdminEntity(payload);
    return data;
  }

  public fromEntity(payload: User) {
    const data = new User();
    data.id = payload.id;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.email = payload.email;
    data.phone = payload.phone;
    data.avatar = payload.avatar;
    data.admin = payload.admin;
    data.createdAt = payload.createdAt;
    data.updatedAt = payload.updatedAt;
    return data;
  }
}

export class UpdateAdminDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsEnum(AdminPermissions, { each: true })
  permissions?: string[];

  public toUserEntity(payload: UpdateAdminDto): Partial<User> {
    const data: Partial<User> = {};
    if (payload.firstName) data.firstName = payload.firstName;
    if (payload.lastName) data.lastName = payload.lastName;
    return data;
  }

  public toAdminEntity(payload: UpdateAdminDto): Partial<Admin> {
    const data: Partial<Admin> = {};
    if (payload.permissions) data.permissions = payload.permissions;
    return data;
  }
}

export class UpdateAdminAccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  public updateEntity(payload: UpdateAdminAccountDto): Partial<User> {
    const data: Partial<User> = {};
    if (payload.firstName) data.firstName = payload.firstName;
    if (payload.lastName) data.lastName = payload.lastName;
    return data;
  }
}

export class AdminQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchQuery?: string;
}

export class PromoteUserToAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ isArray: true, enum: AdminPermissions })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AdminPermissions, { each: true })
  permissions: string[];
}
