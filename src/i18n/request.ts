import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n";

export default getRequestConfig(async () => {
  const locale = DEFAULT_LOCALE;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
