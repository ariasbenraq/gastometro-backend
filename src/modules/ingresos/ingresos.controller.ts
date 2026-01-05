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
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { FilterIngresosDto } from './dto/filter-ingresos.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { IngresosService } from './ingresos.service';

@Controller('ingresos')
@UseInterceptors(CacheInterceptor)
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  create(
    @Body() dto: CreateIngresoDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.ingresosService.create(dto, user);
  }

  @Get()
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findAll(
    @Query() query: FilterIngresosDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.ingresosService.findAll(query, user);
  }

  @Get(':id')
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.ingresosService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIngresoDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.ingresosService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.ingresosService.remove(id, user);
  }
}
