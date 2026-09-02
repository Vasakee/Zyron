import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactMessageDto } from '../dto/create-contact-message.dto';
import { ContactMessage } from '../entity/contact-message.entity';
import { slugifyText } from '../../common/utils';
import { BUCKET_NAME, S3_ENDPOINT } from '../../config';
import { S3BucketService } from '../../aws/services/s3-bucket.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContactMessageEvent } from '../../helper/events/contact-message';

@Injectable()
export class ContactMessageService {
  private readonly logger = new Logger(ContactMessageService.name);
  public createContactMessageDto = new CreateContactMessageDto();

  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
    private readonly s3BucketService: S3BucketService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  protected bucketName = BUCKET_NAME;

  async handleContactSubmission(
    contactData: CreateContactMessageDto,
    file?: Express.Multer.File,
  ): Promise<ContactMessage> {
    try {
      if (file) {
        contactData.fileUrl = await this.saveFile(file);
      }

      const contact = await this.saveContact(contactData);

      await this.sendContactEmailToAdmin(contact, file);

      this.logger.log(
        `Contact form submitted and saved by ${contact.name} (${contact.email})`,
      );

      return contact;
    } catch (error) {
      this.logger.error('Failed to process contact form submission', error);
      throw new Error(
        'Failed to process contact form. Please try again later.',
      );
    }
  }

  private async saveContact(
    contactData: CreateContactMessageDto,
  ): Promise<ContactMessage> {
    const contact = this.createContactMessageDto.toEntity(contactData);

    const result = await this.contactRepository.save(contact);

    return this.createContactMessageDto.fromEntity(result);
  }

  private async saveFile(file: Express.Multer.File): Promise<string> {
    const extension = file.originalname.split('.').pop();
    const timestamp = Date.now();
    const name = `${slugifyText('Contact message')}-${timestamp}.${extension}`;

    await this.s3BucketService.s3Upload({
      file: file.buffer,
      bucket: this.bucketName,
      name,
      mimetype: file.mimetype,
    });

    return `${S3_ENDPOINT}/${name}`;
  }

  async findAll(): Promise<ContactMessage[]> {
    return await this.contactRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ContactMessage> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new Error('Contact not found');
    }
    return contact;
  }

  private async sendContactEmailToAdmin(
    contact: ContactMessage,
    file?: Express.Multer.File,
  ): Promise<void> {
    const attachments = file
      ? [
          {
            filename: file.originalname,
            data: file.buffer,
            contentType: file.mimetype,
          },
        ]
      : [];

    const mailData: ContactMessageEvent = {
      name: contact.name,
      subject: `New Contact Form Submission from ${contact.name}`,
      email: contact.email,
      phone: contact.phone || 'Not provided',
      message: contact.message,
      hasAttachment: !!file,
      attachments,
    };

    this.eventEmitter.emit('contact-message.email', mailData);
  }
}
