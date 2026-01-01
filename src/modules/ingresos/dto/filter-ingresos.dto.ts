import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FilterIngresosDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  q?: string;
}
