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
import { CreateRegistroMovilidadesDto } from './dto/create-registro-movilidades.dto';
import { FilterRegistroMovilidadesDto } from './dto/filter-registro-movilidades.dto';
import { UpdateRegistroMovilidadesDto } from './dto/update-registro-movilidades.dto';
import { RegistroMovilidadesService } from './registro-movilidades.service';

@Controller('registro-movilidades')
@UseInterceptors(CacheInterceptor)
export class RegistroMovilidadesController {
  constructor(private readonly registroService: RegistroMovilidadesService) {}

  private resolveUserId(user?: AuthenticatedUser, requestedUserId?: number) {
    if (user?.rol === UserRole.USER) {
      return user.userId;
    }

    return requestedUserId;
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  create(
    @Body() dto: CreateRegistroMovilidadesDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.registroService.create(dto, userId);
  }

  @Get()
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findAll(
    @Query() query: FilterRegistroMovilidadesDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user, query.userId);
    return this.registroService.findAll(query, userId);
  }

  @Get(':id')
  @CacheTTL(60)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.registroService.findOne(id, userId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegistroMovilidadesDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.registroService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.registroService.remove(id, userId);
  }
}
