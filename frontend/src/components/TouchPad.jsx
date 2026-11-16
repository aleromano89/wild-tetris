/**
 * Pulsantiera di gioco per schermi touch (visibile solo su mobile, vedi game.css).
 * Spostamenti a sinistra (pollice sinistro), rotazione e caduta istantanea a destra.
 *
 * L'azione parte al pointerdown (risposta immediata al tocco); il click che segue
 * lo stesso pointerdown viene ignorato. Un click senza pointerdown arriva dalla
 * tastiera (Invio/Spazio sul pulsante) ed esegue l'azione.
 * Non si usa event.detail: dopo un tocco alcuni browser generano il click con detail 0.
 */
import { useRef } from 'react';

const MOVE = [
  { action: 'left', label: 'Sposta a sinistra', icon: '←' },
  { action: 'softDrop', label: 'Scendi', icon: '↓' },
  { action: 'right', label: 'Sposta a destra', icon: '→' },
];
const ACT = [
  { action: 'rotateCw', label: 'Ruota', icon: '↻' },
  { action: 'hardDrop', label: 'Caduta istantanea', icon: '⤓' },
];

export default function TouchPad({ disabled, onAction }) {
  // pulsante su cui è appena avvenuto un pointerdown: il suo prossimo click va ignorato
  const pressed = useRef(null);

  const button = ({ action, label, icon }) => (
    <button
      key={action}
      type="button"
      className={`pad__btn pad__btn--${action}`}
      aria-label={label}
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault(); // niente focus/selezione al tocco
        pressed.current = action;
        onAction(action);
      }}
      onClick={() => {
        if (pressed.current === action) {
          pressed.current = null;
          return;
        }
        pressed.current = null;
        onAction(action);
      }}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );

  return (
    <div className="pad" role="group" aria-label="Comandi di gioco">
      <div className="pad__cluster">{MOVE.map(button)}</div>
      <div className="pad__cluster">{ACT.map(button)}</div>
    </div>
  );
}
