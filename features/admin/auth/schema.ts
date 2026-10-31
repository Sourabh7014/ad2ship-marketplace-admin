import { z } from "zod";

export const getLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({
      message: t("EmailError"),
    }),
    password: z.string().min(8, {
      message: t("PasswordError"),
    }),
  });

export const getForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({
      message: t("EmailError"),
    }),
  });

export const getResetPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({
      message: t("EmailError"),
    }),
    otp: z.string().min(6, {
      message: t("OtpError"),
    }),
    password: z.string().min(8, {
      message: t("PasswordError"),
    }),
    password_confirmation: z.string().min(8, {
      message: t("PasswordError"),
    }),
  });

export type LoginSchema = z.infer<ReturnType<typeof getLoginSchema>>;
export type ForgotPasswordSchema = z.infer<
  ReturnType<typeof getForgotPasswordSchema>
>;
export type ResetPasswordSchema = z.infer<
  ReturnType<typeof getResetPasswordSchema>
>;
