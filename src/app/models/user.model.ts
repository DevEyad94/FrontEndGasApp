export interface User {
  userID?: number;
  username: string;
  fullName: string;
  phoneNumber: string;
  role: string[];
  token: string;
}

export interface UserLoginDto {
  username: string;
  passwordHash: string;
}

export interface UserResponse {
  data: User;
  success: boolean;
  message: string;
}
