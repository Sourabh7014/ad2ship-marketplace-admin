"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Package, Search, ShoppingBag, Truck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debounce";
import { cn, resolveImageUrl } from "@/lib/utils";
import {
  searchApiService,
  type GlobalSearchResult,
  type SearchOrder,
} from "@/features/seller/search/api.service";

/** Backend isse kam par query nahi chalata (`MIN_QUERY_LENGTH`) — yahan bhi wahi. */
const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;
const LISTBOX_ID = "global-search-results";

type Row = {
  key: string;
  href: string;
  title: string;
  subtitle: string;
  status?: string;
  icon: React.ReactNode;
};

type Group = { label: string; rows: Row[] };

/** "in_transit" / "shadowfax_surface" → "In Transit" / "Shadowfax Surface". */
function humanize(raw?: string | null) {
  if (!raw) return "";
  return raw
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function money(value: number | null) {
  return value === null || value === undefined ? "" : `₹${Number(value).toLocaleString("en-IN")}`;
}

function orderLabel(o: SearchOrder) {
  return o.orderNumber.startsWith("#") ? o.orderNumber : `#${o.orderNumber}`;
}

/** Match hua hissa bold — seller ko dikhe ki row kis wajah se aayi. */
function Highlight({ text, query }: { text: string; query: string }) {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-xs bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

const ICON_BOX =
  "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-white/10";

function buildGroups(results: GlobalSearchResult): Group[] {
  const groups: Group[] = [
    {
      label: "Products",
      rows: results.products.map((p) => {
        const thumb = resolveImageUrl(p.imageUrl, { width: 32 });
        return {
          key: `product-${p.id}`,
          href: `/seller/products/view/${p.id}`,
          title: p.name,
          subtitle: [p.sku && `SKU: ${p.sku}`, money(p.price)].filter(Boolean).join(" · "),
          icon: thumb ? (
            <Image src={thumb} alt="" width={32} height={32} className="h-8 w-8 object-cover" unoptimized />
          ) : (
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
          ),
        };
      }),
    },
    {
      label: "Orders",
      rows: results.orders.map((o) => ({
        key: `order-${o.id}`,
        href: `/seller/orders/details/${o.id}`,
        title: orderLabel(o),
        subtitle: [o.customerName, money(o.amount)].filter(Boolean).join(" · "),
        status: o.status,
        icon: <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />,
      })),
    },
    {
      label: "AWB Numbers",
      rows: results.awbs.map((o) => ({
        key: `awb-${o.id}`,
        href: `/seller/orders/details/${o.id}`,
        title: o.awbNumber ?? "",
        subtitle: [orderLabel(o), humanize(o.courier)].filter(Boolean).join(" · "),
        status: o.status,
        icon: <Truck className="h-3.5 w-3.5" aria-hidden="true" />,
      })),
    },
  ];
  return groups.filter((g) => g.rows.length > 0);
}

/**
 * Seller header ka global search — product name, order number aur AWB number.
 * Matching backend par hoti hai (`GET /seller/search`, `LIKE '%q%'`); yahan sirf
 * debounce, dropdown aur keyboard navigation hai.
 */
export function GlobalSearch() {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  // Aakhri poora hua search aur wo kis term ka tha. `data: null` = fetch fail hua.
  const [settled, setSettled] = React.useState<{ term: string; data: GlobalSearchResult | null } | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const term = query.trim().replace(/^#/, "").trim();
  const debouncedTerm = useDebounce(term, DEBOUNCE_MS);
  const searchable = term.length >= MIN_CHARS;

  React.useEffect(() => {
    if (debouncedTerm.length < MIN_CHARS) return;

    // Request cancel nahi karte — axios interceptor abort ko "Network error" toast
    // bana deta hai. Purana response bas ignore ho jaata hai.
    let active = true;
    searchApiService
      .search(debouncedTerm)
      .then((res) => {
        if (!active) return;
        setSettled({
          term: debouncedTerm,
          data: {
            query: debouncedTerm,
            products: res?.products ?? [],
            orders: res?.orders ?? [],
            awbs: res?.awbs ?? [],
          },
        });
      })
      .catch(() => {
        // Fetch fail ko "No results" nahi dikhana — wo jhooth hoga.
        if (active) setSettled({ term: debouncedTerm, data: null });
      });

    return () => {
      active = false;
    };
  }, [debouncedTerm]);

  // Bahar click par band.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Jab tak type hua term settle nahi hota, spinner — kisi aur term ke results
  // kabhi nahi dikhte.
  const pending = searchable && settled?.term !== term;
  const error = !pending && settled?.data === null;
  const results = pending ? null : settled?.data ?? null;
  const groups = React.useMemo(() => (results ? buildGroups(results) : []), [results]);
  const rows = React.useMemo(() => groups.flatMap((g) => g.rows), [groups]);
  const indexByKey = React.useMemo(() => new Map(rows.map((r, i) => [r.key, i])), [rows]);

  React.useEffect(() => {
    setActiveIndex(-1);
  }, [rows]);

  const go = (row: Row) => {
    setOpen(false);
    setQuery("");
    router.push(row.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      e.currentTarget.blur();
      return;
    }
    if (!rows.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % rows.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i <= 0 ? rows.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(rows[activeIndex] ?? rows[0]);
    }
  };

  const showPanel = open && searchable;

  return (
    <div ref={containerRef} className="relative hidden md:block md:w-56 lg:w-72 xl:w-96 group">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-600 h-3.5 w-3.5 group-focus-within:text-indigo-500 transition-colors duration-250" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search products, orders, AWB..."
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={showPanel ? LISTBOX_ID : undefined}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${LISTBOX_ID}-${activeIndex}` : undefined}
        autoComplete="off"
        className="w-full h-9.5 pl-10 pr-9 bg-zinc-100/50 dark:bg-zinc-900/45 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-indigo-500/15 focus-visible:border-indigo-500 focus-visible:bg-white dark:focus-visible:bg-zinc-950 transition-all duration-250 rounded-xl"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 cursor-pointer"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
        </button>
      )}

      {showPanel && (
        <div
          id={LISTBOX_ID}
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-full min-w-88 overflow-y-auto rounded-xl border border-zinc-200/80 bg-white p-1.5 text-left shadow-xl select-text dark:border-zinc-800/80 dark:bg-zinc-950"
        >
          {pending ? (
            <p className="flex items-center gap-2 px-3 py-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Searching...
            </p>
          ) : error ? (
            <p className="px-3 py-4 text-xs font-medium text-rose-600 dark:text-rose-400">
              Search failed. Please try again.
            </p>
          ) : groups.length === 0 ? (
            <p className="px-3 py-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              No product, order or AWB found for &ldquo;{term}&rdquo;.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} role="group" aria-label={group.label} className="pb-1 last:pb-0">
                <p className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {group.label}
                </p>
                {group.rows.map((row) => {
                  const index = indexByKey.get(row.key) ?? -1;
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={row.key}
                      id={`${LISTBOX_ID}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      // Input ka focus na jaaye, warna click se pehle panel band ho jaata hai.
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => go(row)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left cursor-pointer transition-colors",
                        isActive ? "bg-indigo-500/10" : "hover:bg-zinc-100 dark:hover:bg-zinc-900",
                      )}
                    >
                      <span className={ICON_BOX}>{row.icon}</span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-xs font-bold text-zinc-900 dark:text-white">
                          <Highlight text={row.title} query={term} />
                        </span>
                        {row.subtitle && (
                          <span className="truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                            {row.subtitle}
                          </span>
                        )}
                      </span>
                      {row.status && (
                        <span className="shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                          {humanize(row.status)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
