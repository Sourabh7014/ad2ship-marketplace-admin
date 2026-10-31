"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2Off, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { useRecharge, useWalletBalance } from "@/features/seller/wallet/hooks";

const SUGGESTED = [500, 1000, 2000, 5000, 10000];

/** Header wallet pill: live server balance + a recharge dialog reusing the wallet hooks. */
export function WalletRecharge() {
  const { balance, pendingCommission, unlinked, loading, refetch } = useWalletBalance();
  const { recharge, paying } = useRecharge(refetch);
  const [open, setOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("2000");

  const baseAmount = Number(amountInput) || 0;
  const validAmount = /^\d+(\.\d{1,2})?$/.test(amountInput.trim()) && baseAmount > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 h-9 pl-2.5 pr-3 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/45 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-950 hover:border-indigo-500/50 transition-all duration-200 cursor-pointer group"
          >
            <span className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            {loading ? (
              <Skeleton className="h-4 w-14" />
            ) : (
              <span
                className={`font-mono font-black text-sm leading-none ${
                  (balance ?? 0) < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                ₹{(balance ?? 0).toFixed(2)}
              </span>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <Wallet className="h-5 w-5 text-indigo-500" />
              Recharge Wallet
            </DialogTitle>
          </DialogHeader>

          {unlinked && !loading ? (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-semibold">
              <Link2Off className="w-4 h-4 shrink-0" />
              Logistics not linked yet. Ask an admin to link your seller account before recharging.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Live balance */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Available Balance
                </span>
                {loading ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <span className="font-mono font-black text-lg text-zinc-900 dark:text-zinc-100">
                    ₹{(balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Recharge Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-400 dark:text-zinc-500 font-extrabold text-sm pointer-events-none">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    disabled={paying}
                    min="1"
                    placeholder="Enter amount"
                    className="block w-full pl-8 py-5 text-lg font-black rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/40 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant={baseAmount === amt ? "default" : "outline"}
                    onClick={() => setAmountInput(amt.toString())}
                    disabled={paying}
                    className={`h-8 px-3.5 text-xs font-bold rounded-lg cursor-pointer ${
                      baseAmount === amt
                        ? "bg-indigo-650 hover:bg-indigo-755 text-white"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    + ₹{amt.toLocaleString("en-IN")}
                  </Button>
                ))}
              </div>

              {/* Pay */}
              <Button
                onClick={() => validAmount && recharge(amountInput.trim())}
                disabled={paying || !validAmount || loading}
                className="w-full h-11 bg-indigo-650 hover:bg-indigo-755 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    Waiting for Payment Gateway...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5" />
                    Pay ₹{baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} via Razorpay
                  </>
                )}
              </Button>

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                  Card, UPI and netbanking are presented inside the Razorpay checkout window. Your wallet is credited only
                  after the payment is captured and verified server-side.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* pixel-panda header: commission sellers see what is still to be deducted. */}
      {!loading && pendingCommission > 0 && (
        <span
          title="Total Commission Due (5% + GST)"
          className="hidden sm:flex items-center h-9 px-3 rounded-xl border border-red-500/40 bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-semibold whitespace-nowrap"
        >
          Pending Commission: ₹{pendingCommission.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
        </span>
      )}
    </>
  );
}
