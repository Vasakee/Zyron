import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KitReplacementRequest } from '../entity/kit-replacement-request.entity';
import { CreateReplacementKitRequestDto } from '../dto/create-replacement-kit-request.dto';
import {
  BadRequestErrorException,
  ConflictErrorException,
} from 'src/common/filters';
import { ReplacementKitStatus, ReplacementKitTargetType } from 'src/enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReplacementKitRequestService {
  constructor(
    @InjectRepository(KitReplacementRequest)
    private readonly kitReplacementRepo: Repository<KitReplacementRequest>,
  ) {}

  async list(status?: ReplacementKitStatus) {
    const where = status ? { status } : {};
    return this.kitReplacementRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    dto: CreateReplacementKitRequestDto,
    createdByAdminId: string,
  ): Promise<KitReplacementRequest> {
    this.validate(dto);

    const referenceId = `repl_${uuidv4()}`;

    const entity = this.kitReplacementRepo.create({
      referenceId,
      targetType: dto.targetType,
      practitionerId:
        dto.targetType === ReplacementKitTargetType.PRACTITIONER
          ? dto.practitionerId
          : null,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      kitType: dto.kitType,
      currency: dto.currency,
      quantity: dto.quantity,
      country: dto.address.country,
      addressLineOne: dto.address.addressLineOne,
      addressLineTwo: dto.address.addressLineTwo ?? null,
      city: dto.address.city,
      state: dto.address.state,
      postalCode: dto.address.postalCode,
      status: ReplacementKitStatus.PENDING_PAYMENT,
      paymentUrl: null,
      createdByAdminId,
    });

    try {
      return await this.kitReplacementRepo.save(entity);
    } catch (error) {
      if (error?.message?.includes('UQ_kit_repl_referenceId')) {
        throw new ConflictErrorException('Reference already exists');
      }
      throw error;
    }
  }

  private validate(dto: CreateReplacementKitRequestDto) {
    if (dto.quantity < 1) {
      throw new BadRequestErrorException('Quantity must be at least 1');
    }

    if (dto.targetType === ReplacementKitTargetType.PRACTITIONER) {
      if (!dto.practitionerId) {
        throw new BadRequestErrorException(
          'practitionerId is required for practitioner targetType',
        );
      }
    } else if (dto.targetType === ReplacementKitTargetType.CLIENT) {
      if (dto.practitionerId) {
        throw new BadRequestErrorException(
          'practitionerId must be empty for client targetType',
        );
      }
    } else {
      throw new BadRequestErrorException('Invalid targetType');
    }
  }
}
