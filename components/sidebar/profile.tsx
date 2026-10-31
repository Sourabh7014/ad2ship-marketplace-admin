"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserDropdownContent } from "./user-dropdown-content";
import { ChangePasswordDialog } from "./change-password-dialog";
import { useUser } from "@/context/UserContext";
import { cookieService } from "@/lib/cookie";

export function Profile({
  user,
}: {
  user?: { name?: string; email?: string; avatar?: string } | null;
}) {
  const { user: globalUser } = useUser();
  const [mounted, setMounted] = useState(false);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [cookieUser, setCookieUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const isSeller =
        window.location.pathname.startsWith("/seller") ||
        window.location.pathname.startsWith("/store") ||
        window.location.pathname.startsWith("/logistics");
      if (isSeller) {
        const s = cookieService.getCookie("seller_user") || cookieService.getCookie("user");
        if (s) {
          setCookieUser(JSON.parse(s));
          return;
        }
      }
      const a = cookieService.getCookie("admin_user") || cookieService.getCookie("user");
      if (a) setCookieUser(JSON.parse(a));
    } catch (e) {}
  }, []);

  // Server par user hamesha null hota hai — mount se pehle client bhi wahi le, warna
  // hydration mismatch me server ka "S" avatar me atka reh jaata hai.
  const activeUser = mounted ? user || globalUser || cookieUser : null;

  const fullName = [
    activeUser?.firstName,
    activeUser?.lastName,
  ].filter(Boolean).join(" ").trim();

  const rawName = activeUser?.name?.trim();
  const isGeneric = !rawName || ["seller", "admin", "undefined", "null", "undefined undefined", "null null"].includes(rawName.toLowerCase());
  const validName = !isGeneric ? rawName : "";

  const isAdmin =
    activeUser?.role === "admin" ||
    activeUser?.role === "super_admin";

  const displayName =
    fullName ||
    validName ||
    activeUser?.companyName ||
    activeUser?.sellerName ||
    activeUser?.storeName ||
    (activeUser?.email ? activeUser.email.split("@")[0] : "") ||
    (isAdmin ? "Admin" : "Seller");

  const displayAvatar =
    activeUser?.avatar ||
    activeUser?.profileImage ||
    "";

  const initialLetter = mounted ? displayName.charAt(0).toUpperCase() || (isAdmin ? "A" : "S") : "";

  return (
    <>
      <ChangePasswordDialog open={changePwdOpen} onOpenChange={setChangePwdOpen} />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 relative rounded-full ring-2 ring-indigo-500/20 dark:ring-indigo-500/35 hover:ring-indigo-500/80 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm overflow-hidden p-0 cursor-pointer select-none"
          >
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={displayAvatar} alt={displayName} className="object-cover" />
              <AvatarFallback
                className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-extrabold text-[12px] shadow-sm flex items-center justify-center"
              >
                {initialLetter}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200"
          side="bottom"
          align="end"
          sideOffset={6}
        >
          <UserDropdownContent
            user={activeUser}
            onChangePassword={() => setChangePwdOpen(true)}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
