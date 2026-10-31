import { Data } from "@/types/data";
import apiClient from "./axios";
import { AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { cookieService } from "./cookie";

export interface ApiResponse {
  data: Data | undefined;
  status: boolean;
  message?: string;
  auth_token?: string;
  meta?: any;
}


export default class BaseService {
  private readonly endpoint: string;

  constructor(endpoint: string) {

    this.endpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  }

  private getUrl(path: string = ""): string {
    const fullPath = path ? `${this.endpoint}/${path}` : this.endpoint;
    return fullPath;
  }


  private async handleResponse(
    promise: Promise<ApiResponse>,
    showToast: boolean = true
  ): Promise<any> {
    try {
      const response = await promise;

      console.log("[handleResponse] Response received:", response);

      if (typeof response === 'string') {
      console.log("[handleResponse] String data response detected");
          return response as any;
        }
      
      // If response doesn't have status field, it's direct data
      if (response && typeof response === 'object' && !('status' in response) && !('error' in response)) {
        console.log("[handleResponse] Direct data response detected");
        return response as Data;
      }

      if (response && typeof response === 'object' && (response as any).error) {
        const errorMessage = response.message || (response as any).error || "Request failed";
        console.error("[handleResponse] Backend error:", errorMessage);
        return response as Data;
      }

      // Check for status field
      if (!response || response.status === false) {
        const errorMessage = response?.message || "Request failed";
        console.error("[handleResponse] Error:", errorMessage);
        return Promise.reject(new Error(errorMessage));
      }

      if (showToast && response.status && response.message) {
        toast.success(response.message);
      }

      // Set auth token if provided
      if (response.auth_token) {
        cookieService.setCookie("user_token", response.auth_token);
      }

      const meta = response.meta ?? null;
      const stats = (response as any).stats ?? null;

      let result = meta ? { ...response.data, meta: meta } : response.data;
      if (stats && result && typeof result === "object") {
        result = { ...result, stats };
      }

      return result;
    } catch (error) {
        console.error("[handleResponse] Error caught:", error);
      return Promise.reject(error);
    }
  }

  public get(
    path: string = "",
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    return this.handleResponse(
      apiClient.get(this.getUrl(path), { params, ...config }),
      false // GET requests should not show success toasts
    );
  }

  public post(
    path: string = "",
    data: Partial<any>,
    config?: AxiosRequestConfig,
    showToast: boolean = true
  ): Promise<any> {
    return this.handleResponse(
      apiClient.post(this.getUrl(path), data, config),
      showToast
    );
  }

  public put(
    path: string = "",
    data: Partial<any>,
    config?: AxiosRequestConfig
  ): Promise<any> {
    return this.handleResponse(apiClient.put(this.getUrl(path), data, config));
  }

  public patch(
    path: string = "",
    data: Partial<any>,
    config?: AxiosRequestConfig
  ): Promise<any> {
    return this.handleResponse(
      apiClient.patch(this.getUrl(path), data, config)
    );
  }

  public delete(
    path: string = "",
    config?: AxiosRequestConfig
  ): Promise<any> {
    return this.handleResponse(apiClient.delete(this.getUrl(path), config));
  }
}
