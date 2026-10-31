"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cookieService } from "@/lib/cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Phone, ArrowRight, ShieldCheck, Users, ShoppingBag,
  Package, BarChart3, Globe, Shield, Activity, Users2, ShieldAlert,
} from "lucide-react";
import authService from "../api.service";
import Image from "next/image";
import { toast } from "sonner";

const loginSchema = z.object({
  identifier: z.string().min(1, "Please enter your Email or Mobile Number").refine(val => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const isMobile = /^[6-9]\d{9}$/.test(val);
    return isEmail || isMobile;
  }, "Please enter a valid Email Address or a 10-digit Mobile Number"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState("");

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = async (values: LoginFormData) => {
    setLoading(true);
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.identifier);
      const payload = isEmail ? { email: values.identifier } : { mobile: values.identifier };
      const response = await authService.sendOTP(payload);
      if (response) {
        if (isEmail) {
          cookieService.setCookie("pendingEmail", values.identifier);
          cookieService.deleteCookie("pendingMobile");
        } else {
          cookieService.setCookie("pendingMobile", values.identifier);
          cookieService.deleteCookie("pendingEmail");
        }
        router.push("/auth/verify-otp");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Admin with this mobile number was not found.";
      if (msg.toLowerCase().includes("not active") || msg.toLowerCase().includes("blocked") || msg.toLowerCase().includes("maximum attempts")) {
        setBlockedMessage(msg);
        setIsBlockedModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-x-hidden font-sans p-4 sm:p-6 lg:p-8 relative bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-300">
      {/* Soft background glow accents */}
      <div className="pointer-events-none absolute -top-[12%] -left-[8%] h-[45%] w-[45%] rounded-full bg-indigo-200/50 blur-[120px]" />
      <div className="pointer-events-none absolute -top-[5%] right-[5%] h-[40%] w-[40%] rounded-full bg-amber-200/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-[12%] left-[20%] h-[45%] w-[45%] rounded-full bg-violet-200/40 blur-[120px]" />

      <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 max-w-[1300px] w-full px-2 sm:px-6 xl:px-12 relative z-10">

        {/* LEFT — light illustration panel (hidden on mobile, visible on desktop lg+) */}
        <div className="hidden lg:flex w-[600px] xl:w-[700px] relative flex-col justify-center py-10 shrink-0">

          {/* Soft light orbs */}
          <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-blue-200/50 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[15%] right-[5%] w-[35%] h-[35%] rounded-full bg-amber-100/60 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full">

            {/* Logo + headline */}
            <div className="mb-6">
              <Image src="/logo.png" alt="Ad2Ship Logo" width={130} height={40} className="object-contain mb-5" />
              <h1 className="text-[1.9rem] xl:text-[2.4rem] font-black leading-[1.1] tracking-tight text-zinc-900 mb-3">
                <span>Manage Every Seller.</span><br />
                <span>Control Every Order.</span><br />
                <span>Power Your{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                    Marketplace.
                  </span>
                </span>
              </h1>
              <p className="text-zinc-500 text-[12px] xl:text-[13px] max-w-md font-medium leading-relaxed">
                Everything you need to run your eCommerce platform — sellers, products, orders, inventory, analytics and more.
              </p>
            </div>

            {/* Center floating stats area */}
            <div className="relative flex items-center justify-center my-4 min-h-[300px]">

              {/* Central mockup circle */}
              <div className="w-[280px] xl:w-[320px] aspect-square rounded-full border border-blue-200/60 bg-white/60 backdrop-blur-sm shadow-[0_0_60px_rgba(99,102,241,0.12)] flex items-center justify-center">
                <video autoPlay loop muted playsInline
                  className="w-full h-full rounded-full object-cover opacity-80">
                  <source src="/assets/videos/AD2SHIP.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Left stats */}
              <div className="absolute left-0 top-[5%] flex flex-col gap-2.5 z-20">
                {[
                  { icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50", label: "Orders Today", value: "12,458", trend: "↑ 18.2%" },
                  { icon: Users, color: "text-indigo-500", bg: "bg-indigo-50", label: "Active Sellers", value: "1,254", trend: "↑ 12.5%" },
                  { icon: Package, color: "text-sky-500", bg: "bg-sky-50", label: "Products Live", value: "8,942", trend: "↑ 8.4%" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/80 backdrop-blur-md border border-zinc-200/60 p-2.5 rounded-xl w-36 shadow-md flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                      <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-400 font-medium">{s.label}</div>
                      <div className="text-sm font-bold text-zinc-800 leading-tight">{s.value}</div>
                      <div className="text-[8px] text-emerald-500 font-bold">{s.trend}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right stats */}
              <div className="absolute right-0 top-[0%] flex flex-col gap-2.5 z-20">
                {[
                  { label: "Revenue Today", value: "₹ 2.4 Cr", sub: "↑ 16.7% vs yesterday", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { label: "Platform Health", value: "98.7%", sub: "Excellent", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Total Users", value: "45,682", sub: "↑ 12.3%", icon: Users2, color: "text-indigo-500", bg: "bg-indigo-50" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/80 backdrop-blur-md border border-zinc-200/60 p-2.5 rounded-xl w-32 shadow-md">
                    <div className={`w-6 h-6 rounded-lg ${s.bg} flex items-center justify-center mb-1.5`}>
                      <s.icon className={`w-3 h-3 ${s.color}`} />
                    </div>
                    <div className="text-[9px] text-zinc-400 font-medium">{s.label}</div>
                    <div className="text-sm font-bold text-zinc-800 leading-tight">{s.value}</div>
                    <div className="text-[8px] text-emerald-500 font-bold">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom feature strip */}
            <div className="flex justify-between items-start pt-5 border-t border-zinc-200/60 gap-3 mt-4">
              {[
                { icon: Shield, label: "Enterprise Security", sub: "Bank-grade protection" },
                { icon: BarChart3, label: "Real-time Analytics", sub: "Live data insights" },
                { icon: Activity, label: "AI Monitoring", sub: "Smart anomaly detection" },
                { icon: Globe, label: "Global Scale", sub: "Built to scale globally" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-full border border-zinc-200 bg-white/70 flex items-center justify-center shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-700">{f.label}</div>
                    <div className="text-[9px] text-zinc-400">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Mobile Header Branding (Visible on mobile/tablet < lg) */}
        <div className="flex flex-col items-center gap-2 mb-4 lg:hidden z-10 w-full text-center">
          <Image
            src="/logo.png"
            alt="Ad2Ship Logo"
            width={150}
            height={42}
            priority
            style={{ width: "auto", height: "auto" }}
            className="object-contain"
          />
          <span className="text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/25">
            SUPER ADMIN
          </span>
        </div>

        {/* RIGHT — Login card */}
        <div className="w-full max-w-[420px] xl:max-w-[460px] flex items-center justify-center lg:justify-end z-20 shrink-0">
          <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl shadow-indigo-900/10 border border-zinc-200/70 overflow-hidden">

            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400" />

            <div className="p-6 sm:p-8">
              <div className="hidden lg:flex justify-center mb-6">
                <Image src="/logo.png" alt="Logo" width={110} height={36} className="object-contain" />
              </div>

              <div className="text-center mb-7">
                <h2 className="text-[1.75rem] font-black text-zinc-900 tracking-tight">
                  Welcome <span className="text-blue-600">Back</span>
                </h2>
                <p className="text-zinc-500 mt-1.5 text-[12px] font-medium">
                  Enter your mobile number or email to receive a secure OTP code
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-500 font-bold text-[11px] uppercase tracking-wider">Mobile Number or Email</FormLabel>
                        <FormControl>
                          <div className="relative group/input">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/input:text-blue-500 transition-colors pointer-events-none" />
                            <Input
                              {...field}
                              type="text"
                              onChange={(e) => field.onChange(e.target.value.trim())}
                              placeholder="Enter Email or 10-digit mobile number"
                              className="h-12 pl-10 bg-zinc-50 border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 text-[13px]"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-3">
                    <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-blue-700 leading-relaxed font-medium">
                      A 6-digit verification code will be sent to your registered mobile number or email for secure two-step login.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl font-bold text-[14px] bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20 border-0 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Send Verification OTP
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                256-bit encrypted · Aapka data secure hai
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Blocked Modal Pop-up */}
      <AlertDialog open={isBlockedModalOpen} onOpenChange={setIsBlockedModalOpen}>
        <AlertDialogContent className="max-w-md rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-zinc-950 p-6 shadow-2xl">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <AlertDialogTitle className="text-lg font-black text-zinc-900 dark:text-zinc-50">
              Account Blocked / Deactivated
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed mt-2">
              {blockedMessage || "Your account has been deactivated due to security limits (Maximum failed OTP attempts). Please contact the administrator to unblock your account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 sm:justify-center">
            <AlertDialogAction
              onClick={() => setIsBlockedModalOpen(false)}
              className="w-full sm:w-auto h-10 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/20"
            >
              Understand & Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
