import SellerBaseService from "@/lib/seller-api.service";
import type { UpdateProfilePayload } from "./types";

class ProfileApiService extends SellerBaseService {
  constructor() {
    super("auth");
  }

  async getMe() {
    return await this.get("me");
  }

  /** Partial update — only send the keys that changed. Returns the same shape as getMe(). */
  async updateMe(data: UpdateProfilePayload) {
    return await this.patch("me", data);
  }

  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return await this.post("change-password", data, undefined, false);
  }

  /** Validate the current password on blur, before the form is submitted. */
  async checkOldPassword(password: string): Promise<{ valid: boolean }> {
    return (await this.post(
      "check-old-password",
      { password },
      undefined,
      false,
    )) as unknown as { valid: boolean };
  }
}

export const profileApiService = new ProfileApiService();
export default profileApiService;
