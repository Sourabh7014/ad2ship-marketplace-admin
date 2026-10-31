"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  AlertTriangle,
  Scale,
  FileText,
  LifeBuoy,
  SlidersHorizontal,
  ChevronsLeft,
  ChevronDown,
  Wrench,
  RotateCcw,
  Bell,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const NAV_MAIN = [
  { title: "Dashboard", url: "/logistics", icon: LayoutDashboard },
  { title: "Orders", url: "/logistics/orders", icon: Box },
  { title: "Returns", url: "/logistics/returns", icon: RotateCcw },
  { title: "NDR Panel", url: "/logistics/ndr", icon: AlertTriangle, badge: "89" },
  { title: "Weight Reco", url: "/logistics/weight-reco", icon: Scale },
];

const NAV_FINANCE = [
  { title: "Billing", url: "/logistics/billing", icon: FileText },
];

const NAV_TOOLS = [
  { title: "Customers", url: "/logistics/tools/customers" },
  { title: "Rate Calculator", url: "/logistics/tools/rate-calculator" },
  { title: "Rate Card", url: "/logistics/tools/rate-card" },
  { title: "Channels", url: "/logistics/tools/channels" },
  { title: "Courier Preference", url: "/logistics/tools/courier-preference" },
  { title: "Warehouse", url: "/logistics/tools/warehouse" },
];

const NAV_ACCOUNT = [
  { title: "Notifications", url: "/logistics/notifications", icon: Bell },
  { title: "Support", url: "/logistics/support", icon: LifeBuoy },
  { title: "Settings", url: "/logistics/settings", icon: SlidersHorizontal },
];

export function LogisticsSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar {...props} collapsible="icon" className="border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-4 mt-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:px-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563eb] text-white text-[15px] font-black shadow-sm shrink-0">
              A2
            </div>
            <span className="text-[15px] font-black tracking-wide text-slate-900 dark:text-white group-data-[collapsible=icon]:hidden">
              AD2SHIP
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-800 transition-colors shadow-sm shrink-0"
          >
            <span className="text-[14px] font-bold mt-[-2px] ml-[1px] inline-block transition-transform group-data-[collapsible=icon]:rotate-180">«</span>
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 px-3">
            Main
          </SidebarGroupLabel>
          <SidebarMenu>
            {NAV_MAIN.map((item) => {
              const isActive =
                item.url === "/logistics/orders"
                  ? pathname === item.url || pathname.startsWith("/logistics/orders/create")
                  : item.url === "/logistics/returns"
                  ? pathname === item.url || pathname.startsWith("/logistics/orders/reverse")
                  : pathname === item.url || (pathname.startsWith(item.url) && item.url !== "/logistics");

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "h-10 px-3 transition-colors",
                      isActive
                        ? "bg-blue-50/80 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-bold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="mr-2 group-data-[collapsible=icon]:mr-0" style={{ width: 18, height: 18 }} />
                      <span className="text-[14px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge className="bg-red-100/80 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full mr-1 h-5 flex items-center justify-center min-w-6">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 px-3">
            Finance
          </SidebarGroupLabel>
          <SidebarMenu>
            {NAV_FINANCE.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url);
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "h-10 px-3 transition-colors",
                      isActive
                        ? "bg-blue-50/80 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-bold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="mr-2 group-data-[collapsible=icon]:mr-0" style={{ width: 18, height: 18 }} />
                      <span className="text-[14px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 px-3">
            Tools
          </SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible defaultOpen={pathname.startsWith("/logistics/tools")} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Tools"
                    className={cn(
                      "h-10 px-3 transition-colors",
                      pathname.startsWith("/logistics/tools")
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                    )}
                  >
                    <Wrench className="mr-2 group-data-[collapsible=icon]:mr-0" style={{ width: 18, height: 18 }} />
                    <span className="text-[14px] group-data-[collapsible=icon]:hidden">Tools</span>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" style={{ width: 16, height: 16 }} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {NAV_TOOLS.map((item) => {
                      const isActive = pathname.startsWith(item.url);
                      return (
                        <SidebarMenuSubItem key={item.url}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive}
                            className={cn(
                              "h-9 transition-colors",
                              isActive
                                ? "bg-blue-50/80 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-bold"
                                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                            )}
                          >
                            <Link href={item.url}>
                              <span className="text-[13.5px]">{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 px-3">
            Account
          </SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ACCOUNT.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url);
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "h-10 px-3 transition-colors",
                      isActive
                        ? "bg-blue-50/80 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-bold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="mr-2 group-data-[collapsible=icon]:mr-0" style={{ width: 18, height: 18 }} />
                      <span className="text-[14px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
