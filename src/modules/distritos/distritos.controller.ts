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
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { CreateDistritoDto } from './dto/create-distrito.dto';
import { FilterDistritosDto } from './dto/filter-distritos.dto';
import { UpdateDistritoDto } from './dto/update-distrito.dto';
import { DistritosService } from './distritos.service';

@Controller('distritos')
@UseInterceptors(CacheInterceptor)
export class DistritosController {
  constructor(private readonly distritosService: DistritosService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateDistritoDto) {
    return this.distritosService.create(dto);
  }

  @Get()
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findAll(@Query() query: FilterDistritosDto) {
    return this.distritosService.findAll(query);
  }

  @Get(':id')
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.distritosService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDistritoDto,
  ) {
    return this.distritosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.distritosService.remove(id);
  }
}
