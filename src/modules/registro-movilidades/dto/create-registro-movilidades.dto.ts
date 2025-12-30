import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  ticket: string;
}
