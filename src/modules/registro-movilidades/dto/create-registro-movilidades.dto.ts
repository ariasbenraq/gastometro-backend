import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateRegistroMovilidadesDto {
  @IsDateString()
  fecha: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  inicioId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  finId: number;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsString()
  @IsNotEmpty()
  detalle: string;

  @IsNumber()
  monto: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  clienteId: number;

  @IsString()
  @IsNotEmpty()
  wo: string;
}
