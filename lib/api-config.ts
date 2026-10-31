


const isClient = typeof window !== "undefined";
const publicApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const internalApiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_INTERNAL_API_BASE_URL;

export const API_BASE_URL = (!isClient && internalApiUrl) ? internalApiUrl : publicApiUrl;
export const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000");


export const ADMIN_API = {
  BASE: `${API_BASE_URL}/api/admin`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/admin/auth/login`,
    OTP_REQUEST: `${API_BASE_URL}/api/admin/auth/otp/request`,
    OTP_VERIFY: `${API_BASE_URL}/api/admin/auth/otp/verify`,
    REFRESH: `${API_BASE_URL}/api/admin/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/api/admin/auth/logout`,
  },
  DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  CUSTOMERS: `${API_BASE_URL}/api/admin/customers`,
  ORDERS: `${API_BASE_URL}/api/admin/orders`,
  PRODUCTS: `${API_BASE_URL}/api/admin/products`,
  CATEGORIES: `${API_BASE_URL}/api/admin/categories`,
  COLLECTIONS: `${API_BASE_URL}/api/admin/collections`,
  SELLERS: `${API_BASE_URL}/api/admin/sellers`,
  PAYMENTS: `${API_BASE_URL}/api/admin/payments`,
  PAYOUTS: `${API_BASE_URL}/api/admin/payouts`,
  ROLES: `${API_BASE_URL}/api/admin/roles`,
  STORES: `${API_BASE_URL}/api/admin/stores`,
  ACTIVITY_LOGS: `${API_BASE_URL}/api/admin/activity-logs`,
  REPORTS: `${API_BASE_URL}/api/admin/reports`,
  CMS: `${API_BASE_URL}/api/admin/cms`,
  SETTINGS: `${API_BASE_URL}/api/admin/settings`,
  MARKETING: `${API_BASE_URL}/api/admin/marketing`,
  THEMES: `${API_BASE_URL}/api/admin/themes`,
};


export const SELLER_API = {
  BASE: `${API_BASE_URL}/seller-api`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/seller-api/auth/login`,
    OTP_REQUEST: `${API_BASE_URL}/seller-api/auth/otp/request`,
    OTP_VERIFY: `${API_BASE_URL}/seller-api/auth/otp/verify`,
    REFRESH: `${API_BASE_URL}/seller-api/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/seller-api/auth/logout`,
  },
  DASHBOARD: `${API_BASE_URL}/seller-api/dashboard`,
  PRODUCTS: `${API_BASE_URL}/seller-api/products`,
  ORDERS: `${API_BASE_URL}/seller-api/orders`,
  PAYMENTS: `${API_BASE_URL}/seller-api/payments`,
  PAYOUTS: `${API_BASE_URL}/seller-api/payouts`,
  INVENTORY: `${API_BASE_URL}/seller-api/inventory`,
  STORE: `${API_BASE_URL}/seller-api/stores`,
  CATEGORIES: `${API_BASE_URL}/seller-api/categories`,
  RETURNS: `${API_BASE_URL}/seller-api/returns`,
  SUPPORT: `${API_BASE_URL}/seller-api/support`,
  SETTINGS: `${API_BASE_URL}/seller-api/settings`,
  ANNOUNCEMENT: `${API_BASE_URL}/seller-api/announcement`,
};


export const COOKIE_KEYS = {
  AUTH_TOKEN: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "authToken",
  REFRESH_TOKEN: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || "refreshToken",
  USER: process.env.NEXT_PUBLIC_USER_KEY || "user",
  PENDING_EMAIL: "pendingEmail",
  REDIRECT: "redirect",
  LOCALE: "NEXT_LOCALE",
};


export const OTP_CONFIG = {
  LENGTH: parseInt(process.env.NEXT_PUBLIC_OTP_LENGTH || "6"),
  EXPIRY_TIME: parseInt(process.env.NEXT_PUBLIC_OTP_EXPIRY_TIME || "600000"),
  RESEND_DELAY: 60000,
};


export const API_STATUS = {
  SUCCESS: true,
  ERROR: false,
};


export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "Unauthorized. Please login again.",
  FORBIDDEN: "Access denied. You do not have permission to perform this action.",
  NOT_FOUND: "Resource not found.",
  INVALID_OTP: "Invalid OTP. Please try again.",
  OTP_EXPIRED: "OTP has expired. Request a new OTP.",
  ADMIN_NOT_FOUND: "Admin with this email not found. Contact administrator.",
  ADMIN_INACTIVE: "Your admin account is inactive. Contact administrator.",
  SELLER_NOT_FOUND: "Seller with this email not found.",
  SELLER_INACTIVE: "Your seller account is inactive.",
  INTERNAL_ERROR: "Internal server error. Please try again later.",
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again later.",
};


export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  LOGOUT_SUCCESS: "Logged out successfully.",
  OTP_SENT: "OTP sent to your email. Valid for 10 minutes.",
  OTP_VERIFIED: "OTP verified successfully.",
  TOKEN_REFRESHED: "Token refreshed successfully.",
};


export const API_HEADERS = {
  CONTENT_TYPE: "application/json",
  AUTHORIZATION: "Authorization",
  BEARER: "Bearer",
};


export const REDIRECT_URLS = {
  ADMIN_LOGIN: "/auth/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  SELLER_LOGIN: "/seller/auth/login",
  SELLER_DASHBOARD: "/seller/dashboard",
  HOME: "/",
};


export const API_REQUEST_CONFIG = {
  TIMEOUT: API_TIMEOUT,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  ADMIN_API,
  SELLER_API,
  COOKIE_KEYS,
  OTP_CONFIG,
  API_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_HEADERS,
  REDIRECT_URLS,
  API_REQUEST_CONFIG,
};
