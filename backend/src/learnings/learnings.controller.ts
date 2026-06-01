import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { LearningsService } from './learnings.service';

@Controller('api/learnings')
export class LearningsController {
  constructor(private readonly learningsService: LearningsService) {}

  @Get()
  findAll(
    @Query('tab') tab?: string,
    @Query('topic') topic?: string,
    @Query('subtopic') subtopic?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.learningsService.findAll({
      tab,
      topic,
      subtopic,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('topics')
  findAllTopics() {
    return this.learningsService.findAllTopics();
  }

  @Get('subtopics')
  findAllSubtopics() {
    return this.learningsService.findAllSubtopics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningsService.findOne(id);
  }

  @Patch(':id')
  patch(
    @Param('id') id: string,
    @Body()
    body: {
      is_learned?: boolean;
      is_favorite?: boolean;
      subtopic_id?: number | null;
    },
  ) {
    return this.learningsService.patch(id, body);
  }

  @Post('add')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  addManual(
    @Body()
    body: {
      url?: string;
      text?: string;
      topic?: string;
      title?: string;
      imageUrl?: string;
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.learningsService.addManual({
      ...body,
      image: file?.buffer,
      imageFilename: file?.originalname,
    });
  }

  @Post('upsert')
  @UseGuards(ApiKeyGuard)
  upsert(@Body() body: unknown) {
    let learnings: unknown[] = [];
    if (Array.isArray(body)) {
      learnings = body;
    } else if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      const candidates = obj.learnings || obj.items;
      if (Array.isArray(candidates)) {
        learnings = candidates;
      }
    }
    return this.learningsService.upsert(
      learnings as {
        title: string;
        source_url: string;
        source_type?: string;
        topic?: string;
        description?: string;
      }[],
    );
  }
}
