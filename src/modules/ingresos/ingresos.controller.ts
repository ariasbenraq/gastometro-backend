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
} from '@nestjs/common';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { FilterIngresosDto } from './dto/filter-ingresos.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { IngresosService } from './ingresos.service';

@Controller('ingresos')
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

  @Post()
  create(@Body() dto: CreateIngresoDto) {
    return this.ingresosService.create(dto);
  }

  @Get()
  findAll(@Query() query: FilterIngresosDto) {
    return this.ingresosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingresosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIngresoDto) {
    return this.ingresosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingresosService.remove(id);
  }
}
