import { Data } from "@/types/data";
import sellerApiClient from "./seller-axios";
import { AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { cookieService } from "./cookie";
import { invalidate as invalidateSellerCache, swrFetch } from "./seller-cache";

export interface ApiResponse {
  data: Data | undefined;
  status: boolean;
  message?: string;
  auth_token?: string;
  meta?: any;
}


export default class SellerBaseService {
  private readonly endpoint: string;

  /**
   * Cache namespace for this service (see `lib/seller-cache.ts`).
   *
   * Set it and two things follow automatically: `cachedGet` reads through the
   * seller-scoped client cache, and every mutation on this service drops that
   * namespace. Services that leave it unset behave exactly as before — no caching,
   * no invalidation — so adopting this is per-screen, not all-or-nothing.
   */
  protected readonly cacheNs?: string;

  constructor(endpoint: string, cacheNs?: string) {
    this.endpoint = endpoint;
    this.cacheNs = cacheNs;
  }

  /**
   * A GET that is served from the client cache when it is fresh, served instantly
   * and revalidated when it is stale, and de-duplicated when several components ask
   * for the same thing at once.
   *
   * The cache key includes the logged-in seller's id, so a cached response can never
   * be handed to a different seller.
   */
  protected cachedGet(
    path: string = "",
    params?: any,
    options?: { force?: boolean; ns?: string; config?: AxiosRequestConfig },
  ): Promise<any> {
    const ns = options?.ns ?? this.cacheNs;
    if (!ns) return this.get(path, params, options?.config);

    return swrFetch(
      ns,
      { url: this.getUrl(path), params: params ?? null },
      () => this.get(path, params, options?.config),
      { force: options?.force },
    );
  }

  /** Drop this service's namespace (plus any extra) for the current seller. */
  public invalidateCache(...extra: string[]): void {
    const namespaces = [this.cacheNs, ...extra].filter(Boolean) as string[];
    if (namespaces.length) invalidateSellerCache(...namespaces);
  }

  protected getUrl(path: string = ""): string {
    return [this.endpoint, path].filter(Boolean).join("/");
  }

  protected async handleResponse(
    promise: Promise<ApiResponse>,
    showToast: boolean = true
  ): Promise<any> {
    try {
      const response = await promise;

      // If response doesn't have status field, it's direct data
      if (response && typeof response === 'object' && !('status' in response) && !('error' in response)) {
        return response as Data;
      }

      if (!response.status) {
        return Promise.reject(new Error(response.message || "Request failed"));
      }

      if (showToast && response.status && response.message) {
        toast.success(response.message);
      }

      if (response.auth_token) {
        cookieService.setCookie("seller_token", response.auth_token);
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      const meta = response.meta ?? null;
      const { status, message, auth_token, data, meta: originalMeta, ...rest } = response as any;
      return meta ? { ...response.data, meta, ...rest } : { ...response.data, ...rest };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public get(
    path: string = "",
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    return this.handleResponse(
      sellerApiClient.get(this.getUrl(path), { params, ...config }),
      false // GET requests should not show success toasts
    );
  }

  // Every mutation drops this service's cached reads on success. Mirrors the
  // backend's `SellerCacheInvalidationInterceptor`, so the two layers expire together
  // and a write is never followed by a stale screen.

  public post(
    path: string = "",
    data: Partial<any>,
    config?: AxiosRequestConfig,
    showToast: boolean = true
  ): Promise<any> {
    return this.afterMutation(
      this.handleResponse(
        sellerApiClient.post(this.getUrl(path), data, config),
        showToast
      )
    );
  }

  public put(
    path: string = "",
    data: Partial<any>,
    config?: AxiosRequestConfig,
    showToast: boolean = true
  ): Promise<any> {
    return this.afterMutation(
      this.handleResponse(
        sellerApiClient.put(this.getUrl(path), data, config),
        showToast
      )
    );
  }

  public patch(
    path: string = "",
    data: Partial<any>,
    config?: AxiosRequestConfig,
    showToast: boolean = true
  ): Promise<any> {
    return this.afterMutation(
      this.handleResponse(
        sellerApiClient.patch(this.getUrl(path), data, config),
        showToast
      )
    );
  }

  public delete(
    path: string = "",
    config?: AxiosRequestConfig,
    showToast: boolean = true
  ): Promise<any> {
    return this.afterMutation(
      this.handleResponse(
        sellerApiClient.delete(this.getUrl(path), config),
        showToast
      )
    );
  }

  /** Invalidate only when the write actually succeeded — a rejected call changed nothing. */
  private afterMutation(promise: Promise<any>): Promise<any> {
    return promise.then((result) => {
      this.invalidateCache();
      return result;
    });
  }
}
