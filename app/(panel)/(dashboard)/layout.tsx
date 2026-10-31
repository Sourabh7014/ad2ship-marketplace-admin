import { AdminRouteGuard } from "@/components/sidebar/admin-route-guard";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import Header from "@/components/sidebar/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Metadata } from "next";
import { headers } from "next/headers";
import { SellerKycGuard } from "@/components/sidebar/seller-kyc-guard";
import { getPageTitle } from "@/lib/module-title";

// Title yahin server par resolve hota hai taaki hard refresh par bhi wahi title
// mile jo client-side navigation par Header set karta hai. Dono `getPageTitle`
// use karte hain, isliye ab drift possible nahi.
export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const pathname =
    headerList.get("x-pathname") ??
    headerList.get("x-invoke-path") ??
    "";

  return {
    title: pathname ? getPageTitle(pathname) : "Ad2Ship",
    description: "D2C E-commerce Management Portal",
    icons: {
      icon: "/favicon.png",
    },
  };
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* Open by default (SidebarProvider's own default). `origin/main` set defaultOpen={false} as
       the other half of the hover-to-expand behaviour that was removed from admin-sidebar.tsx —
       without the hover it just left the panel permanently collapsed. */
    <SidebarProvider defaultOpen={true} className="panel-swap-in">
      <AppSidebar />
      <SidebarInset className="overflow-x-clip min-w-0">
        <Header />
        <main className="w-full">
          <AdminRouteGuard><SellerKycGuard>{children}</SellerKycGuard></AdminRouteGuard>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
