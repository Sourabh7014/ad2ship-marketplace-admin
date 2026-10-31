export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  accessToken: string;
  refreshToken: string;
}

export interface OTPResponse {
  status: boolean;
  message: string;
  data: {
    email: string;
  };
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: AdminUser;
}

export interface VerifyOTPResponse {
  status: boolean;
  message: string;
  data: AdminUser;
}

export interface RefreshTokenResponse {
  status: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface LogoutResponse {
  status: boolean;
  message: string;
  data: null;
}

export interface AuthError {
  status: false;
  message: string;
}
