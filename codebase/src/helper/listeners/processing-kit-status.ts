import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { updateKitStatusEvent } from '../events/update-kit-status';
@Injectable()
export class ProcessingKitListener {
  @OnEvent('lab.processing', { async: true })
  async execute(event: updateKitStatusEvent) {
    const html = await mailService.renderHtml(
     
      {
        name: `${event.name}`,
        kitId: event.kitId,
      },
      'lab_processing.html',
    );
    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Status of your Kit`,
     html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
