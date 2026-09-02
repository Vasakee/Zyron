import { ClientPractitioner } from 'src/practitioner/entity/client-practitioner.entity';

export class CreateClientPractitionerDto {
  practitionerId: string;

  reportAccess: string;

  public toEntity(payload: CreateClientPractitionerDto) {
    const data = new ClientPractitioner();
    data.practitionerId = payload.practitionerId;
    data.reportAccess = payload.reportAccess;
    return data;
  }
}
