export interface UserLogin {
  username: string;
  passwordHash: string;
  rememberMe?: boolean;
}

export interface UserInfo {
  userId: number;
  username: string;
  fullName: string;
  phoneNumber: string;
  img: any;
  token: string;
  role: [];
  zGenderId: number;
  zGenderName: string;
}

export interface UserRegister {
  userId: number;
  username: string;
  password: string;
  userRole: string;
}

export interface ChangePassword {
  userName: string;
  currentPassword: string;
  newPassword: string;
}

export interface GenericResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  errors?: string[];
}
