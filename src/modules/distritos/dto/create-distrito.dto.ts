import { IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateDistritoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @Length(6, 6)
  ubigeo: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigo_postal_ref?: string;
}
