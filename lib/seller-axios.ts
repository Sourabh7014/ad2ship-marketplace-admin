import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { cookieService } from "./cookie";
import { clearAll as clearSellerCache } from "./seller-cache";

import { API_BASE_URL } from "./api-config";

// API_BASE_URL khali ho (build ARG set na hua) to `${""}/seller` ban jaata tha —
// wo Next ka *page* route hai, API ka nahi. Middleware use login par 307 kar deta
// tha, response kabhi nahi aata tha, aur axios "Network error" dikhata tha.
// Khali hone par `/seller-api` proxy use karo, jo middleware se exempt hai.
const sellerApiBase = API_BASE_URL
  ? `${API_BASE_URL.replace(/\/api$/, "")}/seller`
  : "/seller-api";

const sellerApiClient = axios.create({
  baseURL: sellerApiBase,
  timeout: 300000,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

const debug = process.env.NODE_ENV !== "production";

sellerApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined"
        ? cookieService.getCookie("seller_token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (debug) {
      console.log(
        `[Seller API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          headers: config.headers,
          data: config.data,
        }
      );
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("[Seller API Request Error]", error);
    return Promise.reject(error);
  }
);

sellerApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (debug) {
      console.log(`[Seller API Response] ${response.status}`, response.data);
    }
    return response.data;
  },
  (error: AxiosError) => {
    // Suppress 404 for packages endpoint as it's not implemented yet
    if (error.response?.status === 404 && error.config?.url?.includes("packages")) {
      return Promise.reject(error);
    }

    // Background polls opt out: a toast every few seconds for a status check the
    // seller never asked for is worse than the check failing quietly.
    if ((error.config as { silent?: boolean } | undefined)?.silent) {
      return Promise.reject(error);
    }

    console.error("[Seller API Response Error]", error);

    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;

      switch (status) {
        case 401:
          if (error.config?.url?.includes("auth/login")) {
            toast.error(
              data?.message ||
              data?.error ||
              error.message ||
              "Invalid email or password."
            );
          } else if (error.config?.url?.includes("kyc/status")) {
            // Background status check — silently ignore 401, don't logout
          } else {
            handleSellerUnauthorized();
          }
          break;

        case 403:
          toast.error(
            "Access denied. You do not have permission to perform this action."
          );
          break;

        case 404:
          // Already handled packages 404 silently above, show toast for others
        case 422:
        case 400:
          toast.error(
            data?.message ||
            data?.error ||
            error.message ||
            "Something went wrong."
          );
          break;

        case 429:
          toast.error("Too many requests. Please try again later.");
          break;

        case 500:
          toast.error(
            data?.message ||
            data?.error ||
            error.message ||
            "Internal server error. Please try again later."
          );
          break;

        default:
          toast.error(
            data?.message ||
            data?.error ||
            error.message ||
            "Something went wrong. Please try again later."
          );
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection and try again.");
    } else {
      toast.error(
        error.message || "An error occurred while setting up the request."
      );
    }

    return Promise.reject(error);
  }
);

function handleSellerUnauthorized(): void {
  if (typeof window === "undefined") return;
  // Clear the cached seller data BEFORE the cookies. The cache scopes itself by the
  // seller id in the token, so dropping the token first would leave the previous
  // seller's entries sitting in sessionStorage with no owner to compare against.
  clearSellerCache();
  cookieService.clearAllCookies();
  window.location.href = "/seller/auth/login";
}

export default sellerApiClient;
