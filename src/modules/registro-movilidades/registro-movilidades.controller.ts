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
import {
  AuthenticatedUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { CreateRegistroMovilidadesDto } from './dto/create-registro-movilidades.dto';
import { FilterRegistroMovilidadesDto } from './dto/filter-registro-movilidades.dto';
import { UpdateRegistroMovilidadesDto } from './dto/update-registro-movilidades.dto';
import { RegistroMovilidadesService } from './registro-movilidades.service';

@Controller('registro-movilidades')
@UseInterceptors(CacheInterceptor)
export class RegistroMovilidadesController {
  constructor(private readonly registroService: RegistroMovilidadesService) {}

  @Post()
  create(
    @Body() dto: CreateRegistroMovilidadesDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.registroService.create(dto, userId);
  }

  @Get()
  @CacheTTL(60)
  findAll(
    @Query() query: FilterRegistroMovilidadesDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.registroService.findAll(query, userId);
  }

  @Get(':id')
  @CacheTTL(60)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.registroService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegistroMovilidadesDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.registroService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.registroService.remove(id, userId);
  }
}
