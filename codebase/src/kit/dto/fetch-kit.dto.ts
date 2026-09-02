import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { FamilyKit } from '../entity/family-kit.entity';
import { Kit } from '../entity/kit.entity';
import { PractitionerKit } from '../entity/practitioner-kits.entity';

export class FetchKitsDto {
  public fromFamilyEntity(payload: FamilyKit) {
    const data = new FamilyKit();
    data.id = payload.id;
    data.name = payload.name;
    data.userId = payload.userId;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.kitNumber = payload.kitNumber;
    data.status = payload.status;
    data.lockStatus = payload.lockStatus;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.dateReceivedByLab = payload.dateReceivedByLab;
    data.resultsAvailable = payload.resultsAvailable;
    data.pdfUrl = payload.pdfUrl;
    data.summaryUrl = payload.summaryUrl;
    data.taxonomyUrl = payload.taxonomyUrl;
    data.fastQUrl = payload.fastQUrl;

    data.user = payload.user;
    data.createdAt = payload.createdAt;
    return data;
  }

  public fromPractitionerEntity(payload: PractitionerKit) {
    const data = new PractitionerKit();
    data.id = payload.id;
    data.name = payload.name;
    data.practitionerId = payload.practitionerId;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.kitNumber = payload.kitNumber;
    data.kitType = payload.kitType;
    data.healthInfoCompleted = payload.healthInfoCompleted;
    data.submitted = payload.submitted;
    data.status = payload.status;
    data.lockStatus = payload.lockStatus;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.dateReceivedByLab = payload.dateReceivedByLab;
    data.resultsAvailable = payload.resultsAvailable;
    data.pdfUrl = payload.pdfUrl;
    data.summaryUrl = payload.summaryUrl;
    data.taxonomyUrl = payload.taxonomyUrl;
    data.fastQUrl = payload.fastQUrl;
    data.amrUrl = payload.amrUrl;
    data.practitioner = payload.practitioner;
    data.registeredViaAuto = payload.registeredViaAuto;
    data.createdAt = payload.createdAt;
    return data;
  }

  public fromKitEntity(payload: Kit, practitioner: Practitioner) {
    const data: any = {};
    data.id = payload.id;
    data.name = `${payload.user.firstName} ${payload.user.lastName}`;
    data.practitionerId = practitioner.id;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.kitNumber = payload.kitNumber;
    data.kitType = payload.kitType;
    data.healthInfoCompleted = payload.healthInfoCompleted;
    data.submitted = payload.submitted;
    data.status = payload.status;
    data.lockStatus = payload.lockStatus;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.dateReceivedByLab = payload.dateReceivedByLab;
    data.resultsAvailable = payload.resultsAvailable;
    data.pdfUrl = payload.pdfUrl;
    data.summaryUrl = payload.summaryUrl;
    data.taxonomyUrl = payload.taxonomyUrl;
    data.fastQUrl = payload.fastQUrl;
    data.amrUrl = payload.amrUrl;
    data.createdAt = payload.createdAt;
    return data;
  }
}
