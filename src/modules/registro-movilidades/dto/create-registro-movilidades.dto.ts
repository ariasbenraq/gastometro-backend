import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRegistroMovilidadesDto {
  @IsDateString()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  inicio: string;

  @IsString()
  @IsNotEmpty()
  fin: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsString()
  @IsNotEmpty()
  detalle: string;

  @IsNumber()
  monto: number;

  @IsOptional()
  @IsNumber()
  tiendaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @IsString()
  @IsNotEmpty()
  ticket: string;
}
