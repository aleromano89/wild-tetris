/**
 * Stili grafici dei mattoni (solo aspetto: la logica di gioco non cambia).
 * Ogni stile corrisponde alla classe CSS `bricks--<stile>` applicata alla griglia (game.css)
 * e ha le etichette `bricks.<stile>` nei testi dell'interfaccia.
 */
export const BRICK_STYLES = ['classic', 'ice', 'wood', 'lava'];

export const DEFAULT_BRICK_STYLE = 'classic';

/** Chiave localStorage dello stile scelto. */
export const BRICK_STYLE_STORAGE_KEY = 'blocchi.brickStyle';

export const isBrickStyle = (value) => BRICK_STYLES.includes(value);

export const brickClass = (style) => `bricks--${style}`;

// localStorage può non essere disponibile (navigazione privata, cookie bloccati)
export function loadBrickStyle() {
  try {
    const saved = localStorage.getItem(BRICK_STYLE_STORAGE_KEY);
    return isBrickStyle(saved) ? saved : DEFAULT_BRICK_STYLE;
  } catch {
    return DEFAULT_BRICK_STYLE;
  }
}

export function saveBrickStyle(style) {
  if (!isBrickStyle(style)) return;
  try {
    localStorage.setItem(BRICK_STYLE_STORAGE_KEY, style);
  } catch {
    /* ignorato */
  }
}
