import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CreateRegistroMovilidadesDto } from './dto/create-registro-movilidades.dto';
import { FilterRegistroMovilidadesDto } from './dto/filter-registro-movilidades.dto';
import { UpdateRegistroMovilidadesDto } from './dto/update-registro-movilidades.dto';
import { RegistroMovilidadesService } from './registro-movilidades.service';

@Controller('registro-movilidades')
@UseInterceptors(CacheInterceptor)
export class RegistroMovilidadesController {
  constructor(private readonly registroService: RegistroMovilidadesService) {}

  @Post()
  create(@Body() dto: CreateRegistroMovilidadesDto) {
    return this.registroService.create(dto);
  }

  @Get()
  @CacheTTL(60)
  findAll(@Query() query: FilterRegistroMovilidadesDto) {
    return this.registroService.findAll(query);
  }

  @Get(':id')
  @CacheTTL(60)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.registroService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegistroMovilidadesDto,
  ) {
    return this.registroService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.registroService.remove(id);
  }
}
