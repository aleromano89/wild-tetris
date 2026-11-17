import { useEffect, useReducer, useState } from 'react';
import { createGame, hardDrop, move, rotate, softDrop, tick } from '../game/engine';
import { dropInterval } from '../game/levels';
import { createTimer, elapsedMs, startTimer, stopTimer } from '../game/timer';

/** Ogni quanto si aggiorna il tempo mostrato (ms). */
const CLOCK_REFRESH_MS = 250;

/**
 * Stato della partita lato React.
 * status: 'idle' | 'running' | 'paused' | 'over'
 * I comandi da tastiera seguono la tabella di regole-gioco.md.
 */
const initial = { status: 'idle', game: null, timer: createTimer() };

/** Azioni che modificano il pezzo: attive solo a partita in corso. */
const GAME_ACTIONS = {
  tick,
  left: (g) => move(g, -1),
  right: (g) => move(g, 1),
  softDrop,
  hardDrop,
  rotateCw: (g) => rotate(g, 1),
  rotateCcw: (g) => rotate(g, -1),
};

/** Tasto (event.key in minuscolo) → azione. */
const KEY_ACTIONS = {
  arrowleft: 'left',
  arrowright: 'right',
  arrowdown: 'softDrop',
  ' ': 'hardDrop',
  arrowup: 'rotateCw',
  x: 'rotateCw',
  z: 'rotateCcw',
  p: 'togglePause',
  escape: 'togglePause',
};

function reducer(state, action) {
  switch (action.type) {
    case 'start':
      return { status: 'running', game: createGame(), timer: startTimer(createTimer(), action.now) };
    case 'togglePause':
      if (state.status === 'running') return { ...state, status: 'paused', timer: stopTimer(state.timer, action.now) };
      if (state.status === 'paused') return { ...state, status: 'running', timer: startTimer(state.timer, action.now) };
      return state;
    default: {
      const apply = GAME_ACTIONS[action.type];
      if (!apply || state.status !== 'running') return state;
      const game = apply(state.game);
      if (game === state.game) return state;
      if (game.status === 'over') return { status: 'over', game, timer: stopTimer(state.timer, action.now) };
      return { ...state, game };
    }
  }
}

export default function useFallingGame() {
  const [state, dispatchRaw] = useReducer(reducer, initial);
  // ogni azione porta l'istante corrente, usato dal timer (il reducer resta puro)
  const dispatch = (action) => dispatchRaw({ ...action, now: Date.now() });
  const [now, setNow] = useState(() => Date.now());
  const { status } = state;
  const level = state.game?.level ?? 1;

  // gravità: più veloce a ogni livello
  useEffect(() => {
    if (status !== 'running') return undefined;
    const id = setInterval(() => dispatch({ type: 'tick' }), dropInterval(level));
    return () => clearInterval(id);
  }, [status, level]);

  // tempo mostrato: aggiornato periodicamente solo a partita in corso
  useEffect(() => {
    setNow(Date.now());
    if (status !== 'running') return undefined;
    const id = setInterval(() => setNow(Date.now()), CLOCK_REFRESH_MS);
    return () => clearInterval(id);
  }, [status]);

  // tastiera: attiva solo durante la partita (anche in pausa, per riprendere)
  useEffect(() => {
    if (status !== 'running' && status !== 'paused') return undefined;
    const onKeyDown = (e) => {
      const type = KEY_ACTIONS[e.key.toLowerCase()];
      if (!type) return;
      // evita lo scroll della pagina e che Spazio "clicchi" il pulsante con il focus
      e.preventDefault();
      dispatch({ type });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [status]);

  return {
    status,
    game: state.game,
    /** Tempo di gioco in ms (fermo in pausa e a fine partita). */
    elapsed: elapsedMs(state.timer, now),
    start: () => dispatch({ type: 'start' }),
    togglePause: () => dispatch({ type: 'togglePause' }),
    /** Comando di gioco dalla pulsantiera touch: 'left' | 'right' | 'softDrop' | 'hardDrop' | 'rotateCw'. */
    control: (type) => {
      if (type !== 'tick' && GAME_ACTIONS[type]) dispatch({ type });
    },
  };
}
