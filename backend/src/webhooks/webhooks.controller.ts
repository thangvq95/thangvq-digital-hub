// backend/src/webhooks/webhooks.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('sentry')
  @HttpCode(HttpStatus.OK)
  async handleSentry(@Body() payload: any) {
    return this.webhooksService.handleSentryAlert(payload);
  }
}
