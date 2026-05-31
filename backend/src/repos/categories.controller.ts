import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReposService } from './repos.service';

@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly reposService: ReposService) {}

  @Get()
  async findAll() {
    return this.reposService.findAllCategories();
  }

  @Post()
  async create(@Body() body: { name: string }) {
    return this.reposService.createCategory(body.name);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.reposService.updateCategory(Number(id), body.name);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.reposService.deleteCategory(Number(id));
  }
}
