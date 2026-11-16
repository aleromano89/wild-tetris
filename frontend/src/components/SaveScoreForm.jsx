import { useState } from 'react';
import { submitScore } from '../api/scores';

export const NAME_MAX = 20;
export const NAME_STORAGE_KEY = 'blocchi.playerName';

// localStorage può non essere disponibile (navigazione privata, cookie bloccati)
const loadName = () => {
  try {
    return localStorage.getItem(NAME_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};
const saveName = (name) => {
  try {
    localStorage.setItem(NAME_STORAGE_KEY, name);
  } catch {
    /* ignorato */
  }
};

/**
 * Modulo di fine partita: nome del giocatore e invio del punteggio (POST /api/scores.php).
 * status: 'idle' | 'sending' | 'saved'
 */
export default function SaveScoreForm({ score, lines, level }) {
  const [name, setName] = useState(loadName);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const trimmed = name.trim();
  const sending = status === 'sending';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!trimmed || sending) return;
    setStatus('sending');
    setError('');
    try {
      await submitScore({ player_name: trimmed, score, lines_cleared: lines, level });
      saveName(trimmed);
      setStatus('saved');
    } catch (err) {
      setError(err.errors?.player_name ?? err.message ?? 'Salvataggio non riuscito');
      setStatus('idle');
    }
  };

  if (status === 'saved') {
    return (
      <div className="save-score save-score--saved">
        <p className="save-score__ok">Punteggio salvato!</p>
        <a className="btn btn--primary save-score__link" href="/score.html">
          Vedi classifica
        </a>
      </div>
    );
  }

  return (
    <form className="save-score" onSubmit={onSubmit}>
      <label className="save-score__label" htmlFor="player-name">
        Il tuo nome
      </label>
      <div className="save-score__row">
        <input
          id="player-name"
          className="save-score__input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={NAME_MAX}
          autoComplete="nickname"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          disabled={sending}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'player-name-error' : undefined}
        />
        <button type="submit" className="btn btn--primary" disabled={!trimmed || sending}>
          {sending ? 'Salvo…' : 'Salva'}
        </button>
      </div>
      {error && (
        <p id="player-name-error" className="save-score__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
