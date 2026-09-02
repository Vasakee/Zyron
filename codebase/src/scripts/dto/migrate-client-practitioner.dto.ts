import { PractitionerAccessStatus } from 'src/enum';
import { ClientPractitioner } from 'src/practitioner/entity/client-practitioner.entity';

export class MigrateDataSharingDto {
  client_name: string;
  client_email: string;
  client_identifier: string;
  practitioner_name: string;
  practitioner_email: string;
  practitioner_identifier: string;

  public toEntity(userId: string, practitionerId) {
    const data = new ClientPractitioner();
    data.userId = userId;
    data.practitionerId = practitionerId;
    data.reportAccess = PractitionerAccessStatus.GRANTED;
    return data;
  }
}
