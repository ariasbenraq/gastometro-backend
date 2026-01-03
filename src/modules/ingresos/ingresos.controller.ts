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
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Request } from 'express';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { FilterIngresosDto } from './dto/filter-ingresos.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { IngresosService } from './ingresos.service';

type AuthenticatedRequest = Request & { user?: { userId?: number } };

@Controller('ingresos')
@UseInterceptors(CacheInterceptor)
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

  @Post()
  create(@Body() dto: CreateIngresoDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.ingresosService.create(dto, userId);
  }

  @Get()
  @CacheTTL(60)
  findAll(@Query() query: FilterIngresosDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.ingresosService.findAll(query, userId);
  }

  @Get(':id')
  @CacheTTL(60)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.ingresosService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIngresoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    return this.ingresosService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.ingresosService.remove(id, userId);
  }
}
