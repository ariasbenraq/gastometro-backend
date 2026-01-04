import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateIngresoDto {
  @IsDateString()
  fecha: string;

  @IsNumber()
  monto: number;

  @IsOptional()
  @IsNumber()
  depositadoPorId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usuarioId?: number;
}
