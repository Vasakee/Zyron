import {
  MailGunMessageInterface,
  MailGunTemplateMessageInterface,
  ObjectLiteral,
} from './types';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';
import Mailgun from 'mailgun.js';
import * as FormData from 'form-data';
import { MAILGUN_API_KEY, MAILGUN_DOMAIN, APP_NAME } from 'src/config';

class Service {
  public mailDriver;

  private domain: string;

  constructor(apiKey: string, domain: string) {
    if (
      typeof apiKey !== 'string' ||
      !apiKey ||
      typeof domain !== 'string' ||
      !domain
    ) {
      throw new Error('Invalid API key or domain!');
    }

    const mailgun = new Mailgun(FormData);
    this.mailDriver = mailgun.client({
      username: 'api',
      key: apiKey,
    });

    this.domain = domain;
  }

  async sendEMailWithTemplate(templateProps: MailGunTemplateMessageInterface) {
    try {
      const payload: any = {
        ...templateProps,
        'h:X-Mailgun-Variables': JSON.stringify(templateProps.variables),
      };
      return await this.mailDriver.messages.create(this.domain, payload);
    } catch (error) {
      throw error;
    }
  }

  async sendMail(messageProps: MailGunMessageInterface) {
    try {
      messageProps.from = this.formatFromField(messageProps.from);
      return await this.mailDriver.messages.create(this.domain, messageProps);
    } catch (error) {
      throw error;
    }
  }

  renderHtml(data: ObjectLiteral, template = 'template.html') {
    return new Promise((resolve, reject) => {
      const pathName = path.join(__dirname, `../templates/emails/${template}`);
      this.handleReadFile(pathName, function (err: unknown, html: string) {
        if (err) {
          reject(err);
        }

        const template = handlebars.compile(html);
        const htmlToSend = template(data);

        if (!htmlToSend) {
          reject('Unable to render data to template');
        }

        resolve(htmlToSend);
      });
    });
  }

  private handleReadFile(path: string, callback: (...args: any[]) => void) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
      if (err) {
        throw err;
      } else {
        callback(null, html);
      }
    });
  }

  async processInboundEmail(inboundEmail: any) {
    try {
      console.log('Processing inbound email:', inboundEmail);
    } catch (error) {
      throw error;
    }
  }

  formatFromField(from: string) {
    const rfc5322Regex = /^(".+")?\s*<[^<>]+@[^<>]+>$/;
    if (rfc5322Regex.test(from)) return from;
    return `"${APP_NAME}" <${from}>`;
  }
}

export const mailService = new Service(MAILGUN_API_KEY, MAILGUN_DOMAIN);
