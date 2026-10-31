"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
  Loader2, Lock, ArrowRight, Clock, ShieldCheck,
  ShoppingCart, Users, Pencil, Info, RefreshCw, AlertCircle, ShieldAlert,
} from "lucide-react";
import { cookieService } from "@/lib/cookie";
import { useUser } from "@/context/UserContext";
import authService from "../api.service";
import Image from "next/image";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type OTPFormData = z.infer<typeof otpSchema>;

export function OTPVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [mobile, setMobile] = useState<string>("");

  useEffect(() => {
    const urlMobile = searchParams?.get("mobile");
    const cookieMobile = cookieService.getCookie("pendingMobile") || cookieService.getCookie("pendingEmail");
    const finalMobile = urlMobile || cookieMobile || "";
    setMobile(finalMobile);
    if (!finalMobile) {
      toast.error("Email or Mobile number not found. Please start over.");
      router.push("/admin/auth/login");
    }
  }, [searchParams, router]);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (timeLeft <= 0) { setCanResend(true); return; }
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const [isBlocked, setIsBlocked] = useState(false);

  const onSubmit = async (values: OTPFormData) => {
    if (!mobile) { toast.error("Identifier not found."); router.push("/admin/auth/login"); return; }
    setLoading(true);
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mobile);
      const payload = isEmail ? { email: mobile, otp: values.otp } : { mobile: mobile, otp: values.otp };
      const response = await authService.verifyOTP(payload);
      if (response) {
        const userData = response as any;
        if (!userData.accessToken) { toast.error("Verification failed: Session token not received."); return; }
        cookieService.setCookie("admin_token", userData.accessToken);
        cookieService.setCookie("authToken", userData.accessToken);
        cookieService.setCookie("refreshToken", userData.refreshToken);
        cookieService.setCookie("admin_user", JSON.stringify(userData));
        cookieService.setCookie("user", JSON.stringify(userData));
        updateUser(userData);
        cookieService.deleteCookie("pendingMobile");
        cookieService.deleteCookie("pendingEmail");
        toast.success("Login successful!");
        const redirect = cookieService.getCookie("redirect");
        if (redirect) { cookieService.deleteCookie("redirect"); router.push(redirect); }
        else router.push("/admin/dashboard");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Invalid OTP. Please try again.";
      if (msg.toLowerCase().includes("maximum attempts") || msg.toLowerCase().includes("account blocked") || msg.toLowerCase().includes("not active")) {
        setIsBlocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!mobile) { toast.error("Identifier not found."); return; }
    setResendLoading(true);
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mobile);
      const payload = isEmail ? { email: mobile } : { mobile: mobile };
      await authService.sendOTP(payload);
      toast.success(`OTP resent to your registered ${isEmail ? 'email' : 'mobile number'}`);
      setTimeLeft(600);
      setCanResend(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to resend OTP";
      if (msg.toLowerCase().includes("maximum attempts") || msg.toLowerCase().includes("account blocked") || msg.toLowerCase().includes("not active")) {
        setIsBlocked(true);
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-auto font-sans py-8 px-4"
      style={{ background: "linear-gradient(135deg, #e0eaff 0%, #f0f4ff 40%, #fef9ee 100%)" }}>

      <div className="flex flex-row items-center justify-between gap-6 max-w-[1300px] w-full px-6 xl:px-12">

        {/* LEFT — Info panel */}
        <div className="w-[520px] xl:w-[600px] relative flex flex-col justify-start py-6">

          {/* Soft orbs */}
          <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-amber-100/50 blur-[90px] pointer-events-none" />

          <div className="relative z-10 h-full flex flex-col">

            {/* Logo */}
            <div className="mb-7">
              <Image src="/logo.png" alt="Logo" width={130} height={40} className="object-contain" />
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-xl">
              <h1 className="text-[2rem] xl:text-[2.4rem] font-black leading-[1.1] tracking-tight text-zinc-900 mb-3">
                Two-Step<br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Authentication
                </span>
              </h1>
              <p className="text-zinc-500 text-[13px] mb-8 font-medium leading-relaxed">
                Protect your administrator account with secure verification.<br />
                Enter the 6-digit code sent to your registered email or mobile number.
              </p>

              {/* OTP video */}
              <div className="relative mb-6 rounded-2xl overflow-hidden border border-blue-100 shadow-lg">
                <video src="/assets/videos/otp.mp4" autoPlay loop muted playsInline
                  className="w-full h-auto max-h-[150px] object-cover block" />
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full px-2.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-blue-600 text-[9px] font-semibold tracking-wider uppercase">Secure OTP</span>
                </div>
              </div>

              {/* 3 info cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Lock, color: "text-blue-500", bg: "bg-blue-50", title: "Session Protection", desc: "Prevents unauthorized access to your admin account." },
                  { icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50", title: "Valid 10 Minutes", desc: "Every verification code expires automatically." },
                  { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", title: "Enterprise Security", desc: "AES-256 encrypted authentication." },
                ].map((c) => (
                  <div key={c.title} className="bg-white/80 backdrop-blur-md border border-zinc-200/60 p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
                    <div className={`w-10 h-10 rounded-full ${c.bg} flex items-center justify-center mb-3`}>
                      <c.icon className={`w-5 h-5 ${c.color}`} />
                    </div>
                    <h3 className="text-zinc-800 text-[11px] font-bold mb-1.5">{c.title}</h3>
                    <p className="text-zinc-400 text-[10px] leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom stats */}
            <div className="border-t border-zinc-200/60 pt-5 mt-2">
              <div className="flex items-center gap-8 mb-3">
                {[
                  { icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50", value: "10,000+", label: "Orders Managed Daily" },
                  { icon: Users, color: "text-indigo-500", bg: "bg-indigo-50", value: "500+", label: "Active Sellers" },
                  { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", value: "99.9%", label: "Secure Authentication" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <div>
                      <div className="text-zinc-800 font-bold text-[12px]">{s.value}</div>
                      <div className="text-zinc-400 text-[10px]">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>© 2026 AD2SHIP Technologies Pvt. Ltd.</span>
                <span>All rights reserved.</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT — OTP card */}
        <div className="w-[380px] xl:w-[420px] flex items-center justify-center z-20 shrink-0">
          <div className="w-full bg-white rounded-3xl border border-zinc-200/70 shadow-2xl shadow-indigo-900/10 overflow-hidden">

            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400" />

            <div className="p-7">
              <div className="flex justify-center mb-4">
                <Image src="/logo.png" alt="Logo" width={90} height={30} className="object-contain" />
              </div>

              <div className="text-center mb-5">
                <h2 className="text-[1.5rem] font-black text-zinc-900 tracking-tight mb-1">
                  Verify <span className="text-blue-600">Identity</span>
                </h2>
                <p className="text-zinc-500 text-[12px] font-medium">Enter the 6-digit code sent to</p>
                <div className="inline-flex items-center gap-2 mt-2 bg-zinc-50 border border-zinc-200 px-4 py-1.5 rounded-full">
                  <span className="text-zinc-700 text-[12px] font-bold">{mobile}</span>
                  <button onClick={() => router.push("/admin/auth/login")} type="button" className="text-blue-500 hover:text-blue-600">
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 w-full">
                        <FormLabel className="text-zinc-500 font-bold text-[10px] uppercase tracking-wider text-center">Verification Code</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} value={field.value} onChange={field.onChange}
                            pattern={REGEXP_ONLY_DIGITS} inputMode="numeric" autoFocus className="w-full">
                            <div className="flex gap-2 w-full">
                              {[...Array(6)].map((_, i) => (
                                <InputOTPGroup key={i} className="flex-1">
                                  <InputOTPSlot index={i} className={cn(
                                    "w-full h-12 text-base font-bold rounded-xl border-zinc-200 bg-zinc-50 text-zinc-900 transition-all",
                                    "data-[active=true]:border-blue-500 data-[active=true]:ring-4 data-[active=true]:ring-blue-500/10 data-[active=true]:bg-white"
                                  )} />
                                </InputOTPGroup>
                              ))}
                            </div>
                          </InputOTP>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs text-center" />
                      </FormItem>
                    )}
                  />

                  {isBlocked && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex gap-3 text-left">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-extrabold text-rose-900 mb-0.5">
                          Maximum attempts reached, account blocked.
                        </p>
                        <p className="text-[10px] text-rose-700 leading-relaxed font-medium">
                          Your account has been deactivated due to security limits. Please contact the administrator.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-3">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-blue-800 mb-0.5">
                        OTP expires in <span className="font-mono text-blue-600">{formatTime(timeLeft)}</span>
                      </p>
                      <p className="text-[10px] text-blue-700/70 leading-relaxed font-medium">
                        Please check your SMS or Email for the verification code.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}
                    className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20 border-0 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <><span className="text-[13px]">Verify Code</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center">
                <p className="text-[11px] text-zinc-500 font-medium mb-2">Didn't receive the code?</p>
                <Button onClick={handleResendOTP} type="button" disabled={!canResend || resendLoading}
                  variant="outline"
                  className="w-full h-11 border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-xl disabled:opacity-50 text-[12px] font-bold">
                  {resendLoading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />Resending...</>
                  ) : (
                    <><RefreshCw className="w-3.5 h-3.5 mr-2" />Resend OTP {canResend ? "" : `(${formatTime(timeLeft)})`}</>
                  )}
                </Button>
              </div>

              <div className="mt-5 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                  <Lock className="w-3 h-3" />
                  Your verification code is encrypted and used only once.
                </div>
                <div className="text-[10px] text-zinc-400">
                  Need help?{" "}
                  <a href="mailto:support@ad2ship.com" className="text-blue-500 hover:underline">
                    support@ad2ship.com
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Account Blocked Modal Pop-up */}
      <AlertDialog open={isBlocked} onOpenChange={setIsBlocked}>
        <AlertDialogContent className="max-w-md rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-zinc-950 p-6 shadow-2xl">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <AlertDialogTitle className="text-lg font-black text-zinc-900 dark:text-zinc-50">
              Account Blocked / Deactivated
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed mt-2">
              Maximum attempts reached. Your account has been deactivated due to security limits. Please contact the administrator to unblock your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 sm:justify-center">
            <AlertDialogAction
              onClick={() => setIsBlocked(false)}
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
