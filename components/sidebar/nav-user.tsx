"use client";

import { useState, useEffect, useMemo } from "react";
import { LogOut, ChevronUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserDropdownContent } from "./user-dropdown-content";
import { ChangePasswordDialog } from "./change-password-dialog";
import { cn } from "@/lib/utils";
import { cookieService } from "@/lib/cookie";
import { useUser } from "@/context/UserContext";

export function NavUser({
  user,
  onDropdownOpenChange,
}: {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  } | null;
  onDropdownOpenChange?: (open: boolean) => void;
}) {
  const { user: globalUser } = useUser();
  const { isMobile, setOpen } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);

  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cookieUser, setCookieUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const isSeller =
        window.location.pathname.startsWith("/seller") ||
        window.location.pathname.startsWith("/store") ||
        window.location.pathname.startsWith("/logistics");
      if (isSeller) {
        const sellerStr = cookieService.getCookie("seller_user") || cookieService.getCookie("user");
        if (sellerStr) {
          setCookieUser(JSON.parse(sellerStr));
          return;
        }
      }
      const adminStr = cookieService.getCookie("admin_user") || cookieService.getCookie("user");
      if (adminStr) setCookieUser(JSON.parse(adminStr));
    } catch (e) {}
  }, []);

  // Server par cookies nahi hote, isliye wahan user hamesha null render hota hai.
  // Mount se pehle client bhi null hi le, warna pehla client render server HTML se
  // alag hota hai aur React stale "Seller" / "SE" text patch hi nahi karta.
  const currentUser = mounted ? user || globalUser || cookieUser : null;

  const handleOpenChange = (isOpen: boolean) => {
    setMenuOpen(isOpen);
    onDropdownOpenChange?.(isOpen);
    if (isOpen) {
      setOpen(true);
    }
  };

  const fullName = [
    currentUser?.firstName || cookieUser?.firstName,
    currentUser?.lastName || cookieUser?.lastName,
  ].filter(Boolean).join(" ").trim();

  const rawName = (currentUser?.name || cookieUser?.name)?.trim();
  const isGeneric = !rawName || ["seller", "admin", "undefined", "null", "undefined undefined", "null null"].includes(rawName.toLowerCase());
  const validName = !isGeneric ? rawName : "";

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.role === "super_admin" ||
    cookieUser?.role === "admin" ||
    (mounted && window.location.pathname.startsWith("/admin"));

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

  // Mount se pehle placeholder text ki jagah khali rakho — "Seller" flash na ho.
  const safeInitials = mounted ? initials : "";
  const safeDisplayName = mounted ? displayName : "";
  const safeDisplayEmail = mounted ? displayEmail : "";
  const safeDisplayAvatar = mounted ? displayAvatar : "";

  return (
    <>
      {/* Dialog is OUTSIDE the DropdownMenu so it doesn't unmount when dropdown closes */}
      <ChangePasswordDialog open={changePwdOpen} onOpenChange={setChangePwdOpen} />

      <DropdownMenu open={menuOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2.5 rounded-2xl p-2.5 text-left transition-all duration-200 cursor-pointer select-none",
              "bg-[var(--sidebar-accent)] hover:bg-zinc-200/70 dark:hover:bg-zinc-800/70 active:scale-[0.99]",
              "border border-zinc-200/50 dark:border-zinc-800/60 shadow-2xs",
              "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:rounded-xl"
            )}
          >
            <Avatar className="h-9 w-9 shrink-0 rounded-full ring-2 ring-indigo-500/20 dark:ring-indigo-500/35">
              <AvatarImage src={safeDisplayAvatar} alt={safeDisplayName} className="object-cover rounded-full" />
              <AvatarFallback className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[12px] font-extrabold flex items-center justify-center">
                {safeInitials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <div className="truncate text-[13px] font-extrabold text-zinc-900 dark:text-zinc-50">
                {safeDisplayName}
              </div>
              <div className="truncate text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                {safeDisplayEmail}
              </div>
            </div>

            <div className="shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors group-data-[collapsible=icon]:hidden pr-1">
              <LogOut className="h-4 w-4" />
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          onMouseEnter={() => setOpen(true)}
          className="w-60 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-1.5 animate-in fade-in slide-in-from-left-2 duration-200 z-50"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={12}
        >
          <UserDropdownContent
            user={currentUser}
            onChangePassword={() => setChangePwdOpen(true)}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
