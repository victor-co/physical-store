import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiOkResponse({ description: 'API Online' })
  getHello(): string {
    return 'Physical Store API';
  }
}
