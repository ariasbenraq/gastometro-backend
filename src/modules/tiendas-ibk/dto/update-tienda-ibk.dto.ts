import { PartialType } from '@nestjs/mapped-types';
import { CreateTiendaIbkDto } from './create-tienda-ibk.dto';

export class UpdateTiendaIbkDto extends PartialType(CreateTiendaIbkDto) {}
