export class DashboardTopDistritoDto {
  id: number;
  nombre: string;
  total: number;
}

export class DashboardMovilidadesByMonthDto {
  month: number;
  total: number;
}

export class DashboardLatestMovilidadDto {
  id: number;
  fecha: string;
  motivo: string;
  detalle: string;
  monto: number;
}

export class DashboardSummaryResponseDto {
  year: number;
  month: number;
  totals: {
    totalIngresos: number;
    totalGastos: number;
    totalMovilidades: number;
    balance: number;
  };
  latestMovilidades: DashboardLatestMovilidadDto[];
  topDistritos: DashboardTopDistritoDto[];
  movilidadesByMonth: DashboardMovilidadesByMonthDto[];
}
