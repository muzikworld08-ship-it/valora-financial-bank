import React, { useState, useEffect, useRef } from "react";
import { Globe, Languages, Check, ChevronDown } from "lucide-react";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" }
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: any;
  }
}

export function LanguageSelector({ dark }: { dark?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLangCode, setCurrentLangCode] = useState("en");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize and load Google Translate Element
  useEffect(() => {
    // Read lang cookie to set visual active indicator
    const getLangFromCookie = (): string => {
      const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
      if (match) {
        return match[1];
      }
      return "en";
    };

    const activeCookieLang = getLangFromCookie();
    setCurrentLangCode(activeCookieLang);

    // Window global callback for translation engine initialization
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.map((l) => l.code).join(","),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Inject Google Translate script if not existing
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // Polling lookup to programmatically click and fire change events if elements are loaded
    let pollAttempts = 0;
    const translationPoll = setInterval(() => {
      pollAttempts++;
      const selectEl = document.querySelector("select.goog-te-combo") as HTMLSelectElement;
      if (selectEl) {
        if (activeCookieLang !== "en" && selectEl.value !== activeCookieLang) {
          selectEl.value = activeCookieLang;
          selectEl.dispatchEvent(new Event("change"));
        }
        clearInterval(translationPoll);
      }
      if (pollAttempts > 80) {
        clearInterval(translationPoll);
      }
    }, 150);

    // Close dropdown on outside click
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      clearInterval(translationPoll);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSelectLanguage = (langCode: string) => {
    // Clear preexisting cookies to avoid secure mismatches
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname;

    if (langCode !== "en") {
      // Set the path-wide cookie translations
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname};`;
    }

    setCurrentLangCode(langCode);
    setIsOpen(false);

    // Attempt instant programmatic translation if element is loaded, else reload
    const selectEl = document.querySelector("select.goog-te-combo") as HTMLSelectElement;
    if (selectEl) {
      try {
        selectEl.value = langCode;
        selectEl.dispatchEvent(new Event("change"));
        return; // Dynamic change succeeded, avoid slow flash/reload
      } catch (err) {
        console.error("Valora: Programmatic translation fail, falling back to full reload", err);
      }
    }

    // Refresh layout to trigger complete element retranscription
    window.location.reload();
  };

  const activeLang = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Invisible element container required by Google Translate */}
      <div id="google_translate_element" className="hidden" />

      {/* CSS Injected Dynamically to hide Google Translate Bar and maintain premium feeling */}
      <style>{`
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        iframe.goog-te-banner-frame,
        #goog-gt-tt,
        .goog-te-balloon-frame {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        .goog-te-gadget {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        /* Custom styled Translate indicator to support premium UI */
        #google_translate_element {
          display: none !important;
        }
      `}</style>

      {/* Floating Header Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all hover:bg-white/10 cursor-pointer ${
          dark 
            ? "bg-brand-red/10 border-brand-red/30 text-white hover:border-brand-red/50" 
            : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
        }`}
        title="Select Language"
      >
        <span className="text-sm">{activeLang.flag}</span>
        <span className="hidden sm:inline font-mono tracking-wide">{activeLang.nativeName}</span>
        <span className="sm:hidden font-mono text-[10px]">{activeLang.code.toUpperCase()}</span>
        <ChevronDown size={12} className={`opacity-65 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Languages Panel Dropdown Grid */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 md:w-80 max-h-96 overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 animate-[fadeIn_0.15s_ease-out]">
          <div className="px-3.5 py-2.5 border-b border-slate-800 text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-red block mb-0.5">Sovereign Translation</span>
            <span className="text-[11px] font-semibold text-slate-400">Select interface language (20 options)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 p-1.5">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLangCode;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  type="button"
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-brand-red/10 border border-brand-red/40 text-brand-red"
                      : "text-slate-300 hover:bg-slate-800/80 border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span className="truncate">
                      {lang.name} <span className="opacity-50 text-[10px] font-mono block sm:inline">({lang.nativeName})</span>
                    </span>
                  </span>
                  {isSelected && <Check size={12} className="text-brand-red shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
