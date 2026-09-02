import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  MAILGUN_DEEPGUT_PLUS_PREORDER_TEMPLATE,
  MAILGUN_PRACTITIONER_KIT_ORDER_TEMPLATE,
  POSTMARK_VERIFIED_EMAIL,
} from 'src/config/keys';
import { KitType } from 'src/enum';
import { mailService } from '../../mail/mail';
import { PractitionerKitPurchaseEvent } from '../events/practitioner-kit-purchase';
import { MailGunTemplateMessageInterface } from 'src/mail/types';

@Injectable()
export class PractitionerKitPurchaseListener {
  @OnEvent('practitioner.kit.purchase', { async: true })
  async handleEvent(event: PractitionerKitPurchaseEvent) {
    const template =
      event.kitType === KitType.DeepGutPlus
        ? MAILGUN_DEEPGUT_PLUS_PREORDER_TEMPLATE
        : MAILGUN_PRACTITIONER_KIT_ORDER_TEMPLATE;
    const msg: MailGunTemplateMessageInterface = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      cc: POSTMARK_VERIFIED_EMAIL,
      template,
      variables: {
        customerName: event.customerName,
        practitionerName: event.practitionerName,
        firstName: event.practitionerName,
        address: event.address,
        date: event.date,
      },
    };

    await mailService.sendEMailWithTemplate(msg);
  }
}
