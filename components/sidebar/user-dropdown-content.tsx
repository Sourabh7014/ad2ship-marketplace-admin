"use client";

import { LogOut, Settings, User, Lock, MonitorSmartphone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import authService from "@/features/admin/auth/api.service";
import sellerAuthService from "@/features/seller/auth/api.service";
import { cookieService } from "@/lib/cookie";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";

export function UserDropdownContent({
  user,
  onChangePassword,
}: {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    [key: string]: any;
  } | null;
  onChangePassword?: () => void;
}) {
  const { user: globalUser, updateUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = globalUser?.role === "admin" || globalUser?.role === "super_admin" || pathname.startsWith("/admin");
  const confirm = useConfirm();

  const logout = async () => {
    await confirm({
      title: "Logout",
      variant: "destructive",
      description: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          // Seller logout must reach the seller API — it ends the server-side
          // session, so the token stops working, not just the cookie.
          await (pathname.startsWith("/seller") ? sellerAuthService : authService).logout();
        } catch (error) {
          console.warn("Logout API endpoint failed:", error);
        }
        cookieService.deleteCookie("user");
        cookieService.deleteCookie("authToken");
        cookieService.deleteCookie("seller_token");
        cookieService.deleteCookie("user_token");
        if (typeof window !== "undefined") {
          try {
            sessionStorage.clear();
            localStorage.removeItem("cod_sellers_cache");
            localStorage.removeItem("app_sellers_cache");
            localStorage.removeItem("weight_reco_sellers_cache");
            localStorage.removeItem("billing_sellers_cache_freight");
            localStorage.removeItem("billing_sellers_cache_commission");
          } catch (e) {}
        }
        updateUser(null);
        router.push(pathname.startsWith("/seller") ? "/seller/auth/login" : "/auth/login");
      },
    });
  };

  const cookieUser = typeof window !== "undefined" ? (() => {
    try {
      const isSeller = pathname.startsWith("/seller") || pathname.startsWith("/store") || pathname.startsWith("/logistics");
      if (isSeller) {
        const s = cookieService.getCookie("seller_user") || cookieService.getCookie("user");
        if (s) return JSON.parse(s);
      }
      const a = cookieService.getCookie("admin_user") || cookieService.getCookie("user");
      if (a) return JSON.parse(a);
    } catch (e) {}
    return null;
  })() : null;

  const currentUser = user || globalUser || cookieUser;

  const fullName = [
    currentUser?.firstName || cookieUser?.firstName,
    currentUser?.lastName || cookieUser?.lastName,
  ].filter(Boolean).join(" ").trim();

  const rawName = (currentUser?.name || cookieUser?.name)?.trim();
  const isGeneric = !rawName || ["seller", "admin", "undefined", "null", "undefined undefined", "null null"].includes(rawName.toLowerCase());
  const validName = !isGeneric ? rawName : "";

  const displayName =
    fullName ||
    validName ||
    currentUser?.companyName ||
    cookieUser?.companyName ||
    currentUser?.sellerName ||
    cookieUser?.sellerName ||
    currentUser?.storeName ||
    cookieUser?.storeName ||
    (currentUser?.email || cookieUser?.email ? (currentUser?.email || cookieUser?.email).split("@")[0] : "") ||
    (isAdmin ? "Admin" : "Seller");

  const displayEmail =
    currentUser?.email ||
    cookieUser?.email ||
    currentUser?.seller?.email ||
    cookieUser?.seller?.email ||
    globalUser?.email ||
    "";

  const displayAvatar =
    currentUser?.avatar ||
    cookieUser?.avatar ||
    currentUser?.profileImage ||
    cookieUser?.profileImage ||
    globalUser?.avatar ||
    "";

  const words = displayName.trim().split(/\s+/).filter(Boolean);
  const initials = words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : (displayName.slice(0, 2).toUpperCase() || (isAdmin ? "A" : "S"));
  const initialLetter = displayName.charAt(0).toUpperCase() || (isAdmin ? "A" : "S");

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal mb-1.5">
        <div className="flex items-center gap-3 px-3 py-2.5 text-left bg-zinc-50/80 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-850/50 rounded-xl shadow-2xs">
          <Avatar className="h-9 w-9 rounded-full ring-2 ring-indigo-500/10 shrink-0">
            <AvatarImage src={displayAvatar} alt={displayName} className="object-cover" />
            <AvatarFallback className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-extrabold text-[12px] flex items-center justify-center">
              {initialLetter}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 leading-none select-none">
            <span className="truncate font-extrabold text-xs text-zinc-900 dark:text-zinc-50">{displayName}</span>
            <span className="truncate text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-1">{displayEmail}</span>
          </div>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator className="my-1.5 bg-zinc-100 dark:bg-zinc-800/80" />

      <DropdownMenuGroup className="space-y-0.5">
        <DropdownMenuItem
          onClick={() =>
            router.push(
              pathname.startsWith("/seller")
                ? "/seller/profile"
                : pathname.startsWith("/admin") || isAdmin
                  ? "/admin/profile"
                  : "/seller/profile"
            )
          }
          className="transition-all duration-150 rounded-xl px-3 py-2 cursor-pointer text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/[0.04] dark:hover:bg-indigo-500/[0.08] focus:bg-indigo-500/[0.04] dark:focus:bg-indigo-500/[0.08] focus:text-indigo-500 dark:focus:text-indigo-400"
        >
          <User className="mr-2.5 h-4 w-4" /> Profile
        </DropdownMenuItem>

        {!isAdmin && (
          <>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onChangePassword?.();
              }}
              className="transition-all duration-150 rounded-xl px-3 py-2 cursor-pointer text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/[0.04] dark:hover:bg-indigo-500/[0.08] focus:bg-indigo-500/[0.04] dark:focus:bg-indigo-500/[0.08] focus:text-indigo-500 dark:focus:text-indigo-400"
            >
              <Lock className="mr-2.5 h-4 w-4" /> Change Password
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/seller/settings")}
              className="transition-all duration-150 rounded-xl px-3 py-2 cursor-pointer text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/[0.04] dark:hover:bg-indigo-500/[0.08] focus:bg-indigo-500/[0.04] dark:focus:bg-indigo-500/[0.08] focus:text-indigo-500 dark:focus:text-indigo-400"
            >
              <Settings className="mr-2.5 h-4 w-4" /> Settings
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/seller/settings/sessions")}
              className="transition-all duration-150 rounded-xl px-3 py-2 cursor-pointer text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/[0.04] dark:hover:bg-indigo-500/[0.08] focus:bg-indigo-500/[0.04] dark:focus:bg-indigo-500/[0.08] focus:text-indigo-500 dark:focus:text-indigo-400"
            >
              <MonitorSmartphone className="mr-2.5 h-4 w-4" /> Active Sessions
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuGroup>

      <DropdownMenuSeparator className="my-1.5 bg-zinc-100 dark:bg-zinc-800/80" />

      <DropdownMenuItem
        onClick={logout}
        className="transition-all duration-150 rounded-xl px-3 py-2 cursor-pointer text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-650 dark:hover:text-red-300 hover:bg-red-500/[0.04] dark:hover:bg-red-500/[0.08] focus:bg-red-500/[0.04] dark:focus:bg-red-500/[0.08] focus:text-red-650 dark:focus:text-red-300"
      >
        <LogOut className="mr-2.5 h-4 w-4" /> Log out
      </DropdownMenuItem>
    </>
  );
}
