"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { SellerSidebar } from "./seller-sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const isSeller = pathname.startsWith("/seller");

  if (isSeller) {
    return <SellerSidebar {...props} />;
  }

  return <AdminSidebar {...props} />;
}
