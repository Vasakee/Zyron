import { Currency, KitType } from 'src/enum';
import type { ReplacementKitRequestCreateResponseDto } from 'src/admin/dto/admin-replacement-kit.dto';
import type { KitReplacementRequest } from '../entity/kit-replacement-request.entity';

export const toReplacementKitRequestResponse = (
  entity: KitReplacementRequest,
): ReplacementKitRequestCreateResponseDto['data'] => ({
  id: entity.id,
  referenceId: entity.referenceId,
  targetType: entity.targetType,
  practitionerId: entity.practitionerId,
  firstName: entity.firstName,
  lastName: entity.lastName,
  email: entity.email,
  kitType: entity.kitType as KitType,
  currency: entity.currency as Currency,
  quantity: entity.quantity,
  country: entity.country,
  addressLineOne: entity.addressLineOne,
  addressLineTwo: entity.addressLineTwo,
  city: entity.city,
  state: entity.state,
  postalCode: entity.postalCode,
  status: entity.status,
  paymentUrl: entity.paymentUrl,
  paymentSessionId: entity.paymentSessionId ?? null,
  paymentDate: entity.paymentDate?.toISOString() ?? null,
  createdByAdminId: entity.createdByAdminId,
  createdAt: entity.createdAt?.toISOString(),
  updatedAt: entity.updatedAt?.toISOString(),
});
