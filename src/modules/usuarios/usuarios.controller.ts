import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('usuarios')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE)
  findAll() {
    return this.usuariosService.findAll();
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  approveAnalyst(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.approveAnalyst(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  updateBasic(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.usuariosService.updateBasic(id, dto, user);
  }
}
