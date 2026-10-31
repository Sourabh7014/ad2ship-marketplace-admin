"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Clock, ShieldCheck, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { sellerTokenClaims } from "@/lib/seller-cache";

export function SellerKycGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isSellerRoute = pathname.startsWith("/seller");
  const isKycRoute = pathname.startsWith("/seller/kyc");

  const isSeller = isSellerRoute && Boolean(user);

  // Sirf admin ka "Login as seller" session guard skip kare — backend us token par
  // `isBypassLogin: true` lagata hai. Admin cookie ka hona kaafi nahi: /admin aur
  // /seller ek hi origin par chalte hain, to admin login ke baad har naya seller
  // bhi bina KYC ke panel khol leta tha.
  const isAdminBypass = sellerTokenClaims()?.isBypassLogin === true;

  // KYC approval is tracked by isKycVerified / kycStatus, not by the seller's
  // account `status` — an account can be "active" with KYC still unsubmitted.
  const isKycApproved = Boolean(user?.isKycVerified ?? (user?.kycStatus === 1));

  const isKycIncomplete = Boolean(
    isSeller && !isAdminBypass && !isKycApproved && !user.isKycComplete
  );

  const isPendingApproval = Boolean(
    isSeller && !isAdminBypass && !isKycApproved && user.isKycComplete
  );

  const isSuspended = Boolean(
    isSeller && !isAdminBypass && (user.status === "suspend" || user.status === "suspended")
  );

  const isRejected = Boolean(
    isSeller && !isAdminBypass && user.status === "rejected" && !isPendingApproval
  );

  useEffect(() => {
    if (isAdminBypass || !isKycIncomplete || isKycRoute) {
      setIsDialogOpen(false);
      return;
    }

    // Auto open the dialog initially
    setIsDialogOpen(true);

    const interval = setInterval(() => {
      setIsDialogOpen(true);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isAdminBypass, isKycIncomplete, isKycRoute]);

  if (isAdminBypass || (!isPendingApproval && !isSuspended && !isRejected && !isKycIncomplete)) {
    return <>{children}</>;
  }

  const shouldDisableInteractions = isSuspended || isPendingApproval || isKycIncomplete || isRejected;

  return (
    <div className="flex flex-col gap-4 w-full h-full pt-4 px-4">

      {isKycIncomplete && (
        /* ── KYC Incomplete Banner ── */
        <div
          onClick={() => {
            let kycStepUrl = "/seller/kyc/basic";
            if (user) {
              if (user.isProfileComplete) {
                if (!user.isDocumentComplete) kycStepUrl = "/seller/kyc/document";
                else if (!user.isAccountCompleted) kycStepUrl = "/seller/kyc/account";
                else kycStepUrl = "/seller/kyc/warehouse";
              }
            }
            router.push(kycStepUrl);
          }}
          className="relative rounded-2xl overflow-hidden border border-rose-200/60 dark:border-rose-800/40 bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/20 shadow-sm select-none cursor-pointer hover:opacity-95 transition-opacity"
        >
          {/* Top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-orange-500 to-rose-600" />

          <div className="flex items-start gap-4 p-4 pt-5">
            {/* Icon */}
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[13px] font-extrabold text-rose-700 dark:text-rose-400 tracking-tight">
                  Complete Your KYC
                </h3>
                <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Action Required
                </span>
              </div>
              <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 mt-1 font-medium leading-relaxed">
                Please upload your KYC documents to activate your seller account and enable full store operations. <span className="underline font-bold text-rose-600 dark:text-rose-400">Complete your KYC. Tap here</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPendingApproval && (
        /* ── KYC Pending Banner ── */
        <div className="relative rounded-2xl overflow-hidden border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 shadow-sm select-none">
          {/* Top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

          <div className="flex items-start gap-4 p-4 pt-5">
            {/* Icon */}
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Clock className="h-5 w-5 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[13px] font-extrabold text-amber-700 dark:text-amber-400 tracking-tight">
                  KYC Verification In Progress
                </h3>
                <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                  Awaiting Approval
                </span>
              </div>
              <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 mt-1 font-medium leading-relaxed">
                Your KYC documents have been submitted and are currently under review by the Ad2Ship admin team.
                Full dashboard access will be enabled once your account is verified and activated.
              </p>
              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Documents Received
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Estimated Review: 24 Hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSuspended && (
        /* ── Account Suspended Banner ── */
        <div className="relative rounded-2xl overflow-hidden border border-rose-200/60 dark:border-rose-800/40 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20 shadow-sm select-none">
          {/* Top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-400 via-red-400 to-rose-500" />

          <div className="flex items-start gap-4 p-4 pt-5">
            {/* Icon */}
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[13px] font-extrabold text-rose-700 dark:text-rose-400 tracking-tight">
                  Account Suspended
                </h3>
                <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />
                  Suspended
                </span>
              </div>
              <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 mt-1 font-medium leading-relaxed">
                Your seller account has been suspended due to regulatory compliance or administrative review.
                All actions on the dashboard are disabled. Please contact the administrator to resolve this issue.
              </p>
              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Contact Administrator
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        /* ── KYC Rejected Banner ── */
        <div className="relative rounded-2xl overflow-hidden border border-rose-200/60 dark:border-rose-800/40 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20 shadow-sm select-none">
          {/* Top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-400 via-red-400 to-rose-500" />

          <div className="flex items-start gap-4 p-4 pt-5">
            {/* Icon */}
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[13px] font-extrabold text-rose-700 dark:text-rose-400 tracking-tight">
                  KYC Rejected
                </h3>
                <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />
                  Rejected
                </span>
              </div>
              <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 mt-1 font-medium leading-relaxed">
                Your KYC submission was rejected by the administrator.
                {user?.rejectionReason && <span className="font-bold text-rose-600 dark:text-rose-400"> Reason: {user.rejectionReason}</span>}
                <br />
                All actions on the dashboard are disabled. Please update your KYC documents to resolve this issue.
              </p>
              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 cursor-pointer hover:underline" onClick={() => router.push('/seller/kyc/basic')}>
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Update KYC Documents
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Content Beneath ── */}
      {shouldDisableInteractions ? (
        <div className="pointer-events-none select-none opacity-55 cursor-not-allowed filter grayscale-[25%]">
          {children}
        </div>
      ) : (
        <div>{children}</div>
      )}

      {/* KYC Alert Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md border-rose-100 dark:border-rose-900/40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
          <DialogHeader className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center animate-bounce">
              <AlertCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">
              Action Required: Complete Your KYC
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Your store is currently restricted. Please complete your KYC verification to list products, manage orders, and initiate courier pickups.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-1/2 h-10 text-xs font-bold rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
            >
              Remind Me in 10s
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(false);
                let kycStepUrl = "/seller/kyc/basic";
                if (user) {
                  if (user.isProfileComplete) {
                    if (!user.isDocumentComplete) kycStepUrl = "/seller/kyc/document";
                    else if (!user.isAccountCompleted) kycStepUrl = "/seller/kyc/account";
                    else kycStepUrl = "/seller/kyc/warehouse";
                  }
                }
                router.push(kycStepUrl);
              }}
              className="w-full sm:w-1/2 h-10 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white shadow-md shadow-rose-500/20 cursor-pointer"
            >
              Verify KYC Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
