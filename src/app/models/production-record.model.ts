export interface ProductionRecord {
  productionRecordGuid: string;
  dateOfProduction: string;
  productionOfCost: number;
  productionRate: number;
  zFieldId: number;
  fieldName: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy: string;
}

export interface AddProductionRecordDto {
  dateOfProduction: string;
  productionOfCost: number;
  productionRate: number;
  zFieldId: number;
}

export interface UpdateProductionRecordDto {
  productionRecordGuid: string;
  dateOfProduction: string;
  productionOfCost: number;
  productionRate: number;
  zFieldId: number;
}

export interface ProductionRecordFilter {
  search?: string;
  startDate?: string;
  endDate?: string;
  zFieldId?: number;
  minProductionRate?: number;
  maxProductionRate?: number;
  year?: number;
}
