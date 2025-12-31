import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  nombre_apellido: string;

  @IsString()
  @MinLength(4)
  @MaxLength(80)
  @Matches(/^[a-zA-Z0-9_\.]+$/, {
    message: 'El usuario solo puede contener letras, números, puntos y guiones bajos.',
  })
  usuario: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.',
    },
  )
  password: string;
}
