export class DashboardTopDistritoDto {
  id: number;
  nombre: string;
  total: number;
}

export class DashboardGastosByMonthDto {
  month: number;
  total: number;
}

export class DashboardLatestGastoDto {
  id: number;
  fecha: string;
  item: string;
  motivo: string;
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
  latestGastos: DashboardLatestGastoDto[];
  topDistritos: DashboardTopDistritoDto[];
  gastosByMonth: DashboardGastosByMonthDto[];
}
