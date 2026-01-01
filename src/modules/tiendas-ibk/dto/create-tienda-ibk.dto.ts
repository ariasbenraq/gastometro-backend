import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTiendaIbkDto {
  @IsString()
  @IsNotEmpty()
  codigo_tienda: string;

  @IsString()
  @IsNotEmpty()
  nombre_tienda: string;

  @IsString()
  @IsNotEmpty()
  distrito: string;

  @IsString()
  @IsNotEmpty()
  provincia: string;

  @IsString()
  @IsNotEmpty()
  departamento: string;

  @IsOptional()
  @IsNumber()
  estadoServicioId?: number;
}
