import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { createEmptyBoard } from '../game/board';
import { getPreview, getVisibleBoard } from '../game/engine';
import { GAME_TITLE } from '../meta';
import Grid from './Grid';
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

export default function App() {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { status, game, start, togglePause, control } = useFallingGame();
  const stats = { score: game?.score ?? 0, lines: game?.lines ?? 0, level: game?.level ?? 1 };

  const board = useMemo(() => (game ? getVisibleBoard(game) : createEmptyBoard()), [game]);
  const preview = useMemo(() => getPreview(game?.next ?? null), [game]);

  return (
    <div className="page">
      <header className="topbar">
        <h1 className="topbar__title">{GAME_TITLE}</h1>
        <a className="topbar__link" href="/score.html">
          <FormattedMessage id="nav.leaderboard" />
        </a>
      </header>

      {/* solo mobile (game.css): statistiche su una riga sopra la griglia */}
      <section className="statsbar" aria-label={t('game.statsbar.label')}>
        <StatsPanel {...stats} variant="bar" />
      </section>

      <main className="game">

        <section className="config">
            <button className="color">
              <FormattedMessage id="app.config.color" />
            </button>
            <button className="special-effect">
              <FormattedMessage id="app.config.special_effect" />
            </button>
        </section>


        <section className="game__board">
          <Grid cells={board} label={t('game.board.label')} className="grid--board" />
          {status === 'idle' && (
            <div className="overlay">
              <FormattedMessage id="app.btn.start" />
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
          <div className="card">
            <h2 className="card__title">
              <FormattedMessage id="game.preview.title" />
            </h2>
            <Grid cells={preview} label={t('game.preview.label')} className="grid--preview" />
          </div>

          <div className="card card--stats">
            <StatsPanel {...stats} />
          </div>

          <Controls status={status} onStart={start} onTogglePause={togglePause} />

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
