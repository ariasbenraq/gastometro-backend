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

  private resolveUserId(user?: AuthenticatedUser, requestedUserId?: number) {
    return user?.rol === UserRole.USER ? user.userId : requestedUserId;
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  create(
    @Body() dto: CreateGastoDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.gastosService.create(dto, userId);
  }

  @Get()
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findAll(
    @Query() query: FilterGastosDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user, query.userId);
    return this.gastosService.findAll(query, userId);
  }

  @Get(':id')
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.gastosService.findOne(id, userId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGastoDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.gastosService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.gastosService.remove(id, userId);
  }
}
