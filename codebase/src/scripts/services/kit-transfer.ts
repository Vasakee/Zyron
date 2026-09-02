import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Kit } from 'src/kit/entity/kit.entity';
import { Repository } from 'typeorm';
import { KitTransferDto } from '../dto/transfer-kit.dto';
import { User } from 'src/user/entity/user.entity';
import { AccountRoles } from 'src/enum';
import { BadRequestErrorException, ForbiddenErrorException, NotFoundErrorException } from 'src/common';
import { ClientPractitioner } from 'src/practitioner/entity/client-practitioner.entity';

@Injectable()
export class KitTransferService {
  private readonly logger = new Logger(KitTransferService.name);

  constructor(
    @InjectRepository(Kit)
    private readonly kitRepo: Repository<Kit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ClientPractitioner)
    private readonly clientPractitionerRepo: Repository<ClientPractitioner>,
  ) {}

  async execute(data: KitTransferDto) {
    try {
      const [kit, user] = await Promise.all([
        this.kitRepo.findOne({
          where: { kitNumber: data.kitId },
          relations: ['user'],
        }),
        this.userRepo.findOne({
          where: {
            email: data.practitionerEmail,
            role: AccountRoles.PRACTITIONER,
          },
          relations: ['practitioner'],
        }),
      ]);

      if (!user) {
        throw new NotFoundErrorException('Practitioner does not exist');
      }

      const transferDto = new KitTransferDto();

      if (kit && kit.user.role === AccountRoles.USER) {
        const clientPractitionerRecord =
          await this.clientPractitionerRepo.findOne({
            where: {
              userId: kit.userId,
              practitionerId: user.practitioner.id,
            },
          });

        if (clientPractitionerRecord) {
          throw new ForbiddenErrorException(
            `The client is already connected to the practitioner with the kit ${data.kitId} - ${kit.user.firstName} ${kit.user.lastName}`,
          );
        }

        const payload = transferDto.toClientPractitionerEntity(
          kit.userId,
          user.practitioner.id,
        );

        return await this.clientPractitionerRepo.save(payload);
      }

      console.log(kit)

      throw new BadRequestErrorException('Kit could not be transferred')
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
