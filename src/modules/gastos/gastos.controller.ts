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
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { FilterGastosDto } from './dto/filter-gastos.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { GastosService } from './gastos.service';

@Controller('gastos')
@UseInterceptors(CacheInterceptor)
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  create(
    @Body() dto: CreateGastoDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.gastosService.create(dto, user);
  }

  @Get()
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findAll(
    @Query() query: FilterGastosDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.gastosService.findAll(query, user);
  }

  @Get(':id')
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.gastosService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGastoDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.gastosService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.gastosService.remove(id, user);
  }
}
