/**
 * Shapes returned by `GET /seller/auth/me`.
 *
 * The seller row is spread at the top level, with the four related records
 * alongside it. Note the API uses `mobile` (not `phone`) and `"y"`/`"n"` flag
 * strings rather than booleans.
 */

/** basic_informations — business profile + GST/PAN numbers. */
export interface BasicInformation {
  id: number;
  sellerId: number;
  companyName: string | null;
  websiteUrl: string | null;
  companyLogo: string | null;
  email: string | null;
  mobile: string | null;
  gstCertificate: string | null;
  panNumber: string | null;
  gstNumber: string | null;
  address: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

/** kyc_information — Aadhaar + PAN identity documents. */
export interface KycInformation {
  id: number;
  sellerId: number;
  documentUpload: string | null;
  documentUploadBack: string | null;
  pancard: string | null;
  panNumber: string | null;
  panName: string | null;
  documentType: string | null;
  documentId: string | null;
  documentName: string | null;
  companyType: string | null;
}

/** account_informations — bank/payout account. */
export interface AccountInformation {
  id: number;
  sellerId: number;
  accountType: string | null;
  accountHolderName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  ifscCode: string | null;
  bankBranch: string | null;
  chequeImage: string | null;
}

/** warehouses — pickup locations. */
export interface SellerWarehouse {
  id: number;
  sellerId: number;
  warehouseName: string | null;
  warehouseCode: string | null;
  contactName: string | null;
  contactNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  gstNumber: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  default: string | null;
  isVerified: boolean | null;
  isDeleted: boolean | null;
  status: boolean | null;
}

export interface SellerMe {
  id: number;
  firstName: string | null;
  lastName: string | null;
  sellerName: string | null;
  companyName: string | null;
  email: string | null;
  /** The API field is `mobile`, not `phone`. */
  mobile: string | null;
  profileImage: string | null;
  balance: string | number | null;
  /** `"y"` once an admin has approved the seller. */
  verified: string | null;
  /** Single-char flags: `"y"` approved, `"p"` pending review, `"n"` rejected. */
  status: string | null;
  documentStatus: string | null;
  gstCertificateStatus: string | null;
  chequeStatus: string | null;
  warehouseStatus: string | null;
  isEmailVerify: string | null;
  isPhoneVerify: string | null;
  createdAt: string | null;

  basicInformation: BasicInformation | null;
  accountInformation: AccountInformation | null;
  kycInformation: KycInformation[];
  warehouses: SellerWarehouse[];
}

/** Body for `PATCH /seller/auth/me` — every field optional, only changed keys sent. */
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  mobile?: string;

  businessEmail?: string;
  websiteUrl?: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  panNumber?: string;
  gstNumber?: string;

  aadharName?: string;
  aadharNumber?: string;
  panName?: string;

  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  bankBranch?: string;
}

/** Normalized review state derived from the single-char backend flags. */
export type ReviewStatus = "approved" | "pending" | "rejected" | "missing";

export function mapReviewStatus(
  flag: string | null | undefined,
  sellerVerified?: string | null,
): ReviewStatus {
  if (sellerVerified === "y") return "approved";
  if (flag === "y") return "approved";
  if (flag === "p") return "pending";
  if (flag === "n") return "rejected";
  return "missing";
}

export const isFlagTrue = (flag: string | null | undefined) => flag === "y";
