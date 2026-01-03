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
import { CreateGastoDto } from './dto/create-gasto.dto';
import { FilterGastosDto } from './dto/filter-gastos.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { GastosService } from './gastos.service';

type AuthenticatedRequest = Request & { user?: { userId?: number } };

@Controller('gastos')
@UseInterceptors(CacheInterceptor)
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(@Body() dto: CreateGastoDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.gastosService.create(dto, userId);
  }

  @Get()
  @CacheTTL(60)
  findAll(@Query() query: FilterGastosDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.gastosService.findAll(query, userId);
  }

  @Get(':id')
  @CacheTTL(60)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.gastosService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGastoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    return this.gastosService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.gastosService.remove(id, userId);
  }
}
