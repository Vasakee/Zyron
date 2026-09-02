import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { successResponse, SuccessResponseType } from 'src/common/utils';
import { ReceiveMessageService } from './services/new-message';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly receiveMessageService: ReceiveMessageService,
  ) {}
  @Post('inbound')
  async handleInboundMail(
    @Body() inboundEmail: any,
  ): Promise<SuccessResponseType> {
    const result = await this.receiveMessageService.execute(inboundEmail);
    return successResponse({
      message: 'Message sent successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }
}
