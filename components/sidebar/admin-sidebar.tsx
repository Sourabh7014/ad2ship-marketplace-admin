"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/sidebar/nav-group";
import { NavUser } from "@/components/sidebar/nav-user";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import type { NavGroup as NavGroupType } from "@/components/sidebar/types";
import { buildAdminSidebarNavItems } from "./admin-nav.config";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeUser = mounted ? user : null;

  const navGroups: NavGroupType[] = React.useMemo(() => {
    return [
      {
        title: "",
        items: buildAdminSidebarNavItems(activeUser) as any,
      },
    ];
  }, [activeUser]);

  return (
    <Sidebar
      collapsible="icon"
      className="bg-white border-r border-zinc-200 shadow-sm"
      {...props}
    >
      {/* ── Header with Logo ── */}
      <SidebarHeader className="h-24 justify-center py-3">
        <div className="flex items-center justify-center px-4 overflow-hidden">
          <Image
            src="/logo.png"
            alt="Ad2Ship Logo"
            width={220}
            height={60}
            priority
            className="object-contain transition-all duration-300 w-full max-w-[215px] h-auto group-data-[collapsible=icon]:hidden"
          />
          <Image
            src="/favicon.png"
            alt="Ad2Ship Logo"
            width={36}
            height={36}
            priority
            className="object-contain transition-all duration-300 hidden group-data-[collapsible=icon]:block"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className={cn(
        "p-2 space-y-4",
        "[&_[data-active=true]]:bg-blue-50! dark:[&_[data-active=true]]:bg-blue-950/40!",
        "[&_[data-active=true]]:border-0! [&_[data-active=true]]:border-transparent! [&_[data-active=true]]:outline-none! [&_[data-active=true]]:ring-0! [&_[data-active=true]]:shadow-none! [&_[data-active=true]]:rounded-xl!",
        "[&_[data-active=true]:hover]:bg-blue-100/70! dark:[&_[data-active=true]:hover]:bg-blue-950/60!",
        "[&_[data-active=true]_span]:text-blue-600! dark:[&_[data-active=true]_span]:text-blue-400! [&_[data-active=true]_span]:font-bold!",
        "[&_[data-active=true]_svg]:text-blue-600! dark:[&_[data-active=true]_svg]:text-blue-400!",
        "[&_[data-active=true]_.rounded-full]:hidden!",
        "group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:size-9 group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:justify-center group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:px-0 group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:gap-0",
        "group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]>span]:hidden group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]>svg~svg]:hidden"
      )}>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      {/* ── Footer with User Profile & Dropdown ── */}
      <SidebarFooter className="px-3.5 pb-4 pt-2">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
