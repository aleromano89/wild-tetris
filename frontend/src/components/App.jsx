import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { createEmptyBoard } from '../game/board';
import { getPreview, getVisibleBoard } from '../game/engine';
import { GAME_TITLE } from '../meta';
import { brickClass, loadBrickStyle, saveBrickStyle } from '../theme/brickStyles';
import BrickStylePicker from './BrickStylePicker';
import Grid from './Grid';
import LocaleSwitch from './LocaleSwitch';
import StatsPanel from './StatsPanel';
import Controls from './Controls';
import SaveScoreForm from './SaveScoreForm';
import TouchPad from './TouchPad';
import useFallingGame from './useFallingGame';

/** Legenda comandi da tastiera: tasto (simbolo o id da tradurre) → id dell'azione. */
const KEYS = [
  { key: '← →', action: 'keys.move' },
  { key: '↓', action: 'keys.softDrop' },
  { keyId: 'keys.space', action: 'keys.hardDrop' },
  { key: '↑ / X', action: 'keys.rotateCw' },
  { key: 'Z', action: 'keys.rotateCcw' },
  { keyId: 'keys.pauseKeys', action: 'keys.pause' },
];

/** Icona pausa (due barre) o ripresa (triangolo). */
function PauseIcon({ paused }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      {paused ? (
        <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
      ) : (
        <>
          <rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
          <rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export default function App() {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { status, game, elapsed, start, togglePause, control } = useFallingGame();
  const [brickStyle, setBrickStyle] = useState(loadBrickStyle);
  const chooseBrickStyle = (style) => {
    saveBrickStyle(style);
    setBrickStyle(style);
  };
  const bricks = brickClass(brickStyle);
  const stats = { score: game?.score ?? 0, lines: game?.lines ?? 0, level: game?.level ?? 1, elapsed };

  const board = useMemo(() => (game ? getVisibleBoard(game) : createEmptyBoard()), [game]);
  const preview = useMemo(() => getPreview(game?.next ?? null), [game]);

  return (
    <div className="page">
      <header className="topbar">
        <h1 className="topbar__title">{GAME_TITLE}</h1>
        {/* solo mobile (game.css): pausa sempre raggiungibile durante la partita */}
        {(status === 'running' || status === 'paused') && (
          <button
            type="button"
            className="topbar__pause"
            aria-label={t(status === 'paused' ? 'topbar.resume' : 'topbar.pause')}
            onClick={togglePause}
          >
            <PauseIcon paused={status === 'paused'} />
          </button>
        )}
        <LocaleSwitch />
        <a className="topbar__link" href="/score.html">
          <FormattedMessage id="nav.leaderboard" />
        </a>
      </header>

      {/* solo mobile (game.css): statistiche su una riga sopra la griglia */}
      <section className="statsbar" aria-label={t('game.statsbar.label')}>
        <StatsPanel {...stats} variant="bar" />
      </section>

      <main className="game">

        <section className="game__board">
          <Grid cells={board} label={t('game.board.label')} className={`grid--board ${bricks}`} />
          {status === 'idle' && (
            <div className="overlay overlay--start">
              <button type="button" className="btn btn--primary btn--start" onClick={start}>
                <FormattedMessage id="game.start" />
              </button>
            </div>
          )}
          {status === 'paused' && (
            <div className="overlay">
              <FormattedMessage id="game.paused" />
            </div>
          )}
          {status === 'over' && (
            <div className="overlay overlay--over">
              <p className="overlay__title">
                <FormattedMessage id="game.over" values={{ score: game.score }} />
              </p>
              <SaveScoreForm score={game.score} lines={game.lines} level={game.level} />
            </div>
          )}
        </section>

        {/* solo mobile (game.css): sostituisce le frecce da tastiera */}
        <TouchPad disabled={status !== 'running'} onAction={control} />

        <aside className="game__side" aria-label={t('game.side.label')}>
          <div className="card card--preview">
            <h2 className="card__title">
              <FormattedMessage id="game.preview.title" />
            </h2>
            <Grid cells={preview} label={t('game.preview.label')} className={`grid--preview ${bricks}`} />
          </div>

          <div className="card card--stats">
            <StatsPanel {...stats} />
          </div>

          <Controls status={status} onStart={start} onTogglePause={togglePause} />

          {/* configurazione: bloccata durante la partita (le frecce muovono il pezzo), modificabile in pausa */}
          <section className="card config">
            <BrickStylePicker value={brickStyle} onChange={chooseBrickStyle} disabled={status === 'running'} />
          </section>

          <div className="card card--muted">
            <h2 className="card__title">
              <FormattedMessage id="keys.title" />
            </h2>
            <ul className="keys">
              {KEYS.map(({ key, keyId, action }) => (
                <li key={action}>
                  <kbd>{keyId ? t(keyId) : key}</kbd> <FormattedMessage id={action} />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
