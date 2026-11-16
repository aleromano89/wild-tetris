import { IntlProvider } from 'react-intl';
import { LOCALE, MESSAGES } from './index';

/** Provider delle traduzioni, usato da main.jsx, score.jsx e dai test (src/test/intl.jsx). */
export default function I18nProvider({ locale = LOCALE, onError, children }) {
  return (
    <IntlProvider locale={locale} defaultLocale={LOCALE} messages={MESSAGES[locale]} onError={onError}>
      {children}
    </IntlProvider>
  );
}
