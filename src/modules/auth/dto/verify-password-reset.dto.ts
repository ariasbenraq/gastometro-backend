import { IsEmail, IsString } from 'class-validator';

export class VerifyPasswordResetDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}
