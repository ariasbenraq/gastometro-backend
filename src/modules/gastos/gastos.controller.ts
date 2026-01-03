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
import { CreateGastoDto } from './dto/create-gasto.dto';
import { FilterGastosDto } from './dto/filter-gastos.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { GastosService } from './gastos.service';

@Controller('gastos')
@UseInterceptors(CacheInterceptor)
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(
    @Body() dto: CreateGastoDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.gastosService.create(dto, userId);
  }

  @Get()
  @CacheTTL(60)
  findAll(
    @Query() query: FilterGastosDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.gastosService.findAll(query, userId);
  }

  @Get(':id')
  @CacheTTL(60)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.gastosService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGastoDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.gastosService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.gastosService.remove(id, userId);
  }
}
