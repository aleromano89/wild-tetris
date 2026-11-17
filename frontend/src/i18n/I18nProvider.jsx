import { createContext, useContext, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { LOCALE, MESSAGES } from './index';

/** Chiave localStorage della lingua scelta (condivisa da gioco e classifica). */
export const LOCALE_STORAGE_KEY = 'blocchi.locale';

const LOCALES = Object.keys(MESSAGES);
const isLocale = (value) => LOCALES.includes(value);

// localStorage può non essere disponibile (navigazione privata, cookie bloccati)
function loadLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(saved) ? saved : LOCALE;
  } catch {
    return LOCALE;
  }
}
function saveLocale(locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignorato */
  }
}

const LocaleContext = createContext({ locale: LOCALE, locales: LOCALES, setLocale: () => {} });

/** Lingua attiva, lingue disponibili e cambio lingua (salvato nel browser). */
export const useLocale = () => useContext(LocaleContext);

/**
 * Provider delle traduzioni, usato da main.jsx, score.jsx e dai test (src/test/intl.jsx).
 * Lingua iniziale: prop `locale` (test), altrimenti quella salvata, altrimenti LOCALE.
 */
export default function I18nProvider({ locale: initialLocale, onError, children }) {
  const [locale, setLocaleState] = useState(() => (isLocale(initialLocale) ? initialLocale : loadLocale()));

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (next) => {
    if (!isLocale(next)) return;
    saveLocale(next);
    setLocaleState(next);
  };

  return (
    <LocaleContext.Provider value={{ locale, locales: LOCALES, setLocale }}>
      <IntlProvider locale={locale} defaultLocale={LOCALE} messages={MESSAGES[locale]} onError={onError}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}
