import { createI18n } from "vue-i18n";

import tr from "./locales/tr.json";
import en from "./locales/en.json";

type Locale = "tr" | "en";

// Get saved language from localStorage or use default (tr)
const savedLanguage = (localStorage.getItem("language") || "tr") as Locale;

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: "tr",
  messages: {
    tr,
    en,
  },
});

// Watch for language changes and save to localStorage
i18n.global.locale.value = savedLanguage;

export default i18n;
