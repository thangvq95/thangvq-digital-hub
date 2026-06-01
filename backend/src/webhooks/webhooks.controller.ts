import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import type { SentryAlertPayload } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('sentry')
  @HttpCode(HttpStatus.OK)
  async handleSentry(@Body() payload: SentryAlertPayload) {
    return this.webhooksService.handleSentryAlert(payload);
  }
}
