import { useIntl } from 'react-intl';
import { MESSAGES } from '../i18n';
import { useLocale } from '../i18n/I18nProvider';

/**
 * Pulsante della barra in alto che passa alla lingua successiva (it → es → it …).
 * Mostra il codice della lingua di destinazione; nome e codice sono presi dai testi di quella lingua.
 */
export default function LocaleSwitch() {
  const intl = useIntl();
  const { locale, locales, setLocale } = useLocale();
  const next = locales[(locales.indexOf(locale) + 1) % locales.length];
  const target = MESSAGES[next];

  return (
    <button
      type="button"
      className="topbar__locale"
      lang={next}
      aria-label={intl.formatMessage({ id: 'locale.switch' }, { language: target['locale.name'] })}
      onClick={() => setLocale(next)}
    >
      {target['locale.code']}
    </button>
  );
}
