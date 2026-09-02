import * as postmark from 'postmark';
import type { TemplatedMessage } from 'postmark/dist/client/models/templates/Template';
import { ObjectLiteral } from './types';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';
import { POSTMARK_API_TOKEN } from 'src/config';

class Service {
  public mailDriver;

  constructor(apiToken: string) {
    if (typeof apiToken !== 'string' || !apiToken) {
      throw new Error('Invalid postmak API token!');
    }
    this.mailDriver = new postmark.ServerClient(apiToken);
  }

  async sendEMailWithTemplate(templateProps: TemplatedMessage) {
    try {
      return await this.mailDriver.sendEmailWithTemplate(templateProps);
    } catch (error) {
      throw error;
    }
  }
  async sendMail(messageProps: postmark.Message) {
    try {
      return await this.mailDriver.sendEmail(messageProps);
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
          reject('Unable to renderData to template');
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
}

export const mailService = new Service(POSTMARK_API_TOKEN as string);
