import { IsOptional, IsString } from 'class-validator';

export class FilterIngresosDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  q?: string;
}
