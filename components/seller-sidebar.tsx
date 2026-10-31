"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { cookieService } from "@/lib/cookie";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    href: "/seller/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/seller/products",
    icon: Package,
  },
  {
    label: "Collections",
    href: "/seller/collections",
    icon: Layers,
  },
  {
    label: "Orders",
    href: "/seller/orders/dashboard",
    icon: ShoppingCart,
  },
  {
    label: "Payments",
    href: "/seller/payments",
    icon: Wallet,
  },
  {
    label: "Settings",
    href: "/seller/settings",
    icon: Settings,
  },
  {
    label: "Support",
    href: "/seller/support",
    icon: HelpCircle,
  },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    cookieService.deleteCookie("seller_token");
    cookieService.deleteCookie("user");
    router.push("/seller/auth/login");
  };

  return (
    <>
      {}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white dark:bg-gray-800"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-40",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <Link href="/seller/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                A2S
              </div>
              <span className="font-bold text-lg">Ad2Ship</span>
            </Link>
          </div>

          {}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.includes(item.href.split("/").pop() || "");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.storeName || "Ad2Ship"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {user?.email}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
