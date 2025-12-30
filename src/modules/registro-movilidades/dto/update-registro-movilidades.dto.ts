import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistroMovilidadesDto } from './create-registro-movilidades.dto';

export class UpdateRegistroMovilidadesDto extends PartialType(CreateRegistroMovilidadesDto) {}
