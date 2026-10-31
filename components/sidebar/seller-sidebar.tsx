"use client";

import * as React from "react";
import {
  Megaphone,
  LayoutGrid,
  CreditCard,
  BarChartBig,
  Settings,
  Truck,
  Headphones,
  MapPin,
  ClipboardList,
  Layers,
  Package,
  Image as ImageIcon,
  Users,
  Star,
  Bell,
  Banknote,
  TrendingUp,
  LogOut,
  Tag,
  Scale,
  Wrench,
  Store,
  RotateCcw,
  Wallet,
  AlertTriangle,
} from "lucide-react";

import { NavGroup } from "@/components/sidebar/nav-group";
import { NavUser } from "@/components/sidebar/nav-user";
import type { NavGroup as NavGroupType, NavItem } from "@/components/sidebar/types";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { resolveEntitlements, isModuleVisible, type Entitlements } from "@/lib/entitlements";
import { isLogisticsSeller } from "@/lib/business-type";
import { hasCustomTheme } from "@/lib/custom-theme";

function isVisible(module: string | undefined, ent: Entitlements): boolean {
  return module ? isModuleVisible(module, ent) : true;
}

function filterItems(items: NavItem[], ent: Entitlements): NavItem[] {
  const out: NavItem[] = [];
  for (const item of items) {
    if (!isVisible(item.module, ent)) continue;
    if (item.items) {
      const kids = filterItems(item.items, ent);
      if (kids.length === 0) {
        if (item.url) {
          const { items: _drop, ...link } = item;
          out.push(link as NavItem);
        }
        continue;
      }
      out.push({ ...item, items: kids } as NavItem);
    } else {
      out.push(item);
    }
  }
  return out;
}

function filterGroups(groups: NavGroupType[], ent: Entitlements): NavGroupType[] {
  return groups
    .map((g) => ({ ...g, items: filterItems(g.items, ent) }))
    .filter((g) => g.items.length > 0);
}

export function SellerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const ent = React.useMemo(() => resolveEntitlements(user), [user]);
  const { setOpen, state } = useSidebar();
  const dropdownOpenRef = React.useRef(false);
  const isHoveredRef = React.useRef(false);

  // A logistics seller ships other people's goods and has no storefront, so the
  // whole Store module is d2c only — their connected channels live under
  // Settings → Channel instead.
  const isLogistics = isLogisticsSeller(user);
  const showStorefrontSettings = !isLogistics && hasCustomTheme(user);
  // pixel-panda billing.blade.php: Ad2Ship Commission only when commission_deduction = '1'.
  const showCommission = Boolean(user?.commissionDeduction);

  const navGroups: NavGroupType[] = React.useMemo(
    () => [
      {
        title: "Main",
        items: [
          { title: "Dashboard", url: "/seller/dashboard", icon: LayoutGrid },
          ...(isLogistics
            ? []
            : [
              {
                title: "Store",
                url: "/seller/store",
                icon: Store,
                items: [
                  { title: "Product", url: "/seller/products" },
                  { title: "Category", url: "/seller/categories" },
                  { title: "Collection", url: "/seller/collections" },
                  {
                    title: "Inventory",
                    items: [
                      { title: "Dashboard", url: "/seller/inventory" },
                      { title: "Inventory List", url: "/seller/inventory/list" },
                      { title: "Low Stock Alert", url: "/seller/inventory/alerts" },
                      { title: "Inventory History", url: "/seller/inventory/history" },
                    ],
                  },
                  { title: "Warehouse", url: "/seller/warehouse" },
                  { title: "Media", url: "/seller/media/product" },
                  { title: "Customer", url: "/seller/customers/list" },
                  {
                    title: "Discounts",
                    items: [
                      { title: "All Discounts", url: "/seller/discounts" },
                      { title: "Create Discount", url: "/seller/discounts/new" },
                      { title: "Coupon Codes", url: "/seller/discounts/codes" },
                      { title: "Automatic Discounts", url: "/seller/discounts/automatic" },
                      { title: "Usage History", url: "/seller/discounts/usage" },
                    ],
                  },
                ],
              },
            ]),
          {
            title: "Order",
            icon: ClipboardList,
            items: [
              { title: "Order List", url: "/seller/orders/list/new" },
              { title: "Create Order", url: "/seller/orders/create" },
            ],
          },
          { title: "NDR", url: "/seller/ndr", icon: AlertTriangle },
          {
            title: "Returns",
            icon: RotateCcw,
            items: [
              { title: "Order List", url: "/seller/orders/returns" },
              { title: "Create Order", url: "/seller/orders/create-reverse" },
              // Exchange sirf apne storefront ka concept hai — logistics seller
              // dusron ka maal bhejta hai, uske paas storefront hi nahi.
              ...(isLogistics
                ? []
                : [{ title: "Exchange Requests", url: "/seller/orders/exchanges" }]),
            ],
          },
          // Its own entry rather than a Billing sub-item — for d2c and logistics sellers
          // alike, since both get this one nav list.
          { title: "Weight Discrepancy", url: "/seller/weight-reconciliation", icon: Scale },
          // pixel-panda's Tool module. Shipping tools, not storefront ones, so d2c and
          // logistics sellers both get it.
          {
            title: "Tool",
            icon: Wrench,
            items: [
              { title: "Rate Calculator", url: "/seller/tool/rate-calculator" },
              { title: "Rate Card", url: "/seller/tool/rate-card" },
              { title: "Courier Preference", url: "/seller/tool/courier-preference" },
            ],
          },
          {
            title: "Billing",
            icon: Wallet,
            items: [
              { title: "Shipping Charges", url: "/seller/billing/shipping-charges" },
              { title: "Passbook", url: "/seller/billing/passbook" },
              { title: "COD Remittance", url: "/seller/billing/cod-remittance" },
              ...(showCommission
                ? [{ title: "Ad2Ship Commission", url: "/seller/billing/ad2ship-commission" }]
                : []),
              { title: "Invoice", url: "/seller/billing/invoice" },
              { title: "Credit Note", url: "/seller/billing/credit-note" },
              { title: "All Recharge", url: "/seller/billing/recharge" },

            ],
          },
          { title: "Report", url: "/seller/report", icon: BarChartBig },
          { title: "Support", url: "/seller/support", icon: Headphones },
          {
            title: "Notification",
            icon: Bell,
            items: [
              { title: "Templete", url: "/seller/notification/templete" },
              { title: "Logs", url: "/seller/notification/logs" },
            ],
          },
          {
            title: "Settings",
            icon: Settings,
            items: [
              { title: "Company Profile", url: "/seller/profile" },
              // d2c seller apne channels aur warehouse Store ke andar manage karta
              // hai; logistics ke paas Store nahi, isliye unke liye yahi entry point hai.
              ...(isLogistics
                ? [
                  { title: "Channel", url: "/seller/my-channels" },
                  { title: "Warehouse", url: "/seller/warehouse" },
                ]
                : []),
              { title: "Account Settings", url: "/seller/settings/account" },
              { title: "Active Sessions", url: "/seller/settings/sessions" },
              { title: "Label Setting", url: "/seller/settings/labels" },
              // Storefront ki shipping, gateways aur order mail — sirf custom-theme
              // store par. Shopify/Woo ka checkout unka platform chalata hai, aur
              // logistics seller ka storefront hi nahi.
              ...(showStorefrontSettings
                ? [
                  { title: "Shipping", url: "/seller/settings/shipping" },
                  { title: "Payment Settings", url: "/seller/settings/payments" },
                  { title: "SMTP Settings", url: "/seller/settings/smtp" },
                ]
                : []),
              { title: "API & Webhooks", url: "/seller/settings/api" },
              { title: "Abandoned Orders", url: "/seller/abandoned-orders" },
            ],
          },
        ],
      },
    ],
    [isLogistics, showStorefrontSettings, showCommission],
  );

  const visibleGroups = React.useMemo(() => filterGroups(navGroups, ent), [navGroups, ent]);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      variant="sidebar"
      onMouseEnter={() => {
        isHoveredRef.current = true;
        setOpen(true);
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        if (!dropdownOpenRef.current) {
          setOpen(false);
        }
      }}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden group-data-[collapsible=icon]:overflow-visible transition-[width,background-color,border-color] duration-150 ease-out",
          "bg-[var(--sidebar)] text-slate-800 border-r border-[var(--sidebar-border)] dark:text-zinc-300",
          // Design: active = soft indigo pill with indigo text, at every level.
          "[&_[data-active=true]]:bg-indigo-500/10! [&_[data-active=true]]:rounded-[10px] dark:[&_[data-active=true]]:bg-indigo-400/15!",
          "[&_[data-active=true]_span]:text-indigo-700! [&_[data-active=true]_svg]:text-indigo-600! [&_[data-active=true]_span]:font-semibold",
          "dark:[&_[data-active=true]_span]:text-indigo-300! dark:[&_[data-active=true]_svg]:text-indigo-400!",
          // Icons neutral, matching labels
          "[&_span]:text-slate-600 dark:[&_span]:text-zinc-300",
          "[&_svg]:text-slate-500 dark:[&_svg]:text-zinc-400",
          "[&_[data-sidebar=menu-button]:not([data-active=true]):hover]:bg-[var(--sidebar-accent)]! dark:[&_[data-sidebar=menu-button]:not([data-active=true]):hover]:bg-[var(--sidebar-accent)]!",
        )}
      >
        {/* ── Header ── */}
        <SidebarHeader className="h-20 justify-center">
          <div className="flex items-center justify-center px-4 group-data-[collapsible=icon]:px-2 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Ad2Ship Logo"
              width={170}
              height={48}
              priority
              style={{ width: "100%", height: "auto" }}
              className="object-contain transition-all duration-300 max-w-[165px] group-data-[collapsible=icon]:max-w-[36px]"
            />
          </div>
        </SidebarHeader>

        <SidebarContent
          className={cn(
            "px-3.5 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:overflow-visible scrollbar-none",
            // Roomier rounded items with breathing room between them
            "[&_[data-sidebar=menu-button]]:h-9 [&_[data-sidebar=menu-button]]:rounded-[10px] [&_[data-sidebar=menu-button]]:px-2.5 [&_[data-sidebar=menu-button]]:gap-2.5 [&_[data-sidebar=menu-button]]:font-medium",
            // Collapsed rail: ye arbitrary-variant selectors button ke apne
            // `group-data-[collapsible=icon]:p-2!` se zyada specific hain, isliye collapsed
            // par padding wapas square karna padta hai — warna label span 48px rail ke bahar
            // nikal jaata hai aur wrapper ka `overflow-visible` (HoverCard ke liye zaroori)
            // use clip nahi karta.
            "group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:size-9 group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:justify-center group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:px-0 group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:gap-0",
            // Label span aur trailing chevron chhupao; icon (pehla svg) dikhta rahe.
            "group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]>span]:hidden group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]>svg~svg]:hidden",
            "[&_[data-sidebar=menu-sub-button]]:h-8 [&_[data-sidebar=menu-sub-button]]:rounded-[10px]",
            "[&_[data-sidebar=menu]]:gap-1.5 [&_[data-sidebar=menu-sub]]:gap-1 [&_[data-sidebar=menu-sub]]:py-1",
            // Smooth hover/active colour changes
            "[&_[data-sidebar=menu-button]]:transition-all [&_[data-sidebar=menu-button]]:duration-150 [&_[data-sidebar=menu-sub-button]]:transition-all [&_[data-sidebar=menu-sub-button]]:duration-150",
          )}
        >
          <nav className="flex flex-1 flex-col group-data-[collapsible=icon]:gap-1">
            {visibleGroups.map((group) => (
              <NavGroup key={group.title} {...group} />
            ))}
          </nav>
        </SidebarContent>

        {/* ── Footer ── */}
        <SidebarFooter className="px-3.5 pb-4 pt-2">
          <NavUser
            user={user}
            onDropdownOpenChange={(isOpen) => {
              dropdownOpenRef.current = isOpen;
              if (!isOpen && !isHoveredRef.current) {
                setOpen(false);
              }
            }}
          />
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
