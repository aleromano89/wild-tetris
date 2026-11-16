// Parametri di gioco: vedi regole-gioco.md
export const BOARD_COLS = 10;
export const BOARD_ROWS = 20; // righe visibili
export const HIDDEN_ROWS = 2; // zona di comparsa sopra la griglia visibile
export const PREVIEW_SIZE = 4;
export const DROP_INTERVAL_MS = 800; // velocità di caduta (livello 1)
export const LINES_PER_LEVEL = 10; // si sale di livello ogni 10 righe
export const SPEED_FACTOR = 0.85; // a ogni livello l'intervallo di caduta si riduce del 15%
export const MIN_DROP_INTERVAL_MS = 100; // velocità massima
