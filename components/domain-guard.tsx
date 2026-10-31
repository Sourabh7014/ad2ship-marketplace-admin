"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function DomainGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    const currentDomain = searchParams.get("domain");

    // Domain already present — persist and continue
    if (currentDomain) {
      try {
        sessionStorage.setItem("sf_domain", currentDomain);
      } catch {}
      return;
    }

    // Domain missing — try to recover from sessionStorage
    let recoveredDomain: string | null = null;
    try {
      recoveredDomain = sessionStorage.getItem("sf_domain");
    } catch {}

    if (recoveredDomain) {
      setIsRecovering(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("domain", recoveredDomain);
      const newUrl = `${pathname}?${params.toString()}`;
      // Use replace so history stack stays clean for back navigation
      router.replace(newUrl);
    }
  // Run only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isRecovering) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-sans">Loading store...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-400 font-sans">Loading store...</p>
    </div>
  </div>
);

/**
 * DomainGuard
 *
 * Jab browser back button press hota hai, Next.js server component ko
 * ?domain= param ke bina call kar deta hai jiski wajah se "No domain specified"
 * error page aa jaata hai.
 *
 * Ye component client side par mount hone ke baad check karta hai:
 * - Agar ?domain= URL mein hai → seedha render karo children
 * - Agar ?domain= missing hai → sessionStorage se recover karo aur redirect karo
 */
export function DomainGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DomainGuardInner>{children}</DomainGuardInner>
    </Suspense>
  );
}
