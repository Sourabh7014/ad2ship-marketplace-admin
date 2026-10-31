import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["en", "hi"];
export const defaultLocale = "en";

export default getRequestConfig(async () => {
  
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || defaultLocale;

  return {
    locale,
    messages: (await import(`./lang/${locale}.json`)).default,
  };
});
