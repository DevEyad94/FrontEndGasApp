export interface FieldMaintenance {
  fieldMaintenanceGuid: string;
  cost: number;
  description: string;
  fieldMaintenanceDate: string;
  zMaintenanceTypeId: number;
  maintenanceTypeName: string;
  zFieldId: number;
  fieldName: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy: string;
}

export interface AddFieldMaintenanceDto {
  cost: number;
  description: string;
  fieldMaintenanceDate: string;
  zMaintenanceTypeId: number;
  zFieldId: number;
}

export interface UpdateFieldMaintenanceDto {
  fieldMaintenanceGuid: string;
  cost: number;
  description: string;
  fieldMaintenanceDate: string;
  zMaintenanceTypeId: number;
  zFieldId: number;
}

export interface FieldMaintenanceFilter {
  search?: string;
  startDate?: string;
  endDate?: string;
  zMaintenanceTypeId?: number;
  zFieldId?: number;
  minCost?: number;
  maxCost?: number;
}
