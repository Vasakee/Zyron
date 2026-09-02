import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  MAILGUN_ORDER_SHIPPED_TEMPLATE,
  POSTMARK_VERIFIED_EMAIL,
} from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { ShippingUpdateEvent } from '../events/shipping-update';
import { MailGunTemplateMessageInterface } from 'src/mail/types';

@Injectable()
export class ShippingUpdateListener {
  @OnEvent('shipping.update', { async: true })
  async handleEvent(event: ShippingUpdateEvent) {
    const msg: MailGunTemplateMessageInterface = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      cc: POSTMARK_VERIFIED_EMAIL,
      template: MAILGUN_ORDER_SHIPPED_TEMPLATE,
      variables: {
        firstName: event.name,
        link: event.link,
        here: event.here,
      },
    };

    await mailService.sendEMailWithTemplate(msg);
  }
}
