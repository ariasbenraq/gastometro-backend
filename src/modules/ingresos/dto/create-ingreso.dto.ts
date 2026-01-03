import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateIngresoDto {
  @IsDateString()
  fecha: string;

  @IsNumber()
  monto: number;

  @IsOptional()
  @IsNumber()
  usuarioId?: number;

  @IsOptional()
  @IsNumber()
  depositadoPorId?: number;
}
