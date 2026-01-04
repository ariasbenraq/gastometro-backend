import {
  BadRequestException,
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

  private resolveUserId(user?: AuthenticatedUser, requestedUserId?: number) {
    if (user?.rol === UserRole.USER) {
      return user.userId;
    }

    return requestedUserId;
  }

  @Post()
  @Roles(UserRole.ANALYST_BALANCE)
  create(@Body() dto: CreateIngresoDto) {
    if (!dto.usuarioId) {
      throw new BadRequestException(
        'El usuario es obligatorio para registrar ingresos.',
      );
    }

    const userId = dto.usuarioId;
    return this.ingresosService.create(dto, userId);
  }

  @Get()
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findAll(
    @Query() query: FilterIngresosDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user, query.userId);
    return this.ingresosService.findAll(query, userId);
  }

  @Get(':id')
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.ingresosService.findOne(id, userId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIngresoDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.ingresosService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.ingresosService.remove(id, userId);
  }
}
