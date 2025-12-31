import { IsOptional, IsString } from 'class-validator';

export class FilterGastosDto {
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
