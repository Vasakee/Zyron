import { AccountRoles, PasswordUpdateStatus } from 'src/enum';
import { User } from 'src/user/entity/user.entity';

export class MigrateUsersDto {
  Name: string;
  Email: string;
  public toEntity(payload: MigrateUsersDto, passwordHash: string) {
    const data = new User();
    const { firstName, lastName } = this.splitName(payload.Name);
    data.firstName = firstName;
    data.lastName = lastName;
    data.email = payload.Email;
    data.receiveMarketing = 0;
    data.role = AccountRoles.USER;
    data.password = passwordHash;
    data.passwordUpdateStatus = PasswordUpdateStatus.Pending;
    data.emailVerifiedAt = new Date()
    return data;
  }

  private splitName(name) {
    const names = name.split(' ');
    let firstNames = [];
    let lastNames = [];

    if (names.length <= 2) {
      firstNames = names.slice(0, 1);
      lastNames = names.slice(1);
    } else if (names.length === 3) {
      firstNames = names.slice(0, 1);
      lastNames = names.slice(1);
    } else if (names.length >= 4) {
      firstNames = names.slice(0, 2);
      lastNames = names.slice(2);
    }

    return {
      firstName: firstNames.join(' '),
      lastName: lastNames.join(' '),
    };
  }
}
