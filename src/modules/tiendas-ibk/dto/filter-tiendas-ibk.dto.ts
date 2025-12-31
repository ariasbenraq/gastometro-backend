import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterTiendasIbkDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estadoServicioId?: number;

  @IsOptional()
  @IsString()
  q?: string;
}
