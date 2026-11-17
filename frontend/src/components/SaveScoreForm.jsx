import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { submitScore } from '../api/scores';
import { apiErrorMessage } from '../i18n/apiError';

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
/** Spazio lasciato tra il modulo e il bordo superiore della tastiera virtuale. */
const KEYBOARD_MARGIN = 12;

/**
 * Se la tastiera virtuale (visual viewport ridotto) copre il modulo, scorre la pagina
 * quanto basta a riportarlo in vista. Su desktop visualViewport non cambia: nessun effetto.
 */
function revealAboveKeyboard(el, vv) {
  const r = el.getBoundingClientRect();
  const visibleBottom = vv.offsetTop + vv.height;
  const overflow = r.bottom + KEYBOARD_MARGIN - visibleBottom;
  if (overflow > 0) window.scrollBy(0, Math.min(overflow, r.top - vv.offsetTop - KEYBOARD_MARGIN));
}

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
  const intl = useIntl();
  const [name, setName] = useState(loadName);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const formRef = useRef(null);

  // tastiera virtuale: quando si apre (resize del visual viewport) il modulo resta visibile
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const onResize = () => {
      const form = formRef.current;
      if (form && form.contains(document.activeElement)) revealAboveKeyboard(form, vv);
    };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

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
      setError(err.errors?.player_name ?? apiErrorMessage(intl, err, 'save.failed'));
      setStatus('idle');
    }
  };

  if (status === 'saved') {
    return (
      <div className="save-score save-score--saved">
        <p className="save-score__ok">
          <FormattedMessage id="save.saved" />
        </p>
        <a className="btn btn--primary save-score__link" href="/score.html">
          <FormattedMessage id="save.viewLeaderboard" />
        </a>
      </div>
    );
  }

  return (
    <form className="save-score" onSubmit={onSubmit} ref={formRef}>
      <label className="save-score__label" htmlFor="player-name">
        <FormattedMessage id="save.name" />
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
          <FormattedMessage id={sending ? 'save.sending' : 'save.submit'} />
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
