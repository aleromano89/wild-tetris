import { useMemo } from 'react';
import { createEmptyBoard } from '../game/board';
import { getPreview, getVisibleBoard } from '../game/engine';
import { GAME_TITLE } from '../meta';
import Grid from './Grid';
import StatsPanel from './StatsPanel';
import Controls from './Controls';
import SaveScoreForm from './SaveScoreForm';
import TouchPad from './TouchPad';
import useFallingGame from './useFallingGame';

const KEYS = [
  ['← →', 'sposta'],
  ['↓', 'caduta veloce'],
  ['Spazio', 'caduta istantanea'],
  ['↑ / X', 'ruota orario'],
  ['Z', 'ruota antiorario'],
  ['P / Esc', 'pausa'],
];

export default function App() {
  const { status, game, start, togglePause, control } = useFallingGame();
  const stats = { score: game?.score ?? 0, lines: game?.lines ?? 0, level: game?.level ?? 1 };

  const board = useMemo(() => (game ? getVisibleBoard(game) : createEmptyBoard()), [game]);
  const preview = useMemo(() => getPreview(game?.next ?? null), [game]);

  return (
    <div className="page">
      <header className="topbar">
        <h1 className="topbar__title">{GAME_TITLE}</h1>
        <a className="topbar__link" href="/score.html">Classifica</a>
      </header>

      {/* solo mobile (game.css): statistiche su una riga sopra la griglia */}
      <section className="statsbar" aria-label="Statistiche partita">
        <StatsPanel {...stats} variant="bar" />
      </section>

      <main className="game">
        <section className="game__board">
          <Grid cells={board} label="Campo di gioco" className="grid--board" />
          {status === 'idle' && <div className="overlay">Premi «Avvia» per iniziare</div>}
          {status === 'paused' && <div className="overlay">In pausa</div>}
          {status === 'over' && (
            <div className="overlay overlay--over">
              <p className="overlay__title">Partita terminata · {game.score.toLocaleString('it-IT')} punti</p>
              <SaveScoreForm score={game.score} lines={game.lines} level={game.level} />
            </div>
          )}
        </section>

        {/* solo mobile (game.css): sostituisce le frecce da tastiera */}
        <TouchPad disabled={status !== 'running'} onAction={control} />

        <aside className="game__side" aria-label="Pannello di gioco">
          <div className="card">
            <h2 className="card__title">Prossimo</h2>
            <Grid cells={preview} label="Prossimo pezzo" className="grid--preview" />
          </div>

          <div className="card card--stats">
            <StatsPanel {...stats} />
          </div>

          <Controls status={status} onStart={start} onTogglePause={togglePause} />

          <div className="card card--muted">
            <h2 className="card__title">Comandi</h2>
            <ul className="keys">
              {KEYS.map(([key, action]) => (
                <li key={key}>
                  <kbd>{key}</kbd> {action}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
