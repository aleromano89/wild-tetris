// Traduzioni dell'interfaccia (react-intl). Ogni testo visibile ha un id in messages/<lingua>.json.
import itMessages from './messages/it.json';
import esMessages from './messages/es.json';

/** @type {Record<string, Record<string, string>>} */
export const MESSAGES = {
  it: itMessages,
  es: esMessages,
};

/** Lingua predefinita dell'app: italiano (direttive di progetto). Il giocatore può cambiarla con il pulsante in alto (LocaleSwitch). */
export const LOCALE = 'it';
