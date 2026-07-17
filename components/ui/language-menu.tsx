"use client";

import { useEffect, useRef, useState } from "react";
import { SUPPORTED_LANGUAGES, type Locale, useI18n } from "@/app/i18n/context";

export function LanguageMenu() {
  const { locale, isLoading, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = SUPPORTED_LANGUAGES.find((language) => language.code === locale)
    || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function selectLanguage(nextLocale: Locale) {
    await setLocale(nextLocale);
    setOpen(false);
  }

  return (
    <div className="language-menu" ref={containerRef}>
      <button
        type="button"
        className="language-menu-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("common.selectLanguage")}
        title={t("common.selectLanguage")}
        disabled={isLoading}
      >
        <span className="language-menu-globe" aria-hidden="true">◎</span>
        <span>{current.short}</span>
        <span className="language-menu-chevron" aria-hidden="true">⌄</span>
      </button>

      {open && (
        <div className="language-menu-popover" role="menu" aria-label={t("common.language")}>
          <div className="language-menu-title">
            <span aria-hidden="true">◎</span>
            {t("common.language")}
          </div>
          <div className="language-menu-list">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                type="button"
                key={language.code}
                role="menuitemradio"
                aria-checked={locale === language.code}
                className={locale === language.code ? "is-active" : undefined}
                onClick={() => void selectLanguage(language.code)}
              >
                <span>{language.name}</span>
                <small>{language.short}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
