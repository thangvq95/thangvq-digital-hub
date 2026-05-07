// backend/src/sync/sync.controller.ts
import { Controller, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('api/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  getLatest() {
    return this.syncService.getLatest();
  }
}
