"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/react";
import { ModalProvider } from "@/components/modal-provider";
import { UserProvider } from "@/context/UserContext";
import { CartProvider } from "@/context/CartContext";
import { GeolocationTracker } from "./geolocation-tracker";

// Suppress false-positive React 19 script tag warning in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    origError.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <TooltipProvider delayDuration={120}>
        <ModalProvider>
          <UserProvider>
            <CartProvider>
              <NuqsAdapter>
                <GeolocationTracker />
                {children}
              </NuqsAdapter>
            </CartProvider>
          </UserProvider>
        </ModalProvider>
      </TooltipProvider>
    </NextThemesProvider>
  );
}
