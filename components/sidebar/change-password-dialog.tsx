"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import profileApiService from "@/features/seller/profile/api.service";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FieldState {
  value: string;
  show: boolean;
  error: string;
}

const initialField = (): FieldState => ({ value: "", show: false, error: "" });

/* ── password strength ── */
function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Very Weak", color: "bg-red-500" };
  if (score === 2) return { score, label: "Weak", color: "bg-orange-400" };
  if (score === 3) return { score, label: "Fair", color: "bg-amber-400" };
  if (score === 4) return { score, label: "Strong", color: "bg-emerald-400" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

function PasswordInput({
  id,
  label,
  placeholder,
  field,
  onChange,
  onToggle,
  hint,
}: {
  id: string;
  label: string;
  placeholder: string;
  field: FieldState;
  onChange: (val: string) => void;
  onToggle: () => void;
  hint?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
        {label}
      </Label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <Input
          id={id}
          type={field.show ? "text" : "password"}
          placeholder={placeholder}
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-9 pr-10 h-11 text-sm font-medium border-slate-200 dark:border-zinc-700/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl transition-all duration-200 ${field.error ? "border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-500/10" : ""}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
        >
          {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {field.error && (
        <p className="flex items-center gap-1.5 text-[10px] font-semibold text-red-500 dark:text-red-400 mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {field.error}
        </p>
      )}
      {hint && !field.error && <div className="mt-1">{hint}</div>}
    </div>
  );
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [oldPwd, setOldPwd] = useState<FieldState>(initialField());
  const [newPwd, setNewPwd] = useState<FieldState>(initialField());
  const [confirmPwd, setConfirmPwd] = useState<FieldState>(initialField());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getStrength(newPwd.value);

  const reset = () => {
    setOldPwd(initialField());
    setNewPwd(initialField());
    setConfirmPwd(initialField());
    setLoading(false);
    setSuccess(false);
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const validate = (): boolean => {
    let valid = true;

    const setErr = (
      setter: React.Dispatch<React.SetStateAction<FieldState>>,
      msg: string
    ) => {
      setter((prev) => ({ ...prev, error: msg }));
      valid = false;
    };

    setOldPwd((p) => ({ ...p, error: "" }));
    setNewPwd((p) => ({ ...p, error: "" }));
    setConfirmPwd((p) => ({ ...p, error: "" }));

    if (!oldPwd.value) setErr(setOldPwd, "Current password is required");
    if (!newPwd.value) {
      setErr(setNewPwd, "New password is required");
    } else if (newPwd.value.length < 8) {
      setErr(setNewPwd, "Must be at least 8 characters");
    } else if (newPwd.value === oldPwd.value) {
      setErr(setNewPwd, "New password must differ from current password");
    }
    if (!confirmPwd.value) {
      setErr(setConfirmPwd, "Please confirm your new password");
    } else if (confirmPwd.value !== newPwd.value) {
      setErr(setConfirmPwd, "Passwords do not match");
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await profileApiService.changePassword({
        oldPassword: oldPwd.value,
        newPassword: newPwd.value,
        confirmPassword: confirmPwd.value,
      });
      setSuccess(true);
      toast.success("Password changed successfully!", {
        description: "Your new password is active. Use it for your next login.",
      });
      setTimeout(() => handleClose(false), 1800);
    } catch (err: any) {
      const msg = err?.message ?? "Failed to change password. Please try again.";
      // map backend error to the correct field
      if (msg.toLowerCase().includes("current") || msg.toLowerCase().includes("incorrect")) {
        setOldPwd((p) => ({ ...p, error: msg }));
      } else if (msg.toLowerCase().includes("match")) {
        setConfirmPwd((p) => ({ ...p, error: msg }));
      } else {
        toast.error("Error", { description: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl shadow-black/20 dark:shadow-black/40 rounded-2xl">

        {/* Header gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 z-10" />

        {/* Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-6 pb-8 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
          />
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/5 rounded-full blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center shadow-lg flex-shrink-0">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg font-black text-white tracking-tight">
                Change Password
              </DialogTitle>
              <DialogDescription className="text-indigo-200 text-xs font-medium mt-0.5">
                Update your account password. Make it strong!
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white dark:bg-zinc-950 -mt-4 rounded-t-3xl relative z-10">
          {success ? (
            /* Success state */
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-400/30">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-base font-extrabold text-slate-800 dark:text-zinc-100">Password Updated!</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-[220px]">
                Your password has been changed successfully.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Current Password */}
              <PasswordInput
                id="old-password"
                label="Current Password"
                placeholder="Enter your current password"
                field={oldPwd}
                onChange={(v) => setOldPwd((p) => ({ ...p, value: v, error: "" }))}
                onToggle={() => setOldPwd((p) => ({ ...p, show: !p.show }))}
              />

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100 dark:bg-zinc-800" />
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-300 dark:text-zinc-600">New password</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-zinc-800" />
              </div>

              {/* New Password */}
              <PasswordInput
                id="new-password"
                label="New Password"
                placeholder="Create a strong password"
                field={newPwd}
                onChange={(v) => setNewPwd((p) => ({ ...p, value: v, error: "" }))}
                onToggle={() => setNewPwd((p) => ({ ...p, show: !p.show }))}
                hint={
                  newPwd.value ? (
                    <div className="space-y-1.5">
                      {/* Strength bar */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-slate-100 dark:bg-zinc-800"}`}
                          />
                        ))}
                      </div>
                      <p className={`text-[9px] font-extrabold uppercase tracking-widest ${
                        strength.score <= 2 ? "text-red-400" :
                        strength.score === 3 ? "text-amber-400" : "text-emerald-500"
                      }`}>{strength.label}</p>
                    </div>
                  ) : null
                }
              />

              {/* Confirm Password */}
              <PasswordInput
                id="confirm-password"
                label="Confirm New Password"
                placeholder="Repeat your new password"
                field={confirmPwd}
                onChange={(v) => setConfirmPwd((p) => ({ ...p, value: v, error: "" }))}
                onToggle={() => setConfirmPwd((p) => ({ ...p, show: !p.show }))}
                hint={
                  confirmPwd.value && !confirmPwd.error && confirmPwd.value === newPwd.value ? (
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </p>
                  ) : null
                }
              />

              {/* Requirements hint */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/8 border border-indigo-100 dark:border-indigo-500/15">
                <ShieldCheck className="w-4 h-4 text-indigo-400 dark:text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold leading-relaxed">
                  Use at least 8 characters with a mix of uppercase, numbers, and symbols for a strong password.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  disabled={loading}
                  className="flex-1 h-11 text-xs font-bold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 border-0 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
