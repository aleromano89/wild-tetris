// Formattazione dei valori della classifica.

/** "AAAA-MM-GG hh:mm:ss" (MariaDB) → "GG/MM/AAAA"; '' se non riconosciuta. */
export function formatDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** Numero con separatore delle migliaia italiano. */
export function formatNumber(n) {
  return n.toLocaleString('it-IT');
}
