"use client";

import { useEffect } from "react";

export function useStorefrontLightMode() {
  useEffect(() => {
    const enforceLight = () => {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
      }
      if (!document.documentElement.classList.contains("light")) {
        document.documentElement.classList.add("light");
      }
      document.documentElement.style.colorScheme = "light";
    };

    enforceLight();
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains("dark")) {
        enforceLight();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);
}
