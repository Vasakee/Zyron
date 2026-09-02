import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health/:page')
  getHealth(@Param('page') page: string) {
    return this.appService.getHealth(page);
  }
}
