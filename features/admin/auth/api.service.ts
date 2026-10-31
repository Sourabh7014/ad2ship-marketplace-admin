import BaseService from "@/lib/api.service";

interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

interface OTPResponse {
  email: string;
}

class authService extends BaseService {
  constructor() {
    super("auth");
  }


  async sendOTP(data: { mobile?: string; email?: string }) {
    return await this.post("login", data, {}, false);
  }

  async verifyOTP(data: { mobile?: string; email?: string; otp: string }) {
    return await this.post("verify-otp", data, {}, false);
  }


  async refreshToken(data: { refreshToken: string }) {
    return await this.post("refresh", data, {}, false);
  }


  async logout() {
    return await this.post("logout", {});
  }


  async requestOTP(data: { email: string }) {
    return await this.post("otp/request", data, {}, false);
  }


  async login(data: { email: string; password: string }) {
    return await this.post("login", data);
  }

  async forgotPassword(data: { email: string }) {
    return await this.post("forgot-password", data);
  }

  async resetPassword(data: {
    otp: string;
    password: string;
    password_confirmation: string;
  }) {
    return await this.post("reset-password", data);
  }
}

export default new authService();
