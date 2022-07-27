import { Inject, Injectable } from '@nestjs/common';
import { EmailVar, MailModuleOptions } from './mail.interface';
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}
  async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Outclass <mailgun@${this.options.domain}>`);
    form.append('to', `mlimshs@naver.com`);
    form.append('subject', subject);
    form.append('template', template);
    form.append('v:code', 'abcabc');
    form.append('v:username', 'mh!!');
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));

    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('이메일을 인증해주세요', 'mail_test', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
