import { useState } from "react";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Trash2, CheckCircle2, Power, Info, HelpCircle, X } from "lucide-react";

export interface ConfirmDialogOptions {
  title: string;
  variant?: "destructive" | "success";
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (value?: any) => void | Promise<void>;
  showInput?: boolean;
  inputType?: "text" | "textarea";
  inputPlaceholder?: string;
  defaultValue?: string;
}

export const ConfirmDialog = ({
  options,
  onConfirm,
  closeModal: manualCloseModal,
}: {
  options: ConfirmDialogOptions;
  onConfirm?: (result: boolean) => void;
  closeModal?: (result: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(options.defaultValue || "");
  const closeModal = onConfirm || manualCloseModal;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (options.onConfirm) {
        await options.onConfirm(inputValue);
      }
      closeModal?.(true);
    } catch (error) {
      console.error("Confirmation API call failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    closeModal?.(false);
  };

  const titleLower = options.title.toLowerCase();
  const confirmTextLower = (options.confirmText || "").toLowerCase();
  
  const isDelete = titleLower.includes("delete") || confirmTextLower.includes("delete");
  const isDeactivate = titleLower.includes("deactivate") || confirmTextLower.includes("deactivate");
  const isActivate = titleLower.includes("activate") || confirmTextLower.includes("activate") || options.title.includes("Activate");
  const isSuccess = options.variant === "success" || isActivate;

  let ActionIcon = HelpCircle;
  if (isDelete) {
    ActionIcon = Trash2;
  } else if (isDeactivate || isActivate) {
    ActionIcon = Power;
  } else if (isSuccess) {
    ActionIcon = CheckCircle2;
  }

  const theme = (() => {
    if (isDelete) {
      return {
        glow: "bg-rose-500/10 dark:bg-rose-500/5 blur-3xl",
        iconBg: "bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-500 dark:text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.15)]",
        confirmBtn: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md shadow-red-500/20 dark:shadow-red-950/30 focus-visible:ring-red-500/30",
        cancelBtn: "hover:bg-zinc-50 dark:hover:bg-zinc-900 focus-visible:ring-zinc-500/30",
        pulseColor: "bg-rose-400/20",
      };
    }
    if (isDeactivate) {
      return {
        glow: "bg-amber-500/10 dark:bg-amber-500/5 blur-3xl",
        iconBg: "bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-500 dark:text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)]",
        confirmBtn: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/20 dark:shadow-amber-950/30 focus-visible:ring-amber-500/30",
        cancelBtn: "hover:bg-zinc-50 dark:hover:bg-zinc-900 focus-visible:ring-zinc-500/30",
        pulseColor: "bg-amber-400/20",
      };
    }
    if (isActivate || isSuccess) {
      return {
        glow: "bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl",
        iconBg: "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-500 dark:text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
        confirmBtn: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 dark:shadow-emerald-950/30 focus-visible:ring-emerald-500/30",
        cancelBtn: "hover:bg-zinc-50 dark:hover:bg-zinc-900 focus-visible:ring-zinc-500/30",
        pulseColor: "bg-emerald-400/20",
      };
    }
    return {
      glow: "bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-500 dark:text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.15)]",
      confirmBtn: "bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-750 text-white shadow-md shadow-indigo-500/20 dark:shadow-indigo-950/30 focus-visible:ring-indigo-500/30",
      cancelBtn: "hover:bg-zinc-50 dark:hover:bg-zinc-900 focus-visible:ring-zinc-500/30",
      pulseColor: "bg-indigo-400/20",
    };
  })();

  const formatDescription = (text?: string) => {
    if (!text) return null;
    const parts = text.split(/("[^"]*")/g);
    return parts.map((part, index) => {
      if (part.startsWith('"') && part.endsWith('"')) {
        const cleanText = part.slice(1, -1);
        return (
          <span
            key={index}
            className={`font-black px-2.5 py-0.5 rounded-lg border text-xs select-all inline-block mx-0.5 my-0.5 ${
              isDelete
                ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-455"
                : isDeactivate
                ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-455"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-650 dark:text-indigo-400"
            }`}
          >
            {cleanText}
          </span>
        );
      }
      return <span key={index} className="text-zinc-500 dark:text-zinc-400">{part}</span>;
    });
  };

  return (
    <div className="relative overflow-hidden select-none p-2">
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none -z-10 ${theme.glow}`} />

      <DialogHeader className="flex flex-col items-center justify-center text-center">
        <div className="relative flex items-center justify-center mb-5 mt-2">
          <div className={`absolute inset-0 rounded-2xl animate-ping opacity-25 scale-110 duration-1000 ${theme.pulseColor}`} />
          
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 duration-300 relative z-10 ${theme.iconBg}`}>
            <ActionIcon className="h-7 w-7 stroke-[2.25]" />
          </div>
        </div>

        <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-tight">
          {options.title}
        </DialogTitle>

        <DialogDescription className="text-sm font-medium leading-relaxed max-w-sm mt-3.5 block text-center">
          {formatDescription(options.description)}
        </DialogDescription>
      </DialogHeader>

      {options.showInput && (
        <div className="py-5 px-1">
          {options.inputType === "textarea" ? (
            <Textarea
              placeholder={options.inputPlaceholder || "Enter remarks..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="min-h-[100px] resize-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 text-sm font-medium transition-all"
              autoFocus
            />
          ) : (
            <Input
              placeholder={options.inputPlaceholder || "Enter value..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 text-sm font-medium transition-all"
              autoFocus
            />
          )}
        </div>
      )}

      <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-center mt-7">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className={`h-11 min-w-[125px] rounded-xl font-extrabold text-xs cursor-pointer border border-zinc-200/80 dark:border-zinc-800/85 text-zinc-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-950/35 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 shadow-sm flex items-center justify-center gap-1.5 focus-visible:ring-2 ${theme.cancelBtn}`}
        >
          <X className="h-3.5 w-3.5" />
          {options.cancelText || "Cancel"}
        </Button>
        
        <Button
          onClick={handleConfirm}
          disabled={isLoading || (options.showInput && !inputValue.trim())}
          className={`h-11 min-w-[125px] rounded-xl font-extrabold text-xs cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 flex items-center justify-center gap-1.5 focus-visible:ring-2 ${theme.confirmBtn}`}
        >
          {isLoading ? (
            <svg
              className="animate-spin h-3.5 w-3.5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <ActionIcon className="h-3.5 w-3.5" />
          )}
          {options.confirmText || "Confirm"}
        </Button>
      </DialogFooter>
    </div>
  );
};
