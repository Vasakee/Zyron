import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  POSTMARK_SUPPORT_EMAIL,
  POSTMARK_VERIFIED_EMAIL,
} from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { ContactMessageEvent } from '../events/contact-message';

@Injectable()
export class ContactMessageListener {
  @OnEvent('contact-message.email', { async: true })
  async handleEvent(event: ContactMessageEvent): Promise<void> {
    try {
      const date = new Date();
      const year = date.getFullYear();

      const html = await mailService.renderHtml(
        {
          name: event.name,
          email: event.email,
          phone: event.phone || 'Not provided',
          message: event.message,
          hasAttachment: event.attachments && event.attachments.length > 0,
          year,
        },
        'contact_message.html',
      );

      const msg = {
        to: POSTMARK_SUPPORT_EMAIL,
        from: POSTMARK_VERIFIED_EMAIL,
        subject: `Contact Message from ${event.name}`,
        html: String(html),
        text: event.message || 'See attached contact message',
        attachment: event.attachments,
      };

      await mailService.sendMail(msg);
    } catch (error) {
      console.error('Failed to send contact message email:', error);
      throw error;
    }
  }
}
