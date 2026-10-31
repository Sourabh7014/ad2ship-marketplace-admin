import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad2Ship",
  description: "D2C E-commerce Management Portal",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
