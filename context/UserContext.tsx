"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { cookieService } from "@/lib/cookie";
import kycApiService from "@/features/seller/kyc/api.service";
import profileApiService from "@/features/seller/profile/api.service";

type UserContextType = {
  user: any;
  updateUser: (userData: any) => void;
  refreshUserStatus: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

function getUserCookieData() {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  const isAdmin = path.startsWith("/admin");
  const isSeller = path.startsWith("/seller") || path.startsWith("/store") || path.startsWith("/logistics");

  if (isAdmin) {
    const adminUserStr = cookieService.getCookie("admin_user");
    if (adminUserStr) {
      try {
        const adminObj = JSON.parse(adminUserStr);
        if (adminObj && (adminObj.role === "admin" || adminObj.role === "superadmin" || adminObj.role === "super_admin" || adminObj.email)) {
          return adminObj;
        }
      } catch (e) {}
    }
    const defaultUserStr = cookieService.getCookie("user");
    if (defaultUserStr) {
      try {
        const defaultObj = JSON.parse(defaultUserStr);
        if (defaultObj && defaultObj.role !== "seller") {
          return defaultObj;
        }
      } catch (e) {}
    }
    return null;
  }

  if (isSeller) {
    const sellerUserStr = cookieService.getCookie("seller_user");
    if (sellerUserStr) {
      try {
        const sellerObj = JSON.parse(sellerUserStr);
        if (sellerObj) return sellerObj;
      } catch (e) {}
    }
  }

  const defaultUserStr = cookieService.getCookie("user");
  if (defaultUserStr) {
    try { return JSON.parse(defaultUserStr); } catch (e) {}
  }
  return null;
}

export function UserProvider({ children }: { children: ReactNode }) {
  // Initialize state synchronously with correct cookie for current route to prevent flashing
  const [user, setUser] = useState<any>(getUserCookieData);

  const refreshUserStatus = async () => {
    const parsedUser = getUserCookieData();
    if (!parsedUser) return;

    const isSellerRoute = typeof window !== "undefined" && (
      window.location.pathname.startsWith("/seller") || 
      window.location.pathname.startsWith("/store") || 
      window.location.pathname.startsWith("/logistics")
    );

    if (isSellerRoute && parsedUser.role === "seller") {
      try {
        const token = cookieService.getCookie("seller_token") || cookieService.getCookie("user_token");
        if (token) {
          const [statusData, meData]: any = await Promise.all([
            kycApiService.getKycStatus().catch(() => null),
            profileApiService.getMe().catch(() => null),
          ]);

          let firstName = parsedUser.firstName;
          let lastName = parsedUser.lastName;
          let companyName = parsedUser.companyName;
          let sellerName = parsedUser.sellerName;
          let email = parsedUser.email;
          let phone = parsedUser.phone;
          let storeName = parsedUser.storeName;

          if (meData) {
            firstName = meData.firstName ?? firstName;
            lastName = meData.lastName ?? lastName;
            companyName = meData.companyName ?? meData.basicInformation?.companyName ?? companyName;
            sellerName = meData.sellerName ?? sellerName;
            email = meData.email ?? email;
            phone = meData.mobile ?? phone;
            storeName = companyName || storeName;
          }

          const rawCandidate = [firstName, lastName].filter(Boolean).join(" ").trim();
          const isGeneric = !parsedUser.name || ["seller", "admin", "undefined", "null", "undefined undefined", "null null"].includes(parsedUser.name.toLowerCase());
          const resolvedName =
            (rawCandidate && rawCandidate !== "undefined" && rawCandidate !== "null")
              ? rawCandidate
              : (companyName || (sellerName && sellerName.toLowerCase() !== "seller" ? sellerName : "") || (email ? email.split("@")[0] : "") || (!isGeneric ? parsedUser.name : "") || "Seller");

          const updatedUser = {
            ...parsedUser,
            firstName,
            lastName,
            companyName,
            sellerName,
            storeName: storeName || companyName || "Ad2Ship",
            name: resolvedName,
            email,
            phone,
            businessType: meData?.businessType ?? meData?.business_type ?? parsedUser?.businessType ?? "d2c",
            // Shipping / Payment / SMTP settings ka gate — lib/custom-theme.ts.
            hasCustomTheme: meData?.hasCustomTheme ?? parsedUser?.hasCustomTheme,
            // pixel-panda shows Ad2Ship Commission only to commission sellers.
            commissionDeduction: meData?.commissionDeduction ?? parsedUser?.commissionDeduction,
            ...(statusData
              ? {
                  status: statusData.status,
                  isProfileComplete: statusData.isProfileComplete,
                  isDocumentComplete: statusData.isDocumentComplete,
                  isAccountCompleted: statusData.isAccountCompleted,
                  isKycWarehouse: statusData.isKycWarehouse ?? statusData.isKycWarehouseCompleted ?? false,
                  isKycComplete: statusData.isKycComplete,
                  isKycCompleted: statusData.isKycCompleted ?? false,
                  isKycVerified: statusData.isKycVerified ?? false,
                  kycStatus: statusData.kycStatus ?? 0,
                  rejectionReason: statusData.rejectionReason,
                  entitlements: statusData.entitlements ?? parsedUser.entitlements,
                }
              : {}),
          };

          cookieService.setCookie("seller_user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (error) {
        console.error("Failed to refresh seller user status:", error);
      }
    } else {
      setUser(parsedUser);
    }
  };

  useEffect(() => {
    const current = getUserCookieData();
    if (current) {
      setUser(current);
    }
    refreshUserStatus();

    const handlePageShow = () => {
      const pageUser = getUserCookieData();
      if (pageUser) {
        setUser(pageUser);
      }
      refreshUserStatus();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  useEffect(() => {
    const isSellerRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/seller");
    const isKycApproved = Boolean(user?.isKycVerified ?? (user?.kycStatus === 1));
    const shouldPoll =
      isSellerRoute &&
      user &&
      user.role === "seller" &&
      user.isKycComplete &&
      !isKycApproved;

    if (!shouldPoll) return;

    const interval = setInterval(() => {
      refreshUserStatus();
    }, 10000); 

    return () => clearInterval(interval);
  }, [user]);

  const updateUser = useCallback((userData: any) => {
    setUser((prev: any) => {
      if (!userData) {
        const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
        if (isAdmin) {
          cookieService.deleteCookie("admin_user");
          cookieService.deleteCookie("admin_token");
          cookieService.deleteCookie("authToken");
        } else {
          cookieService.deleteCookie("seller_user");
          cookieService.deleteCookie("seller_token");
        }
        cookieService.deleteCookie("user");
        return null;
      }
      const merged = { ...prev, ...userData };
      const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
      if (isAdmin || merged.role === "admin" || merged.role === "superadmin" || merged.role === "super_admin") {
        cookieService.setCookie("admin_user", JSON.stringify(merged));
      } else {
        cookieService.setCookie("seller_user", JSON.stringify(merged));
      }
      cookieService.setCookie("user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser, refreshUserStatus }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
