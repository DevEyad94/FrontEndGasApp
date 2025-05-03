export interface DashboardFilter {
  minProductionRate?: number;
  maxProductionRate?: number;
  extractionYear?: number;
  fromYear?: number;
  toYear?: number;
  maintenanceTypeId?: number;
  minCost?: number;
  maxCost?: number;
}

export interface RegionDistribution {
  regionName: string;
  fieldCount: number;
}

export interface ProductionRateChartItem {
  period: string;
  productionRate: number;
}

export interface MaintenanceCostChartItem {
  period: string;
  cost: number;
}

export interface FieldData {
  fieldId: number;
  fieldName: string;
  latitude: number;
  longitude: number;
  productionRate: number;
  extractionYear: number;
  maintenanceType: string;
  maintenanceCost: number;
  lastMaintenanceDate: string;
}

export interface DashboardResponse {
  totalProductionRate: number;
  totalMaintenanceCost: number;
  regionDistribution: RegionDistribution[];
  productionRateChart: ProductionRateChartItem[];
  maintenanceCostChart: MaintenanceCostChartItem[];
  fieldData: FieldData[];
}
