import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FilterRegistroMovilidadesDto {
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
