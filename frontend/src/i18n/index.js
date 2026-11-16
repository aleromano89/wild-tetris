// Traduzioni dell'interfaccia (react-intl). Ogni testo visibile ha un id in messages/<lingua>.json.
import itMessages from './messages/it.json';
import esMessages from './messages/es.json';

/** @type {Record<string, Record<string, string>>} */
export const MESSAGES = {
  it: itMessages,
  es: esMessages,
};

/** Lingua dell'app: italiano (CLAUDE.md). Per provare un'altra lingua cambiare qui, es. 'es'. */
export const LOCALE = 'it';
