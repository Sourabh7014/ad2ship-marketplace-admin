import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { cookieService } from "./cookie";

const sellerApiClient = axios.create({
  baseURL: "/api",
  timeout: 300000,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

const debug = process.env.NODE_ENV !== "production";

sellerApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isUserRequest = config.url?.startsWith("user/") || config.url?.startsWith("/user/") || config.url?.startsWith("user-details") || config.url?.startsWith("/user-details");
    const isSellerRequest = config.url?.startsWith("seller-api/") || config.url?.startsWith("/seller-api/");
    
    let isAdmin = false;
    if (typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/auth")) {
        isAdmin = true;
      } else if (window.location.pathname.startsWith("/seller") || window.location.pathname.startsWith("/user")) {
        isAdmin = false;
      } else {
        isAdmin = !isUserRequest && !isSellerRequest;
      }
    }

    const token = typeof window !== "undefined"
      ? (isAdmin
          ? cookieService.getCookie("admin_token") || cookieService.getCookie("authToken")
          : isUserRequest
            ? cookieService.getCookie("user_token") || cookieService.getCookie("token")
            : cookieService.getCookie("seller_token") || cookieService.getCookie("user_token") || cookieService.getCookie("token"))
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
          } else {
            const isUserRequest = error.config?.url?.includes("/user/") || error.config?.url?.startsWith("user/") || error.config?.url?.includes("/user-details/") || error.config?.url?.startsWith("user-details/");
            const isSellerRequest = error.config?.url?.includes("/seller-api/") || error.config?.url?.startsWith("seller-api/");
            
            let isAdmin = false;
            if (typeof window !== "undefined") {
              if (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/auth")) {
                isAdmin = true;
              } else if (window.location.pathname.startsWith("/seller") || window.location.pathname.startsWith("/user")) {
                isAdmin = false;
              } else {
                isAdmin = !isUserRequest && !isSellerRequest;
              }
            }

            handleUnauthorized(isAdmin, isUserRequest);
          }
          break;

        case 403:
          // Suppress 403 toast popups to keep UI clean without error banner spam
          break;

        case 404:
        case 422:
        case 400: {
          const raw = data?.message || data?.error || error.message || "Something went wrong.";
          const msg = Array.isArray(raw) ? raw[0] : raw;
          toast.error(msg);
          break;
        }

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

function handleUnauthorized(isAdmin: boolean, isStorefrontUser = false): void {
  if (typeof window === "undefined") return;
  if (isStorefrontUser && !isAdmin) {

    if (!cookieService.getCookie("user_token")) return;

    cookieService.deleteCookie("user_token");
    cookieService.deleteCookie("user");
    window.dispatchEvent(new Event("auth-change"));
    return;
  }

  if (isAdmin) {
    if (window.location.pathname.startsWith("/auth")) return;
    cookieService.deleteCookie("authToken");
    cookieService.deleteCookie("admin_token");
    cookieService.deleteCookie("refreshToken");
    cookieService.deleteCookie("admin_user");
    cookieService.deleteCookie("user");
    window.location.href = "/auth/login";
  } else {
    if (window.location.pathname.startsWith("/seller/auth")) return;
    cookieService.clearAllCookies();
    window.location.href = "/seller/auth/login";
  }
}

export default sellerApiClient;
