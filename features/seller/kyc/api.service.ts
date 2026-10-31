import SellerBaseService from "@/lib/seller-api.service";


class KycApiService extends SellerBaseService {
  constructor() {
    super("kyc");
  }

  async saveKycProfile(data: FormData) {
    return await this.post("profile", data);
  }

  async saveKycDocuments(data: FormData) {
    return await this.post("documents", data);
  }

  async saveKycAccount(data: FormData) {
    return await this.post("account", data);
  }

  async saveKycWarehouse(data: FormData | Record<string, any>) {
    return await this.post("warehouse", data);
  }

  async getKycStatus() {
    return await this.get("status");
  }

  async getKycList() {
    return await this.get("list");
  }

  async getPincodeInfo(pincode: string) {
    return await this.get(`pincode/${pincode}`);
  }
}

export const kycApiService = new KycApiService();
export default kycApiService;
