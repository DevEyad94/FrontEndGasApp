export interface MaintenanceType {
  zMaintenanceTypeId: number;
  name: string;
  code: string;
}

export interface MaintenanceTypeResponse {
  data: MaintenanceType[];
  success: boolean;
  message: string;
}
