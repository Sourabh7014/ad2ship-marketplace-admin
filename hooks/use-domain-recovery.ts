"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * useDomainRecovery
 *
 * Browser ke back button press karne ke baad storefront pages
 * mein ?domain= param missing ho jaata hai. Ye hook sessionStorage
 * se domain recover karke URL ko fix karta hai taaki page sahi se load ho.
 *
 * @param domain - The domain prop already received by the server component (may be undefined on back navigation)
 */
export function useDomainRecovery(domain?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentDomain = searchParams.get("domain");

    // If domain is already present in URL, just persist it and return
    if (currentDomain) {
      try {
        sessionStorage.setItem("sf_domain", currentDomain);
      } catch {}
      return;
    }

    // domain missing from URL — try to recover from sessionStorage
    let recoveredDomain: string | null = null;
    try {
      recoveredDomain = sessionStorage.getItem("sf_domain");
    } catch {}

    // Also try from the passed prop
    if (!recoveredDomain && domain) {
      recoveredDomain = domain;
    }

    if (recoveredDomain) {
      // Rebuild the URL with the domain param and replace (not push) so back still works
      const params = new URLSearchParams(searchParams.toString());
      params.set("domain", recoveredDomain);
      const newUrl = `${pathname}?${params.toString()}`;
      router.replace(newUrl);
    }
  // We intentionally only run this once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
