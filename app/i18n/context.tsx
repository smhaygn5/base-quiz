"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import englishCatalog from "./catalogs/en.json";

const LOCALE_STORAGE_KEY = "baseQuizLocaleV2";

export const SUPPORTED_LANGUAGES = [
  { code: "en", short: "EN", name: "English" },
  { code: "tr", short: "TR", name: "Türkçe" },
  { code: "es", short: "ES", name: "Español" },
  { code: "pt", short: "PT", name: "Português" },
  { code: "fr", short: "FR", name: "Français" },
  { code: "de", short: "DE", name: "Deutsch" },
  { code: "ru", short: "RU", name: "Русский" },
  { code: "ar", short: "AR", name: "العربية" },
  { code: "zh", short: "ZH", name: "简体中文" },
  { code: "ja", short: "JA", name: "日本語" },
  { code: "ko", short: "KO", name: "한국어" },
] as const;

export type Locale = (typeof SUPPORTED_LANGUAGES)[number]["code"];
type Params = Record<string, string | number>;
type Catalog = {
  messages: Record<string, string>;
  questions?: Record<string, string>;
  quiz: Record<string, {
    question: string;
    answers: Record<string, string>;
  }>;
};

const catalogLoaders: Record<Locale, () => Promise<Catalog>> = {
  en: async () => englishCatalog,
  tr: async () => (await import("./catalogs/tr.json")).default,
  es: async () => (await import("./catalogs/es.json")).default,
  pt: async () => (await import("./catalogs/pt.json")).default,
  fr: async () => (await import("./catalogs/fr.json")).default,
  de: async () => (await import("./catalogs/de.json")).default,
  ru: async () => (await import("./catalogs/ru.json")).default,
  ar: async () => (await import("./catalogs/ar.json")).default,
  zh: async () => (await import("./catalogs/zh.json")).default,
  ja: async () => (await import("./catalogs/ja.json")).default,
  ko: async () => (await import("./catalogs/ko.json")).default,
};

const localeTags: Record<Locale, string> = {
  en: "en-US",
  tr: "tr-TR",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  ru: "ru-RU",
  ar: "ar",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
};

type I18nContextValue = {
  locale: Locale;
  direction: "ltr" | "rtl";
  isLoading: boolean;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: string, params?: Params) => string;
  translateQuizQuestion: (questionId: string, text: string) => string;
  translateQuizAnswer: (questionId: string, text: string) => string;
  formatNumber: (value: number) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function matchLocale(value: string | null | undefined): Locale {
  const normalized = value?.toLowerCase().replace("_", "-") || "";
  if (normalized.startsWith("zh")) return "zh";
  const language = normalized.split("-")[0];
  return SUPPORTED_LANGUAGES.some((item) => item.code === language)
    ? language as Locale
    : "en";
}

function replaceParams(value: string, params?: Params) {
  if (!params) return value;
  return Object.entries(params).reduce(
    (result, [key, replacement]) =>
      result.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setCurrentLocale] = useState<Locale>("en");
  const [catalog, setCatalog] = useState<Catalog>(englishCatalog);
  const [isLoading, setIsLoading] = useState(false);

  const setLocale = useCallback(async (nextLocale: Locale) => {
    setIsLoading(true);
    try {
      const nextCatalog = await catalogLoaders[nextLocale]();
      setCatalog(nextCatalog);
      setCurrentLocale(nextLocale);
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      document.documentElement.lang = localeTags[nextLocale];
      document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    const initialLocale = saved ? matchLocale(saved) : "en";
    void setLocale(initialLocale);
  }, [setLocale]);

  const t = useCallback((key: string, params?: Params) => {
    const value = catalog.messages[key] || englishCatalog.messages[key as keyof typeof englishCatalog.messages] || key;
    return replaceParams(value, params);
  }, [catalog]);

  const translateQuizQuestion = useCallback((questionId: string, text: string) => (
    catalog.quiz[questionId]?.question || catalog.questions?.[text] || text
  ), [catalog]);

  const translateQuizAnswer = useCallback((questionId: string, text: string) => (
    catalog.quiz[questionId]?.answers[text] || catalog.questions?.[text] || text
  ), [catalog]);

  const formatNumber = useCallback((value: number) => (
    new Intl.NumberFormat(localeTags[locale]).format(value)
  ), [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    direction: locale === "ar" ? "rtl" : "ltr",
    isLoading,
    setLocale,
    t,
    translateQuizAnswer,
    translateQuizQuestion,
    formatNumber,
  }), [
    formatNumber,
    isLoading,
    locale,
    setLocale,
    t,
    translateQuizAnswer,
    translateQuizQuestion,
  ]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
