"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { buildAdminNavItems } from "./admin-nav.config";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  React.useEffect(() => {
    if (!pathname || !pathname.startsWith("/admin") || pathname.startsWith("/admin/auth") || pathname === "/admin/dashboard") {
      return;
    }

    if (!user) return;

    const dept = String(user?.department || user?.role || "").toLowerCase().trim();
    const perms: string[] = Array.isArray(user?.permissions) ? user.permissions : [];
    const caps = user?.capabilities || {};
    const isSuper = caps.isSuperAdmin === true || perms.includes("*") || dept === "superadmin" || dept === "super_admin";
    const isAdminRole = isSuper || dept === "admin" || dept === "administrator";

    if (isAdminRole) {
      return;
    }

    if (pathname.startsWith("/admin/profile") || pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/notifications")) {
      return;
    }

    const navItems = buildAdminNavItems(user);
    const isAuthorized = navItems.some((group) => {
      if (group.url && (pathname === group.url || pathname.startsWith(group.url + "/") || pathname.startsWith(group.url + "?"))) return true;
      return group.items?.some(
        (sub) => pathname === sub.url || pathname.startsWith(sub.url + "/") || pathname.startsWith(sub.url + "?")
      );
    });

    if (!isAuthorized) {
      toast.error("Access Denied: You do not have permission to access this module.");
      router.push("/admin/dashboard");
    }
  }, [pathname, user, router]);

  return <>{children}</>;
}
