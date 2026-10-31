"use client";

import { useEffect } from "react";
import { resolveImageUrl } from "@/lib/utils";

/**
 * generateSvgFavicon
 *
 * Generates a base64-encoded SVG Data URI favicon featuring the store's brand initial
 * for 100% browser tab bar compatibility (Chrome, Brave, Firefox, Edge, Safari).
 */
export function generateSvgFavicon(brandName: string, bgColor: string = '#0b2e70'): string {
  const initial = (brandName || 'V').trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="16" fill="${bgColor}"/><text x="32" y="38" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800">${initial}</text></svg>`;

  const base64Svg = typeof btoa !== "undefined"
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg).toString("base64");

  return `data:image/svg+xml;base64,${base64Svg}`;
}

function parseJsonSafely(val: any): any {
  if (!val) return {};
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

export function findLogoInObject(obj: any): string | null {
  if (!obj) return null;

  if (typeof obj === "string") {
    if (
      obj.startsWith("http") ||
      obj.startsWith("/") ||
      obj.startsWith("data:") ||
      obj.includes("/") ||
      /\.(png|jpg|jpeg|svg|webp|ico|avif)/i.test(obj)
    ) {
      return obj;
    }
    const parsed = parseJsonSafely(obj);
    if (Object.keys(parsed).length > 0) {
      obj = parsed;
    } else {
      return null;
    }
  }

  if (typeof obj !== "object") return null;

  const logoKeys = [
    "faviconUrl", "favicon", "logoUrl", "logo", "brandLogo",
    "logoImage", "logoAsset", "siteLogo", "headerLogo"
  ];
  for (const k of logoKeys) {
    const val = obj[k];
    if (typeof val === "string" && val.trim().length > 0) {
      if (
        val.startsWith("http") ||
        val.startsWith("/") ||
        val.startsWith("data:") ||
        val.includes("/") ||
        /\.(png|jpg|jpeg|svg|webp|ico|avif)/i.test(val)
      ) {
        return val;
      }
    }
  }

  for (const key of Object.keys(obj)) {
    if (["products", "categories", "collections", "orders", "users"].includes(key)) continue;
    const child = obj[key];
    if (child && (typeof child === "object" || typeof child === "string")) {
      const found = findLogoInObject(child);
      if (found) return found;
    }
  }

  return null;
}

/**
 * injectFaviconLinks
 *
 * Removes old icon elements and appends fresh DOM link elements to force Chrome/Brave/Safari tab bar update.
 */
function injectFaviconLinks(href: string, mimeType: string) {
  // 1. Remove ALL existing icon links completely so Chrome forces a tab bar re-render
  const existingLinks = document.querySelectorAll<HTMLLinkElement>(
    "link[rel*='icon'], link[rel='apple-touch-icon']"
  );
  existingLinks.forEach((el) => {
    el.parentNode?.removeChild(el);
  });

  // 2. Append fresh link elements
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = mimeType;
  link.href = href;
  document.head.appendChild(link);

  const shortcut = document.createElement("link");
  shortcut.rel = "shortcut icon";
  shortcut.type = mimeType;
  shortcut.href = href;
  document.head.appendChild(shortcut);

  const apple = document.createElement("link");
  apple.rel = "apple-touch-icon";
  apple.href = href;
  document.head.appendChild(apple);
}

/** Square favicons ke liye ek hi baar canvas kaam ho, isliye result cache karte hain. */
const squaredFaviconCache = new Map<string, string>();

/** Ek favicon URL ka cache-bust token — mutation observer har baar naya na banaye. */
const faviconBustCache = new Map<string, string>();

/**
 * squareifyFavicon
 *
 * Theme Settings se aksar wide banner logo (e.g. 1240x554) favicon ki tarah upload
 * ho jaata hai. Browser use 16x16 tab slot me squeeze karta hai to logo pehchana
 * hi nahi jaata. Isliye non-square image ko 64x64 canvas par "contain" fit karke
 * ek asli square icon bana dete hain.
 *
 * Square images bina touch kiye waapas aa jaati hain.
 */
function squareifyFavicon(url: string, cacheKey: string): Promise<string> {
  return new Promise((resolve) => {
    const cached = squaredFaviconCache.get(cacheKey);
    if (cached) {
      resolve(cached);
      return;
    }

    const img = new Image();

    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (!w || !h) {
        resolve(url);
        return;
      }

      // Pehle se square hai to jaisa hai waisa hi rehne do.
      if (Math.abs(w - h) / Math.max(w, h) < 0.05) {
        squaredFaviconCache.set(cacheKey, "");
        resolve(url);
        return;
      }

      try {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(url);
          return;
        }

        // "contain" fit — poora logo dikhe, crop na ho.
        const scale = Math.min(size / w, size / h);
        const drawW = w * scale;
        const drawH = h * scale;
        ctx.drawImage(img, (size - drawW) / 2, (size - drawH) / 2, drawW, drawH);

        const dataUri = canvas.toDataURL("image/png");
        squaredFaviconCache.set(cacheKey, dataUri);
        resolve(dataUri);
      } catch {
        // Tainted canvas (CORS) — original URL hi use kar lo.
        resolve(url);
      }
    };

    img.onerror = () => resolve(url);
    img.src = url;
  });
}

/**
 * updateFavicon
 *
 * Favicon URL ko resolve karke, zaroorat pade to square banakar, tab bar par lagata hai.
 */
function updateFavicon(url: string) {
  if (!url || typeof window === "undefined") return;

  const isDataUri = url.startsWith("data:");
  const resolvedUrl = isDataUri ? url : resolveImageUrl(url);
  if (!resolvedUrl) return;

  // Cache-bust value URL ke hisaab se stable rakho — har title mutation par naya
  // timestamp lagta to browser wahi image baar-baar download karta.
  let bust = faviconBustCache.get(resolvedUrl);
  if (!bust) {
    bust = String(Date.now());
    faviconBustCache.set(resolvedUrl, bust);
  }
  const cacheBust = `_fv=${bust}`;
  const finalUrl = isDataUri
    ? resolvedUrl
    : (resolvedUrl.includes("?") ? `${resolvedUrl}&${cacheBust}` : `${resolvedUrl}?${cacheBust}`);

  const mimeType = isDataUri
    ? (resolvedUrl.includes("image/svg+xml") ? "image/svg+xml" : "image/png")
    : (resolvedUrl.toLowerCase().endsWith(".ico") ? "image/x-icon" : resolvedUrl.toLowerCase().endsWith(".svg") ? "image/svg+xml" : "image/png");

  // SVG data URI already square banaya jaata hai, use canvas se guzarne ki zaroorat nahi.
  if (isDataUri) {
    injectFaviconLinks(finalUrl, mimeType);
    return;
  }

  // Pehle original lagao (turant kuch dikhe), phir square version aane par replace.
  injectFaviconLinks(finalUrl, mimeType);

  // Upload host CORS headers nahi bhejta, isliye seedha image canvas ko taint kar
  // deta hai. Next ka same-origin image proxy use karte hain — wahan se aayi
  // pixels padhi ja sakti hain.
  const proxiedUrl = `/_next/image?url=${encodeURIComponent(finalUrl)}&w=64&q=75`;
  void squareifyFavicon(proxiedUrl, resolvedUrl).then((squared) => {
    if (squared && squared !== proxiedUrl) {
      injectFaviconLinks(squared, "image/png");
    }
  });
}

/**
 * useStorefrontMeta
 *
 * Browser tab ka title aur favicon set karta hai aur
 * Next.js ke soft navigation se protect karta hai.
 */
export function useStorefrontMeta(
  title: string,
  favicon: string | null | undefined,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    // Apply title if present
    if (title) {
      document.title = title;
    }

    // Apply favicon directly
    const resolvedFavicon = favicon
      ? (favicon.startsWith("data:") ? favicon : resolveImageUrl(favicon))
      : null;

    if (resolvedFavicon) {
      updateFavicon(resolvedFavicon);
    }

    // Watch <title> element: Next.js may override it during soft navigation.
    let titleEl = document.querySelector("title");
    if (!titleEl) {
      titleEl = document.createElement("title");
      document.head.appendChild(titleEl);
    }

    let isSettingTitle = false;
    let timer: any = null;

    const safeSetTitle = () => {
      if (isSettingTitle) return;
      if (title && document.title !== title) {
        isSettingTitle = true;
        document.title = title;
        setTimeout(() => {
          isSettingTitle = false;
        }, 50);
      }
      if (resolvedFavicon) {
        updateFavicon(resolvedFavicon);
      }
    };

    const observer = new MutationObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(safeSetTitle, 10);
    });

    observer.observe(titleEl, { childList: true, subtree: true, characterData: true });

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [title, favicon, enabled]);
}

/**
 * extractStorefrontFavicon
 *
 * StorefrontData se favicon/logo URL nikalta hai.
 *
 * Priority:
 *  1. theme.theme_config.faviconUrl  ← Theme Settings se upload hua favicon
 *  2. store.favicon / store.logo / store.logoUrl / store.brandLogo
 *  3. theme_config.logoUrl / theme_config.logo
 *  4. Any section config/settings with logo, logoUrl, logoImage, logoAsset across all pages
 *  5. Fallback: Dynamic SVG Brand Icon (e.g. 'V' badge for Vastropedia)
 */
export function extractStorefrontFavicon(storefrontData: any): string | null {
  if (!storefrontData) return null;

  // 1. Theme-level favicon (uploaded from Theme Settings → Favicon & Branding)
  const themeFavicon = storefrontData?.theme?.theme_config?.faviconUrl;
  if (themeFavicon) return themeFavicon;

  // 2. Direct store / theme logo fields
  const storeLogo = findLogoInObject(storefrontData?.store) || findLogoInObject(storefrontData?.theme?.theme_config);
  if (storeLogo) return storeLogo;

  // 3. Search all pages and sections in storefrontData (decoding JSON string columns if needed)
  const pages = Array.isArray(storefrontData?.pages) ? storefrontData.pages : [];
  for (const page of pages) {
    const sections = Array.isArray(page?.sections) ? page.sections : [];
    for (const section of sections) {
      const logo = findLogoInObject(section);
      if (logo) return logo;
    }
  }

  // 4. Check top-level sections
  if (Array.isArray(storefrontData?.sections)) {
    for (const section of storefrontData.sections) {
      const logo = findLogoInObject(section);
      if (logo) return logo;
    }
  }

  // 5. Fallback: Dynamic Brand Initial SVG Favicon
  const storeName = storefrontData?.store?.name || storefrontData?.store?.brandName || "Vastropedia";
  return generateSvgFavicon(storeName);
}
