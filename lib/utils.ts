import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const ALLOWED_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

/**
 * Product images ka CDN host (Cloudflare R2 ke aage Cloudflare CDN).
 *
 * Backend ke `R2_PUBLIC_URL` ke saath match hona chahiye — dono alag ho gaye to
 * CDN image `/_next/image` se guzarne lagegi aur CDN ka poora fayda chala jaayega.
 */
/** CDN ka poora base, e.g. `https://cloud.ad2ship.com` — `cdn/<key>` isi se khulta hai. */
const CDN_BASE_URL = (() => {
  const raw = (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_CDN_BASE_URL : "") || "https://cloud.ad2ship.com";
  return raw.trim().replace(/\/+$/, "");
})();

const CDN_HOST = (() => {
  const raw = (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_CDN_BASE_URL : "") || "https://cloud.ad2ship.com";
  try {
    return new URL(raw.trim()).hostname;
  } catch {
    return "";
  }
})();

/** Backend jo variants banata hai — `<uuid>-<variant>.webp`. */
const CDN_VARIANTS = ["thumb", "medium", "large", "original"] as const;

/** Kis width par kaunsa variant sabse theek baithta hai. */
const CDN_VARIANT_WIDTHS: Array<{ name: string; width: number }> = [
  { name: "thumb", width: 200 },
  { name: "medium", width: 600 },
  { name: "large", width: 1200 },
  // `original` (backend par 2048 tak) bhi list me hona zaroori hai — warna
  // full-width hero/banner, jo 1080-1920 maangta hai, hamesha `large` (1200px)
  // par hi atak jaata tha aur bade screen par stretch hokar dhundhla dikhta.
  { name: "original", width: 2048 },
];

function isCdnUrl(url: string): boolean {
  if (!CDN_HOST) return false;
  try {
    return new URL(url).hostname === CDN_HOST;
  } catch {
    return false;
  }
}

/**
 * Shopify ki CDN — bulk upload me aayi images yahin rehti hain (backend inhe
 * download nahi karta, URL seedha DB me jaata hai).
 */
function isShopifyCdnUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === "cdn.shopify.com" ||
      host.endsWith(".shopifycdn.com") ||
      host.endsWith(".shopifycdn.net")
    );
  } catch {
    return false;
  }
}

/**
 * Shopify URL par uska apna `width` param laga deta hai.
 *
 * Shopify ki CDN khud resize karti hai, isliye ise `/_next/image` se guzarna
 * bekaar hai: wahan image pehle hamare server par download hoti, phir dobara
 * encode hoti — ek extra network hop, hamara CPU, aur ek aur generation loss.
 * Yahan sirf query param badalta hai aur kaam Shopify ke CDN par hi ho jaata
 * hai.
 */
function resizeShopifyUrl(url: string, width?: number): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("width", String(pickRenderWidth(width)));
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Maangi gayi CSS width ko asli download width me badalta hai.
 *
 * Do wajah se width badhani padti hai:
 *  - Retina screens (DPR 2-3x) par CSS ka 400px ka box sharp dikhne ke liye
 *    800-1200px ki image maangta hai.
 *  - Card ki asli chaudai layout par badalti hai (grid columns, sidebar), to
 *    caller ka number ek lower bound hota hai, exact size nahi.
 *
 * 2x lekar upar wali allowed width par snap karte hain — isse Next/Shopify
 * dono ka cache limited variants par hi bana rehta hai.
 */
function pickRenderWidth(width?: number): number {
  if (!width) return 1200;

  // Full-bleed hero/banner pehle hi 1200-1920 maangta hai — usse 2x karke
  // 3840 par le jaana bytes 4x kar deta hai aur aankh ko farak mushkil se
  // dikhta hai. Asli blur chhoti widths par tha (card 384 maangta tha aur
  // 400px+ par render hota tha), isliye 2x sirf wahan tak lagta hai.
  const target = width >= 1200 ? width : width * 2;
  return ALLOWED_WIDTHS.find((w) => w >= target) ?? 1920;
}

/**
 * CDN URL ko maangi gayi width ke sabse chhote kaafi variant par le jaata hai.
 *
 * Backend upload par hi chaar sizes bana kar rakh deta hai, isliye resize karne
 * ke liye `/_next/image` chalane ki zaroorat nahi — sirf key badal do.
 *
 * Jo URL is naming par fit na ho (purani ya bahar se aayi file) wo chhua nahi
 * jaata — waise ka waisa wapas.
 */
function switchCdnVariant(url: string, width?: number): string {
  const pattern = new RegExp(`-(${CDN_VARIANTS.join("|")})\\.webp$`);
  if (!pattern.test(url)) return url;

  // 2x isliye — retina par 400px ke card ko `medium` (600px) blurry chhod deta
  // tha; ab wo `large` uthata hai.
  //
  // Fallback `original` hai, `large` nahi: maangi width itni badi ho ki koi
  // variant fit na kare (jaise hero ka 1080 → 2160), to sabse bada variant hi
  // sahi jawab hai. Pehle yahan `large` tha, isliye full-width banner hamesha
  // 1200px par hi atak jaata tha chahe screen kitni bhi badi ho.
  const target = width
    ? (CDN_VARIANT_WIDTHS.find((v) => v.width >= width * 2)?.name ?? "original")
    : "large";

  return url.replace(pattern, `-${target}.webp`);
}

/**
 * CDN variant URL ko wapas `-original.webp` par le jaata hai.
 *
 * `switchCdnVariant` har CDN image ko maangi gayi width ke variant par bhej
 * deta hai, par backend ke kuch purane uploads par sirf original key maujood
 * hai — wahan `-large.webp` par 404 aata hai. Ye helper `onError` ke liye ek
 * hi retry ka target deta hai.
 *
 * Jo URL is naming par fit na ho (ya pehle se original ho) uspar `null` —
 * caller ko pata chal jaata hai ki retry karne layak kuch nahi hai.
 */
export function cdnOriginalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!isCdnUrl(url)) return null;

  const pattern = new RegExp(`-(${CDN_VARIANTS.join("|")})\\.webp$`);
  const match = url.match(pattern);
  if (!match || match[1] === "original") return null;

  return url.replace(pattern, "-original.webp");
}

export function resolveImageUrl(
  url: string | null | undefined,
  options?: { width?: number; quality?: number }
): string {
  if (!url) return "";

  let cleanUrl = url.trim();
  if (cleanUrl.startsWith("data:") || cleanUrl.startsWith("blob:")) return cleanUrl;

  // Backend DB me poora URL nahi, sirf key rakhta hai — `cdn/<key>`. CDN domain
  // data me bake na ho isliye. Yahan use wapas poora URL bana dete hain, warna
  // ye relative path samjha jaata hai aur `/cdn/...` par 404 milta hai.
  if (cleanUrl.startsWith("cdn/")) {
    const base = CDN_BASE_URL;
    if (base) {
      cleanUrl = `${base}/${cleanUrl.slice(4)}`;
    }
  }

  // CDN image ko yahin chhod dete hain — koi rewrite nahi, koi proxy nahi.
  // File pehle se WebP hai aur saare sizes bane hue hain, isliye sirf sahi
  // variant chunna kaafi hai.
  if (isCdnUrl(cleanUrl)) {
    return switchCdnVariant(cleanUrl, options?.width);
  }

  // Shopify bhi khud resize kar leta hai — proxy karne ki zaroorat nahi.
  if (isShopifyCdnUrl(cleanUrl)) {
    return resizeShopifyUrl(cleanUrl, options?.width);
  }

  const apiBase =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    "https://devapi.ad2ship.com";

  let apiOrigin = "https://devapi.ad2ship.com";
  try {
    const p = new URL(apiBase);
    if (p.origin && !p.origin.includes("localhost")) {
      apiOrigin = p.origin;
    }
  } catch { }

  // Rule 2 — relative path
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    if (!cleanUrl.startsWith("/")) {
      cleanUrl = "/" + cleanUrl;
    }
    if (cleanUrl.startsWith("/uploads/")) {
      cleanUrl = `${apiOrigin}${cleanUrl}`;
    } else {
      if (options && (options.width || options.quality)) {
        const w = pickRenderWidth(options.width);
        const q = options.quality || 85;
        return `/_next/image?url=${encodeURIComponent(cleanUrl)}&w=${w}&q=${q}`;
      }
      return cleanUrl;
    }
  }

  try {
    const parsed = new URL(cleanUrl);

    if (parsed.hostname.includes("unsplash.com")) {
      const w = options?.width || Number(parsed.searchParams.get("w")) || 1200;
      const q = options?.quality || Number(parsed.searchParams.get("q")) || 75;
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("w", w.toString());
      parsed.searchParams.set("q", q.toString());
      return parsed.toString();
    }

    const filename = parsed.pathname.split("/").pop() || "";
    let resolvedUrl = cleanUrl;

    if (
      filename.startsWith("placeholder_") ||
      filename.startsWith("saree_") ||
      filename.startsWith("ad2ship_")
    ) {
      resolvedUrl = parsed.pathname + (parsed.search ? parsed.search : "");
    } else if (
      (parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.port === "3001" ||
        parsed.port === "8000" ||
        parsed.host.includes("3001")) &&
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      // Rewrite any localhost / 3001 / 8000 backend image URL to live apiOrigin only on live/production domains
      resolvedUrl = `${apiOrigin}${parsed.pathname}${parsed.search ? parsed.search : ""}`;
    } else if (apiOrigin && parsed.hostname === new URL(apiBase).hostname) {
      resolvedUrl = `${apiOrigin}${parsed.pathname}${parsed.search ? parsed.search : ""}`;
    }

    // Apne backend ki image ko `/_next/image` se guzarna bekaar hai: wo pehle
    // hamare Next server par download hoti, phir dobara encode hoti — ek extra
    // hop aur ek generation loss, bina kisi fayde ke.
    //
    // "Apna" sirf configured origin nahi hai: DB me purani rows par doosre
    // environment ka host bake hua hai (jaise `prod-api.ad2ship.com`) jabki
    // local/dev par `apiOrigin` kuch aur hota hai. Wo bhi hamara hi host hai.
    const isOwnApiHost =
      parsed.hostname.endsWith(".ad2ship.com") ||
      parsed.hostname === "ad2ship.com" ||
      Boolean(apiOrigin && resolvedUrl.startsWith(apiOrigin));

    if (options && (options.width || options.quality)) {
      if (
        !isOwnApiHost &&
        (resolvedUrl.startsWith("/") || resolvedUrl.startsWith("http://") || resolvedUrl.startsWith("https://"))
      ) {
        const w = pickRenderWidth(options.width);
        const q = options.quality || 85;
        return `/_next/image?url=${encodeURIComponent(resolvedUrl)}&w=${w}&q=${q}`;
      }
    }

    return resolvedUrl;
  } catch {
    return cleanUrl;
  }
}

/**
 * Resolves PDF documents, labels, invoices, and manifests against the active API base URL.
 * Automatically rewrites localhost/stale URLs and relative paths so they download properly on live servers.
 */
export function resolveDocumentUrl(url: string | null | undefined): string {
  if (!url) return "";
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith("data:") || cleanUrl.startsWith("blob:")) return cleanUrl;

  const apiBase =
    (typeof process !== "undefined" && (process.env?.NEXT_PUBLIC_API_BASE_URL || process.env?.NEXT_PUBLIC_API_URL)) ||
    "https://devapi.ad2ship.com";

  let apiOrigin = "https://devapi.ad2ship.com";
  try {
    const p = new URL(apiBase);
    apiOrigin = p.origin;
  } catch { }

  // If it's a relative path e.g. "assets/seller/labels/Label-xxx.pdf" or "/assets/..."
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    const path = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
    return `${apiOrigin}${path}`;
  }

  try {
    const parsed = new URL(cleanUrl);
    // If it points to localhost, 127.0.0.1, or port 3001/5000/8000, or asset paths, rewrite to configured API origin
    if (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.port === "3001" ||
      parsed.port === "5000" ||
      parsed.port === "8000" ||
      parsed.host.includes("3001") ||
      parsed.pathname.startsWith("/assets/") ||
      parsed.pathname.startsWith("/uploads/")
    ) {
      return `${apiOrigin}${parsed.pathname}${parsed.search}`;
    }
    return cleanUrl;
  } catch {
    return cleanUrl;
  }
}

import { cookieService } from "./cookie";

export function checkIsCustomerLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const userStr = cookieService.getCookie("user");
    if (!userStr) return false;
    const userObj = JSON.parse(userStr);
    return userObj && userObj.role === "user";
  } catch {
    return false;
  }
}

export function formatPrice(amount: number | string): string {
  let numericAmount = 0;
  if (typeof amount === "number") {
    numericAmount = amount;
  } else {
    const cleaned = String(amount)
      .replace(/Rs\./g, "")
      .replace(/Rs/g, "")
      .replace(/₹/g, "")
      .replace(/,/g, "")
      .trim();
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) {
      numericAmount = parsed;
    } else {
      return amount;
    }
  }

  if (typeof window !== "undefined") {
    const country = sessionStorage.getItem("ad2ship_user_country");
    if (country && country !== "India") {
      const markedUpAmount = numericAmount * 1.3;
      const usdVal = markedUpAmount / 80;
      return `$${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }
  return `Rs. ${numericAmount.toLocaleString()}`;
}

export const OWN_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "ad2ship.com",
  "app.ad2ship.com",
  "vercel.app",
  "ad2shiptheme.com",
  "brand2ship.in"
];

export function isOwnDomain(hostname: string): boolean {
  const systemBrand2shipSubdomains = [
    "app.brand2ship.in",
    "admin.brand2ship.in",
    "demostore.brand2ship.in"
  ];

  if (hostname.endsWith(".brand2ship.in") && !systemBrand2shipSubdomains.includes(hostname)) {
    return false;
  }

  if (OWN_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
    return true;
  }
  if (hostname.includes("ngrok") || hostname.includes("localhost")) {
    return true;
  }
  return false;
}

const KNOWN_SECTION_TYPES = [
  "left_log_center_search_header",
  "left-log-center-search-header-section",
  "centered_logo_navigation_header",
  "centered-logo-navigation-header-section",
  "mega_menu_header",
  "mega-menu-header-section",
  "announcement_v2",
  "about_hero",
  "about_stats",
  "about_values",
  "about_team",
  "about_mission",
  "brand_story",
  "contact_hero",
  "contact_section",
  "policy_section",
  "refund_section",
  "shipping_section",
  "tos_section",
  "faq_section",
  "profile_section",
  "order_history_section",
  "order_details_section",
  "editorial_split_banner",
  "image_with_text",
  "season_drop",
  "arch_categories",
  "category_carousel",
  "curated_showcase",
  "weekly_deals",
  "product_carousel",
  "visual_chronicles",
  "shoppable_videos",
  "pdp_editorial",
  "plp_editorial",
  "plp_boutique",
  "quick_view_details",
  "new_arrivals",
  "best_sellers",
  "reels_v2",
  "product_grid_v2",
  "product_grid_v3",
  "product_grid",
  "product_slider",
  "lookbook_slider",
  "two_banner",
  "three_banner",
  "trust_badges",
  "header_v3",
  "header_v2",
  "double_header",
  "double-header-section",
  "header-v3",
  "header",
  "promo",
  "announcement",
  "trend_banner",
  "hero",
  "category_mosaic_v3",
  "category-mosaic-v3",
  "categories_v3",
  "categories_v2",
  "category_grid_v2",
  "category-grid-v2",
  "categories-section-v2",
  "categories",
  "collections_v2",
  "collections",
  "reels",
  "testimonials_v2",
  "testimonials",
  "reviews_v3",
  "write_review_prompt",
  "write_review",
  "newsletter",
  "footer_v4",
  "footer_v3",
  "footer-v3",
  "footer_section_v3",
  "footer_v2",
  "footer"
];

export function getSectionBaseKey(key: string): string {
  if (!key) return "";
  const normalizedKey = key.toLowerCase().replace(/-/g, '_');
  const sortedTypes = [...KNOWN_SECTION_TYPES].sort((a, b) => b.length - a.length);
  for (const type of sortedTypes) {
    const normType = type.toLowerCase().replace(/-/g, '_');
    if (normalizedKey === normType || normalizedKey.startsWith(normType + "_") || normalizedKey.startsWith(normType + "-")) {
      return type;
    }
  }
  return key;
}

export function maskCustomerPhone(phone: string | number | null | undefined): string {
  if (!phone) return "—";
  const raw = String(phone).trim();
  if (!raw || raw === "—") return "—";

  if (raw.includes("*") || raw.toLowerCase().includes("x")) {
    return raw;
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) return raw;

  if (digits.length === 10) {
    return `${digits.slice(0, 4)}******`;
  }

  if (digits.length > 10 && digits.startsWith("91")) {
    const main10 = digits.slice(-10);
    return `+91 ${main10.slice(0, 4)}******`;
  }

  if (digits.length <= 4) {
    return digits;
  }

  return `${digits.slice(0, 4)}******`;
}

export function getTrackingUrl(
  awb: string | number | null | undefined,
  _status?: string | null
): string {
  if (!awb) return "#";
  const base = (
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_TRACKING_URL) ||
    "https://beta.ad2ship.com"
  ).replace(/\/+$/, "");
  const cleanAwb = encodeURIComponent(String(awb).trim());
  return `${base}/trk/${cleanAwb}`;
}
