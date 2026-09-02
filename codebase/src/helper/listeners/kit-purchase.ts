import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  MAILGUN_CUSTOMER_KIT_ORDER_TEMPLATE,
  MAILGUN_DEEPGUT_PLUS_PREORDER_TEMPLATE,
  VITRACT_SALES_EMAIL,
} from 'src/config/keys';
import { KitType } from 'src/enum';
import { mailService } from '../../mail/mail';
import { KitPurchaseEvent } from '../events/kit-purchase';
import { MailGunTemplateMessageInterface } from 'src/mail/types';

@Injectable()
export class KitPurchaseListener {
  @OnEvent('kit.purchase', { async: true })
  async handleEvent(event: KitPurchaseEvent) {
    const template =
      event.kitType === KitType.DeepGutPlus
        ? MAILGUN_DEEPGUT_PLUS_PREORDER_TEMPLATE
        : MAILGUN_CUSTOMER_KIT_ORDER_TEMPLATE;
    const msg: MailGunTemplateMessageInterface = {
      to: event.email,
      from: VITRACT_SALES_EMAIL,
      cc: VITRACT_SALES_EMAIL,
      template,
      variables: { firstName: event.name },
    };

    await mailService.sendEMailWithTemplate(msg);
  }
}
