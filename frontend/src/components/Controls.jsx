import { FormattedMessage } from 'react-intl';

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
        <FormattedMessage id="controls.start" />
      </button>
      <button type="button" className="btn" onClick={onTogglePause} disabled={canStart}>
        <FormattedMessage id={isPaused ? 'controls.resume' : 'controls.pause'} />
      </button>
    </div>
  );
}
