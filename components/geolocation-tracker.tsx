"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function GeolocationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // We do NOT want to prompt for location on admin/seller dashboards or store settings pages.
    const isAdminOrSeller =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/seller") ||
      (pathname.startsWith("/store") && !pathname.startsWith("/storefront"));

    console.log(`[GeolocationTracker] Path: ${pathname}, isAdminOrSeller: ${isAdminOrSeller}`);

    if (isAdminOrSeller) {
      return;
    }

    // Check if we already resolved the country in this session
    const cachedCountry = sessionStorage.getItem("ad2ship_user_country");

    if (cachedCountry) {
      console.log(`[GeolocationTracker] Geolocation skipped: country already cached: ${cachedCountry}`);
      return;
    }

    console.log("[GeolocationTracker] Auto-requesting user location permission...");

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      console.warn("[GeolocationTracker] Geolocation is not supported by this browser/origin.");
      return;
    }

    // Check modern browser permission state
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then((permissionStatus) => {
        console.log(`[GeolocationTracker] Initial Permission State: ${permissionStatus.state}`);
        permissionStatus.onchange = () => {
          console.log(`[GeolocationTracker] Permission State changed to: ${permissionStatus.state}`);
        };
      }).catch((err) => {
        console.warn("[GeolocationTracker] Failed to query permission state:", err);
      });
    }

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`[GeolocationTracker] Coordinates obtained - Latitude: ${latitude}, Longitude: ${longitude}`);

          try {
            // Query free BigDataCloud Reverse Geocoding API to resolve coordinates to country
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const country = data.countryName || "Unknown Country";
            const countryCode = data.countryCode || "N/A";

            // Save country to session cache
            sessionStorage.setItem("ad2ship_user_country", country);
            console.log(`[GeolocationTracker] Success! Country found: ${country} (${countryCode})`);
          } catch (error) {
            console.error("[GeolocationTracker] Failed to resolve country from coordinates:", error);
          }
        },
        (error) => {
          console.warn(`[GeolocationTracker] Geolocation permission denied or failed: ${error.message} (code: ${error.code})`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      console.error("[GeolocationTracker] Exception while calling getCurrentPosition:", err);
    }
  }, [pathname]);

  return null;
}
