// Messaggio da mostrare per un errore delle API, nella lingua dell'interfaccia.
// I messaggi del server (es. errori di validazione) sono mostrati così come arrivano.

/**
 * @param {import('react-intl').IntlShape} intl
 * @param {any} err errore (di solito ApiError)
 * @param {string} [fallbackId] id del messaggio se l'errore non ha testo
 */
export function apiErrorMessage(intl, err, fallbackId) {
  if (err?.code === 'network' || err?.status === 0) return intl.formatMessage({ id: 'error.network' });
  if (err?.code === 'http') return intl.formatMessage({ id: 'error.server' }, { status: err.status });
  return err?.message || (fallbackId ? intl.formatMessage({ id: fallbackId }) : '');
}
