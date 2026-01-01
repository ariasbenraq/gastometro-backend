import { IsNumber } from 'class-validator';

export class UpdateEstadoServicioDto {
  @IsNumber()
  estadoServicioId: number;
}
