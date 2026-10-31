import { clearAll as clearSellerCache } from "./seller-cache";

interface CookieOptions {
  expires?: Date;
  maxAge?: number; 
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

class CookieService {
  
  setCookie(key: string, value: string, options: CookieOptions = {}): void {
    if (typeof window === "undefined") {
      return;
    }

    const {
      expires,
      maxAge,
      domain,
      path = "/",
      secure = typeof window !== "undefined" ? window.location.protocol === "https:" : process.env.NODE_ENV === "production",
      sameSite = "lax",
    } = options;

    let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

    if (expires) {
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (maxAge !== undefined) {
      cookieString += `; max-age=${maxAge}`;
    }

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    cookieString += `; path=${path}`;

    if (secure) {
      cookieString += `; secure`;
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  }

  
  getCookie(key: string): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    const name = encodeURIComponent(key) + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        return decodeURIComponent(cookie.substring(name.length));
      }
    }

    return null;
  }

  
  deleteCookie(
    key: string,
    options: Pick<CookieOptions, "domain" | "path"> = {}
  ): void {
    const { domain, path = "/" } = options;

    // Dropping the seller token ends that seller's session, so their cached panel
    // data must go with it. Hooking it here rather than at each logout site means a
    // new sign-out path cannot forget it — and the next seller on this browser can
    // never be shown the previous one's orders.
    if (key === "seller_token") {
      clearSellerCache();
    }

    this.setCookie(key, "", {
      expires: new Date(0),
      domain,
      path,
    });
  }

  
  getAllCookies(): Record<string, string> {
    if (typeof window === "undefined") {
      return {};
    }

    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(";");

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie) {
        const [key, value] = cookie.split("=");
        if (key && value) {
          cookies[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      }
    }

    return cookies;
  }

  
  hasCookie(key: string): boolean {
    return this.getCookie(key) !== null;
  }

  
  clearAllCookies(): void {
    if (typeof window === "undefined") {
      console.warn("clearAllCookies called on server-side.");
      return;
    }

    // Unconditionally — this is a full sign-out, and the seller cache must not
    // survive it even if the token cookie was already gone.
    clearSellerCache();
    try {
      sessionStorage.removeItem("dashboard_sellers_cache");
    } catch (e) {}

    const cookies = this.getAllCookies();
    for (const key in cookies) {
      this.deleteCookie(key);
    }
  }
}


export const cookieService = new CookieService();
