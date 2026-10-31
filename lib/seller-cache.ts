"use client";

/**
 * Client-side cache for the seller panel — the browser half of the Redis layer.
 *
 * The backend caches in Redis; the browser cannot talk to Redis, so this is the
 * counterpart that stops the panel re-fetching the same payload every time a screen
 * mounts. It follows the *same rules* as `CacheService` on the server, deliberately:
 *
 * ### 1. Every key is scoped to the logged-in seller
 *
 *     a2s:s:<sellerId>:<namespace>:<hash of the query>
 *
 * and the stored envelope carries the seller id a second time. A read whose stamp
 * does not match the current token is discarded, not returned. This is the frontend
 * side of "one seller must never see another's data" — without it, logging out and
 * back in as a different seller on the same machine would paint the previous
 * seller's orders on screen for a moment, which is the worst possible moment for it.
 *
 * ### 2. Ownership is re-checked on every access
 *
 * `currentSellerId()` reads the id out of the JWT each time. The moment it changes
 * — login, logout, account switch — `assertOwner()` wipes everything from the
 * previous seller before a single entry can be served.
 *
 * ### 3. Storage is sessionStorage, not localStorage
 *
 * A cache of one tenant's business data has no reason to outlive the tab. It also
 * keeps a shared machine from carrying data across browser sessions.
 *
 * ### 4. Stale-while-revalidate
 *
 * `swrFetch` returns the cached value immediately and refreshes behind it, which is
 * what makes navigating between seller screens feel instant instead of showing a
 * spinner for a list that has not changed.
 */

const PREFIX = "a2s";
const OWNER_KEY = `${PREFIX}:owner`;

/** Namespaces mirror the backend's `CacheNs` so the two invalidate in step. */
export const SellerNs = {
  DASHBOARD: "dashboard",
  ORDERS: "orders",
  ORDER_STATS: "order-stats",
  SHIPMENTS: "shipments",
  WALLET: "wallet",
  WAREHOUSE: "warehouse",
  PRODUCTS: "products",
  INVENTORY: "inventory",
  CUSTOMERS: "customers",
  NDR: "ndr",
  RETURNS: "returns",
  WEIGHT_RECO: "weight-reco",
  BILLING: "billing",
  REPORT: "report",
  KYC: "kyc",
  CHANNELS: "channels",
  NOTIFICATION: "notification",
  SUPPORT: "support",
  /** Catalog-adjacent: categories, collections, packages — all invalidate with PRODUCTS. */
  CATALOG: "catalog",
  STORE: "store",
  SETTINGS: "settings",
  GLOBAL: "global",
} as const;

export type SellerNamespace = (typeof SellerNs)[keyof typeof SellerNs];

/** Seconds. Kept at or below the backend's TTLs — a client must never be fresher than its source. */
const TTL: Record<string, { ttl: number; swr: number }> = {
  [SellerNs.DASHBOARD]: { ttl: 180, swr: 60 },
  [SellerNs.ORDERS]: { ttl: 45, swr: 15 },
  [SellerNs.ORDER_STATS]: { ttl: 90, swr: 30 },
  [SellerNs.SHIPMENTS]: { ttl: 60, swr: 30 },
  [SellerNs.WALLET]: { ttl: 30, swr: 15 },
  [SellerNs.WAREHOUSE]: { ttl: 300, swr: 120 },
  [SellerNs.PRODUCTS]: { ttl: 120, swr: 60 },
  [SellerNs.INVENTORY]: { ttl: 90, swr: 45 },
  [SellerNs.CUSTOMERS]: { ttl: 180, swr: 90 },
  [SellerNs.NDR]: { ttl: 90, swr: 45 },
  [SellerNs.RETURNS]: { ttl: 90, swr: 45 },
  [SellerNs.WEIGHT_RECO]: { ttl: 180, swr: 90 },
  [SellerNs.BILLING]: { ttl: 180, swr: 90 },
  [SellerNs.REPORT]: { ttl: 180, swr: 90 },
  [SellerNs.KYC]: { ttl: 90, swr: 45 },
  [SellerNs.CHANNELS]: { ttl: 180, swr: 90 },
  [SellerNs.NOTIFICATION]: { ttl: 45, swr: 20 },
  // A seller who just replied to a ticket looks straight back at the thread.
  [SellerNs.SUPPORT]: { ttl: 45, swr: 20 },
  // Categories/collections/packages barely change and are read by every product form.
  [SellerNs.CATALOG]: { ttl: 300, swr: 150 },
  [SellerNs.STORE]: { ttl: 300, swr: 150 },
  // Settings screens: api keys, label settings, courier preference.
  [SellerNs.SETTINGS]: { ttl: 300, swr: 150 },
  [SellerNs.GLOBAL]: { ttl: 600, swr: 300 },
};

const DEFAULT_TTL = { ttl: 90, swr: 45 };

/**
 * Namespaces a write to one area must also drop. Mirrors the backend's
 * `INVALIDATION_FANOUT` — shipping an order moves the wallet and the dashboard too,
 * and a client that only cleared `orders` would keep showing the old balance.
 */
const FANOUT: Record<string, string[]> = {
  [SellerNs.ORDERS]: [SellerNs.ORDER_STATS, SellerNs.DASHBOARD, SellerNs.SHIPMENTS, SellerNs.WALLET],
  [SellerNs.SHIPMENTS]: [SellerNs.ORDERS, SellerNs.ORDER_STATS, SellerNs.DASHBOARD],
  [SellerNs.WALLET]: [SellerNs.DASHBOARD, SellerNs.BILLING],
  [SellerNs.PRODUCTS]: [SellerNs.INVENTORY, SellerNs.CATALOG],
  [SellerNs.INVENTORY]: [SellerNs.PRODUCTS],
  [SellerNs.CATALOG]: [SellerNs.PRODUCTS],
  [SellerNs.NDR]: [SellerNs.ORDERS, SellerNs.ORDER_STATS],
  [SellerNs.RETURNS]: [SellerNs.ORDERS, SellerNs.ORDER_STATS],
  [SellerNs.WAREHOUSE]: [SellerNs.ORDERS],
  [SellerNs.WEIGHT_RECO]: [SellerNs.BILLING, SellerNs.WALLET],
};

interface Envelope<T> {
  /** Owner stamp — the seller this payload belongs to. */
  s: string;
  /** epoch ms */
  t: number;
  /** seconds until stale */
  f: number;
  d: T;
}

/* ------------------------------------------------------------------ *
 * Identity
 * ------------------------------------------------------------------ */

/** Same encoding rules as `cookieService.getCookie`, inlined to avoid a cycle. */
function readCookie(key: string): string | null {
  if (typeof document === "undefined") return null;
  const name = encodeURIComponent(key) + "=";
  for (let cookie of document.cookie.split(";")) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return decodeURIComponent(cookie.substring(name.length));
    }
  }
  return null;
}

/**
 * The decoded (unverified) claims of the seller JWT, or null. Client-side hints
 * only — the token is still verified server-side on every request.
 */
export function sellerTokenClaims(): Record<string, any> | null {
  if (typeof window === "undefined") return null;

  // Read the cookie inline rather than via `cookieService`: that module calls
  // `clearAll()` from here on logout, and importing it back would make the two
  // files circular.
  const token = readCookie("seller_token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    // base64url → base64, then pad.
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/**
 * The seller id out of the JWT. Read fresh every time — a cached copy is exactly
 * how a stale identity ends up serving the wrong tenant's data.
 *
 * This is a display/partition key only; the token is still verified server-side on
 * every request, so a tampered payload buys nothing but a useless cache partition.
 */
export function currentSellerId(): string | null {
  const claims = sellerTokenClaims();
  const id = claims?.sub ?? claims?.id ?? claims?.userId;
  return id === undefined || id === null ? null : String(id);
}

/* ------------------------------------------------------------------ *
 * Storage
 * ------------------------------------------------------------------ */

const memory = new Map<string, string>();
const inflight = new Map<string, Promise<unknown>>();

function session(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    // Private mode / storage disabled — memory still works.
    return null;
  }
}

function stableStringify(value: unknown): string {
  const walk = (v: any): any => {
    if (v === null || v === undefined) return undefined;
    if (Array.isArray(v)) return v.map(walk);
    if (v instanceof Date) return v.toISOString();
    if (typeof v === "object") {
      const out: Record<string, any> = {};
      for (const k of Object.keys(v).sort()) {
        const w = walk(v[k]);
        if (w !== undefined) out[k] = w;
      }
      return out;
    }
    return v;
  };
  return JSON.stringify(walk(value) ?? null);
}

/** Small, fast, non-cryptographic — this only has to separate cache slots. */
function hash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 + c, 0x85ebca6b) ^ (h2 >>> 13);
  }
  return ((h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)).slice(0, 16);
}

function keyFor(sellerId: string, ns: string, variant?: unknown): string {
  const base = `${PREFIX}:s:${sellerId}:${ns}`;
  return variant === undefined ? base : `${base}:${hash(stableStringify(variant))}`;
}

/**
 * Wipes everything belonging to a different seller.
 *
 * Called before every read and every write. The stored owner is the guard: the
 * instant the token's seller changes, the previous tenant's entries are gone before
 * anything can read them.
 */
function assertOwner(sellerId: string | null): boolean {
  const store = session();
  const previous = store ? store.getItem(OWNER_KEY) : memory.get(OWNER_KEY) ?? null;

  if (previous !== sellerId) {
    clearAll();
    if (sellerId) {
      if (store) store.setItem(OWNER_KEY, sellerId);
      else memory.set(OWNER_KEY, sellerId);
    }
  }

  return sellerId !== null;
}

/** Drops every cached entry. Call on login, logout and account switch. */
export function clearAll(): void {
  memory.clear();
  inflight.clear();

  const store = session();
  if (!store) return;
  const doomed: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key && key.startsWith(`${PREFIX}:`)) doomed.push(key);
  }
  doomed.forEach((key) => store.removeItem(key));
}

/**
 * Drops the given namespaces — plus everything `FANOUT` says they imply — for the
 * current seller. The client half of a write invalidation.
 */
export function invalidate(...namespaces: string[]): void {
  const sellerId = currentSellerId();
  if (!sellerId) {
    clearAll();
    return;
  }

  const targets = new Set<string>();
  for (const ns of namespaces) {
    targets.add(ns);
    for (const extra of FANOUT[ns] ?? []) targets.add(extra);
  }

  const prefixes = [...targets].map((ns) => `${PREFIX}:s:${sellerId}:${ns}`);
  const matches = (key: string) => prefixes.some((p) => key === p || key.startsWith(`${p}:`));

  for (const key of Array.from(memory.keys())) {
    if (matches(key)) memory.delete(key);
  }
  for (const key of Array.from(inflight.keys())) {
    if (matches(key)) inflight.delete(key);
  }

  const store = session();
  if (!store) return;
  const doomed: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key && matches(key)) doomed.push(key);
  }
  doomed.forEach((key) => store.removeItem(key));
}

function readEnvelope<T>(key: string, sellerId: string): Envelope<T> | null {
  let raw = memory.get(key) ?? null;

  if (raw === null) {
    const store = session();
    raw = store ? store.getItem(key) : null;
    if (raw !== null) memory.set(key, raw);
  }

  if (raw === null) return null;

  try {
    const env = JSON.parse(raw) as Envelope<T>;
    // Second ownership barrier — the key already carries the id, so this only trips
    // on tampered or corrupted storage. It still stays.
    if (env.s !== sellerId) {
      removeKey(key);
      return null;
    }
    if (Date.now() - env.t > env.f * 1000 + 60_000) {
      // Well past even the SWR grace — treat as absent.
      removeKey(key);
      return null;
    }
    return env;
  } catch {
    removeKey(key);
    return null;
  }
}

function removeKey(key: string): void {
  memory.delete(key);
  session()?.removeItem(key);
}

function writeEnvelope<T>(key: string, sellerId: string, value: T, softTtl: number): void {
  const env: Envelope<T> = { s: sellerId, t: Date.now(), f: softTtl, d: value };
  let raw: string;
  try {
    raw = JSON.stringify(env);
  } catch {
    return; // not serialisable — skip silently, the request already succeeded
  }

  memory.set(key, raw);
  try {
    session()?.setItem(key, raw);
  } catch {
    // Quota exceeded: memory alone is fine, and evicting this tenant's other
    // entries to make room would be worse than a smaller cache.
  }
}

/* ------------------------------------------------------------------ *
 * The API
 * ------------------------------------------------------------------ */

export interface SwrOptions {
  /** Skip the cached read; still writes the fresh result. */
  force?: boolean;
  /** Override the namespace's stale window, in seconds. */
  swr?: number;
  /** Called when a background refresh produces different data. */
  onRefresh?: (data: unknown) => void;
}

/**
 * Read-through cache around any request.
 *
 * - fresh hit  → returns immediately, no request
 * - stale hit  → returns immediately AND refreshes in the background (`onRefresh`)
 * - miss       → awaits the request; concurrent callers share one in-flight promise
 *
 * A rejected request never poisons the cache; the caller sees the rejection.
 */
export async function swrFetch<T>(
  ns: string,
  variant: unknown,
  loader: () => Promise<T>,
  options: SwrOptions = {},
): Promise<T> {
  const sellerId = currentSellerId();

  // Not logged in (or server-rendering): never cache — there is no owner to scope to.
  if (!sellerId || !assertOwner(sellerId)) {
    return loader();
  }

  const key = keyFor(sellerId, ns, variant);
  const { swr } = TTL[ns] ?? DEFAULT_TTL;
  const softTtl = options.swr ?? swr;

  if (!options.force) {
    const cached = readEnvelope<T>(key, sellerId);
    if (cached) {
      const isStale = Date.now() - cached.t > cached.f * 1000;
      if (!isStale) return cached.d;

      // Serve now, refresh behind. A failed refresh keeps the stale value.
      if (!inflight.has(key)) {
        const refresh = loader()
          .then((fresh) => {
            // The seller may have logged out mid-flight — do not write to the new owner.
            if (currentSellerId() === sellerId) {
              writeEnvelope(key, sellerId, fresh, softTtl);
              options.onRefresh?.(fresh);
            }
            return fresh;
          })
          .catch(() => cached.d)
          .finally(() => inflight.delete(key));
        inflight.set(key, refresh);
      }
      return cached.d;
    }
  }

  const pending = inflight.get(key);
  if (pending && !options.force) return pending as Promise<T>;

  const promise = loader()
    .then((fresh) => {
      if (currentSellerId() === sellerId) {
        writeEnvelope(key, sellerId, fresh, softTtl);
      }
      return fresh;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

/** Synchronous peek — lets a component paint from cache on its very first render. */
export function peek<T>(ns: string, variant: unknown): T | null {
  const sellerId = currentSellerId();
  if (!sellerId || !assertOwner(sellerId)) return null;
  const env = readEnvelope<T>(keyFor(sellerId, ns, variant), sellerId);
  return env ? env.d : null;
}

export const sellerCache = {
  swrFetch,
  peek,
  invalidate,
  clearAll,
  currentSellerId,
  ns: SellerNs,
};

export default sellerCache;
