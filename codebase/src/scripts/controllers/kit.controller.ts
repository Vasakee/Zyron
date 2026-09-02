import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { SuccessResponseType, successResponse } from 'src/common/utils';
import { KitTransferService } from '../services/kit-transfer';
import { KitTransferDto } from '../dto/transfer-kit.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('kit-transfer')
@Controller('script/kit')
export class KitScriptsController {
  constructor(private readonly kitTransferService: KitTransferService) {}

  @Post('/transfer')
  @HttpCode(201)
  async migrateKits(
    @Body() data: KitTransferDto,
  ): Promise<SuccessResponseType> {
    const result = await this.kitTransferService.execute(data);
    return successResponse({
      message: 'Kit transfer complete',
      code: HttpStatus.OK,
      status: 'created',
      data: result,
    });
  }
}
