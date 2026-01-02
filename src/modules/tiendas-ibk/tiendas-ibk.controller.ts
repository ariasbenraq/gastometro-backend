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
  create(@Body() dto: CreateTiendaIbkDto) {
    return this.tiendasIbkService.create(dto);
  }

  @Get()
  @CacheTTL(60)
  findAll(@Query() query: FilterTiendasIbkDto) {
    return this.tiendasIbkService.findAll(query);
  }

  @Get(':id')
  @CacheTTL(60)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiendasIbkService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTiendaIbkDto) {
    return this.tiendasIbkService.update(id, dto);
  }

  @Patch(':id/estado-servicio')
  updateEstadoServicio(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoServicioDto,
  ) {
    return this.tiendasIbkService.updateEstadoServicio(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tiendasIbkService.remove(id);
  }
}
