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
import { CreateTiendaIbkDto } from './dto/create-tienda-ibk.dto';
import { FilterTiendasIbkDto } from './dto/filter-tiendas-ibk.dto';
import { UpdateEstadoServicioDto } from './dto/update-estado-servicio.dto';
import { UpdateTiendaIbkDto } from './dto/update-tienda-ibk.dto';
import { TiendasIbkService } from './tiendas-ibk.service';

@Controller('tiendas-ibk')
@UseInterceptors(CacheInterceptor)
export class TiendasIbkController {
  constructor(private readonly tiendasIbkService: TiendasIbkService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateTiendaIbkDto) {
    return this.tiendasIbkService.create(dto);
  }

  @Get()
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findAll(@Query() query: FilterTiendasIbkDto) {
    return this.tiendasIbkService.findAll(query);
  }

  @Get(':id')
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiendasIbkService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTiendaIbkDto) {
    return this.tiendasIbkService.update(id, dto);
  }

  @Patch(':id/estado-servicio')
  @Roles(UserRole.ADMIN)
  updateEstadoServicio(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoServicioDto,
  ) {
    return this.tiendasIbkService.updateEstadoServicio(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tiendasIbkService.remove(id);
  }
}
