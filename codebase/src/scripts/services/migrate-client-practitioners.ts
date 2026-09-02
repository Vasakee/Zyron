import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { ClientPractitioner } from 'src/practitioner/entity/client-practitioner.entity';
import { MigrateDataSharingDto } from '../dto/migrate-client-practitioner.dto';
import { GetDataSharing } from '../api/requests/get-data-sharing';
import { GetAltDataSharing } from '../api/requests/get-alt-data-sharing';

@Injectable()
export class MigrateClientPractitionersService {
  private readonly logger = new Logger(MigrateClientPractitionersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
    @InjectRepository(ClientPractitioner)
    private readonly clientPractitionerRepo: Repository<ClientPractitioner>,
  ) {}

  async execute(): Promise<void> {
    try {
      const [users, practitioners] = await Promise.all([
        this.userRepo.find(),
        this.practitionerRepo.find({ relations: ['user'] }),
      ]);

      const userMap = new Map(users.map(user => [user.email, user]));
      const practitionerMap = new Map(practitioners.map(practitioner => [practitioner.user.email, practitioner]));

      const [dataSharing, altDataSharing] = await Promise.all([GetDataSharing(), GetAltDataSharing()]);

      const sharings = [...dataSharing, ...altDataSharing];

      const validSharings = sharings.filter(
        sharing => userMap.has(sharing.client_email) && practitionerMap.has(sharing.practitioner_email)
      );

      const existingRelations = await this.clientPractitionerRepo.find({
        where: validSharings.map(sharing => ({
          userId: userMap.get(sharing.client_email)?.id,
          practitionerId: practitionerMap.get(sharing.practitioner_email)?.id,
        })),
      });

      const existingRelationSet = new Set(
        existingRelations.map(relation => `${relation.userId}-${relation.practitionerId}`)
      );

      const newRelations = validSharings.filter(
        sharing => !existingRelationSet.has(
          `${userMap.get(sharing.client_email)?.id}-${practitionerMap.get(sharing.practitioner_email)?.id}`
        )
      ).map(sharing => {
        const clientPractitioner = new ClientPractitioner();
        clientPractitioner.userId = userMap.get(sharing.client_email)!.id;
        clientPractitioner.practitionerId = practitionerMap.get(sharing.practitioner_email)!.id;
        return clientPractitioner;
      });

      if (newRelations.length > 0) {
        await this.clientPractitionerRepo.save(newRelations);
      }
    } catch (error) {
      this.logger.error('Error migrating client practitioners', error);
      throw error;
    }
  }
}
