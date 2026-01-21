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
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { FilterClientesDto } from './dto/filter-clientes.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
@UseInterceptors(CacheInterceptor)
@Roles(UserRole.ADMIN)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Get()
  @CacheTTL(60)
  findAll(@Query() query: FilterClientesDto) {
    return this.clientesService.findAll(query);
  }

  @Get(':id')
  @CacheTTL(60)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}
