/**
 * Pulsanti di avvio e pausa.
 * "Avvia" è attivo a inizio e a fine partita; "Pausa"/"Riprendi" solo durante la partita.
 */
export default function Controls({ status, onStart, onTogglePause }) {
  const canStart = status === 'idle' || status === 'over';
  const isPaused = status === 'paused';

  return (
    <div className="controls">
      <button type="button" className="btn btn--primary" onClick={onStart} disabled={!canStart}>
        Avvia
      </button>
      <button type="button" className="btn" onClick={onTogglePause} disabled={canStart}>
        {isPaused ? 'Riprendi' : 'Pausa'}
      </button>
    </div>
  );
}
