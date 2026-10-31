"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Profile } from "./profile";
import { ThemeSwitcher } from "./theme-switcher";
import { WalletRecharge } from "./wallet-recharge";
import { GlobalSearch } from "./global-search";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { cookieService } from "@/lib/cookie";
import { getModuleTitle, getPageTitle } from "@/lib/module-title";

export { getModuleTitle };

function getSellerBrandName(userObj: any): string {
  if (!userObj) return "";
  const fullName = [userObj.firstName, userObj.lastName].filter(Boolean).join(" ").trim();
  const rawName = userObj.name?.trim();
  const validName = (rawName && rawName !== "undefined" && rawName !== "undefined undefined" && rawName !== "null" && rawName !== "null null") ? rawName : "";

  const candidates = [
    userObj.companyName,
    userObj.company_name,
    userObj.brandName,
    userObj.brand_name,
    userObj.storeName,
    userObj.store_name,
    userObj.company,
    userObj.brand,
    userObj.registeredName,
    userObj.registered_name,
    userObj.sellerCompanyName,
    userObj.sellerName,
    userObj.seller?.companyName,
    userObj.seller?.company_name,
    userObj.seller?.brandName,
    userObj.seller?.brand_name,
    userObj.seller?.storeName,
    userObj.seller?.store_name,
    fullName,
    validName,
    userObj.email ? userObj.email.split("@")[0] : "",
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0 && c.toLowerCase() !== "null" && c.toLowerCase() !== "undefined") {
      return c.trim();
    }
  }
  return "";
}

export default function Header() {
  const { user } = useUser();
  const pathname = usePathname();
  const [brandName, setBrandName] = React.useState<string>("");

  const isSeller = pathname.startsWith("/seller") || pathname.startsWith("/logistics");
  const moduleName = getModuleTitle(pathname);
  const fullTitle = getPageTitle(pathname);

  React.useEffect(() => {
    const isAdmin = pathname.startsWith("/admin");
    if (isAdmin) {
      let name = (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || user?.companyName || "");
      if (!name) {
        try {
          const adminCookie = cookieService.getCookie("admin_user");
          if (adminCookie) {
            const parsed = JSON.parse(adminCookie);
            name = (parsed.firstName ? `${parsed.firstName} ${parsed.lastName || ""}`.trim() : parsed.name || parsed.companyName || "");
          }
        } catch (e) {}
      }
      setBrandName(name || "Admin");
    } else {
      let name = getSellerBrandName(user);
      if (!name) {
        try {
          const sellerCookie = cookieService.getCookie("seller_user") || cookieService.getCookie("user");
          if (sellerCookie) {
            name = getSellerBrandName(JSON.parse(sellerCookie));
          }
        } catch (e) {}
      }
      setBrandName(name);
    }
  }, [user, pathname]);

  return (
    <header
      className="flex shrink-0 items-center justify-between gap-2 bg-white/70 dark:bg-[#09090b]/80 backdrop-blur-xl text-zinc-950 dark:text-white border-b border-zinc-200/50 dark:border-zinc-800/80 shadow-xs sticky top-0 z-30 transition-[width,height] ease-linear select-none px-4 py-3 sm:px-6 sm:py-3.5"
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <SidebarTrigger
          variant="ghost"
          className="text-zinc-600 dark:text-zinc-350 hover:bg-zinc-150/50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        />
        <Separator
          orientation="vertical"
          className="mr-2 h-4 bg-zinc-200/80 dark:bg-zinc-800/80"
        />
        <div className="flex flex-row items-center gap-3 min-w-0">
          <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white truncate">
            {moduleName}
          </h1>
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-350 dark:bg-zinc-700 hidden sm:inline" />
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider hidden sm:inline truncate" suppressHydrationWarning>
            WELCOME BACK{brandName ? `, ${brandName.toUpperCase()}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 xl:gap-6 shrink-0">
        {/* Search — seller panel me live global search (product name / order no. / AWB).
            Result links `/seller/...` ke detail pages hain, isliye baaki panels me
            abhi wahi purana plain input rehta hai. */}
        {pathname.startsWith("/seller") ? (
          <GlobalSearch />
        ) : (
          <div className="relative hidden md:block md:w-56 lg:w-72 xl:w-96 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-600 h-3.5 w-3.5 group-focus-within:text-indigo-500 transition-colors duration-250" />
            <Input
              placeholder="Search products, orders..."
              className="w-full h-9.5 pl-10 bg-zinc-100/50 dark:bg-zinc-900/45 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-indigo-500/15 focus-visible:border-indigo-500 focus-visible:bg-white dark:focus-visible:bg-zinc-950 transition-all duration-250 rounded-xl"
            />
          </div>
        )}

        {/* User profile dropdown triggers */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {isSeller && <WalletRecharge />}
          <ThemeSwitcher />
          <Profile user={user} />
        </div>
      </div>
    </header>
  );
}
