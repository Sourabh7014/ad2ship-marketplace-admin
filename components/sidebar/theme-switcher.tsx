"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      className={cn(
        "relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        isDark
          ? "border-indigo-500/60 bg-indigo-950"
          : "border-amber-300/80 bg-amber-50"
      )}
    >
      {/* Track icons */}
      <Sun
        className={cn(
          "absolute left-1 h-3.5 w-3.5 transition-all duration-300",
          isDark ? "opacity-0 scale-50" : "opacity-70 scale-100 text-amber-500"
        )}
      />
      <Moon
        className={cn(
          "absolute right-1 h-3.5 w-3.5 transition-all duration-300",
          isDark ? "opacity-70 scale-100 text-indigo-300" : "opacity-0 scale-50"
        )}
      />

      {/* Thumb */}
      <span
        className={cn(
          "absolute h-5 w-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center",
          isDark
            ? "translate-x-[26px] bg-indigo-500 shadow-indigo-500/40"
            : "translate-x-[2px] bg-amber-400 shadow-amber-400/40"
        )}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-white" />
        ) : (
          <Sun className="h-3 w-3 text-white" />
        )}
      </span>
    </button>
  );
}
