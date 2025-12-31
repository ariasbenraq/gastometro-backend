import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { GastosService } from './gastos.service';

@Controller('gastos')
@UseInterceptors(CacheInterceptor)
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(@Body() dto: CreateGastoDto) {
    return this.gastosService.create(dto);
  }

  @Get()
  @CacheTTL(60)
  findAll() {
    return this.gastosService.findAll();
  }

  @Get(':id')
  @CacheTTL(60)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gastosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGastoDto) {
    return this.gastosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gastosService.remove(id);
  }
}
