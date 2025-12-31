import { IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MinLength(4)
  @MaxLength(80)
  usuario: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
