import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGastoDto {
  @IsDateString()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  item: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsNumber()
  monto: number;

  @IsOptional()
  @IsNumber()
  aprobadoPorId?: number;
}
