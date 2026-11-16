// Testing Library con il provider delle traduzioni (react-intl).
// Uso nei test: import { render, screen, ... } from '../test/intl';
// render(ui, { locale: 'es' }) per renderizzare in un'altra lingua (default: lingua dell'app).
// Una traduzione mancante fa fallire il test (onError rilancia l'errore).
import { render as rtlRender } from '@testing-library/react';
import I18nProvider from '../i18n/I18nProvider';

export * from '@testing-library/react';

const throwOnError = (err) => {
  throw err;
};

export function render(ui, { locale, ...options } = {}) {
  const Wrapper = ({ children }) => (
    <I18nProvider locale={locale} onError={throwOnError}>
      {children}
    </I18nProvider>
  );
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}
