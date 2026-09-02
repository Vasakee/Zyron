import { DataSource, Repository } from 'typeorm';
import { Reminder } from '../entity/reminder.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupoortMailStatus } from 'src/enum';

@Injectable()
export class SeedReminders {
  private readonly logger = new Logger(SeedReminders.name);
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepo: Repository<Reminder>,
  ) {}

  async execute() {
    const remindersToSeed = [
      {
        slug: 'waitlist-payment',
        name: 'firstreminder',
        date: new Date('2025-03-26T10:00:00-05:00'),
        status: SupoortMailStatus.PENDING,
      },
      {
        slug: 'waitlist-payment',
        name: 'secondreminder',
        date: new Date('2025-03-31T10:00:00-05:00'),
        status: SupoortMailStatus.PENDING,
      },
    ];
    for (const reminderData of remindersToSeed) {
      const existingReminder = await this.reminderRepo.findOne({
        where: { slug: reminderData.slug, name: reminderData.name },
      });

      if (!existingReminder) {
        const reminder = this.reminderRepo.create(reminderData);
        await this.reminderRepo.save(reminder);
        this.logger.log(`Reminder ${reminderData.name} seeded successfully!`);
      } else {
        console.log('Reminder already exists, skipping seeding.');
      }
    }
  }
}
