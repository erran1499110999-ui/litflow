export const SUPPORTED_LOCALES = [
  "zh-CN",
  "zh-TW",
  "en",
  "ja",
  "ko",
  "de",
  "fr",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as SupportedLocale) || "zh-CN";

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
