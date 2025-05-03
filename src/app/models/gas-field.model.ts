export interface GasField {
  zFieldId: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface GasFieldResponse {
  data: GasField[];
  success: boolean;
  message: string;
}
