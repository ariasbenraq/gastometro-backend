import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FilterGastosDto {
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
