# Risultati test

Registro delle esecuzioni dei test. Direttive principali: [CLAUDE.md](CLAUDE.md).

## 2026-11-14 — Fase 1.3 salvataggio punteggio e classifica

### Unit / componenti (Vitest) — `docker compose exec node npm test`

| File | Test | Esito |
|------|------|-------|
| `src/game/*.test.js` (9 file) | 74 | ✅ |
| `src/components/App.test.jsx` | 6 | ✅ |
| `src/components/App.fall.test.jsx` | 6 | ✅ |
| `src/components/App.keys.test.jsx` | 9 | ✅ |
| `src/components/App.score.test.jsx` | 7 | ✅ |
| `src/api/scores.test.js` | 5 | ✅ (nuovo) |
| `src/score/format.test.js` | 3 | ✅ (nuovo) |
| `src/components/SaveScoreForm.test.jsx` | 6 | ✅ (nuovo) |
| `src/components/ScorePage.test.jsx` | 6 | ✅ (nuovo) |
| `src/components/App.save.test.jsx` | 2 | ✅ (nuovo) |
| **Totale** | **124** | **124 passati** |

Ciclo TDD: nuovi test in rosso (4 file senza moduli + modulo assente a fine partita), poi verdi.

Nota: al primo run completo Vitest restava bloccato in `ScorePage.test.jsx`. Ogni test passava da solo; il blocco compariva dopo il test «caricamento», che lasciava pendente per sempre la promise di `fetchTopScores`. Ora il test risolve la promise e verifica anche la fine del caricamento.

### Browser (Playwright) — `make e2e`

| File | Desktop | Mobile |
|------|---------|--------|
| `e2e/layout.spec.js` (3 test) | ✅ | ✅ |
| `e2e/falling.spec.js` (2 test) | ✅ | ✅ |
| `e2e/keys.spec.js` (3 test) | ✅ | ✅ |
| `e2e/gameover.spec.js` (1 test) | ✅ | ✅ |
| `e2e/score.spec.js` (4 test, nuovo) | ✅ | ✅ |
| `e2e/api.spec.js` (21 test) | ✅ | — (saltato) |
| **Totale** | | **47 passati** (2 esecuzioni consecutive) |

`score.spec.js`: partita fino al game over, salvataggio reale (verifica payload e 201), link alla classifica; classifica con dati simulati (`page.route`): 10 righe, non coperte, senza scroll orizzontale, colonne ridotte su mobile; errore 500 con «Riprova»; collegamenti tra le pagine. Grafica controllata anche con screenshot desktop e mobile.

## 2026-11-14 — Fase 2 API punteggi

### Browser / API (Playwright) — `make e2e`

| File | Desktop | Mobile |
|------|---------|--------|
| `e2e/layout.spec.js` (3 test) | ✅ | ✅ |
| `e2e/falling.spec.js` (2 test) | ✅ | ✅ |
| `e2e/keys.spec.js` (3 test) | ✅ | ✅ |
| `e2e/gameover.spec.js` (1 test) | ✅ | ✅ |
| `e2e/api.spec.js` (21 test, nuovo) | ✅ | — (saltato) |
| **Totale** | | **39 passati** (2 esecuzioni consecutive) |

Ciclo TDD: `api.spec.js` scritto prima dell'endpoint ed eseguito in rosso (20 falliti, endpoint assente), poi verde. Aggiunto poi il caso `{}` → 422 insieme alla correzione (il body veniva decodificato come array e `{}` dava 400); questo test non è stato eseguito in rosso prima della correzione.

Note:
- primo run fallito per errore del test: `test.skip` con funzione non riceve `testInfo`; ora usa la fixture `isMobile`;
- un run di `make e2e` fallito su «punteggio altissimo in cima»: record `e2e-top` con punteggio maggiore rimasti da esecuzioni dirette senza pulizia. Test reso robusto (nome univoco, verifica presenza in top 10) e pulizia anche prima dei test.

### Test manuale (curl)

| Richiesta | Esito |
|-----------|-------|
| `POST` valido (nome con spazi) | ✅ 201, nome trimmato, `created_at` valorizzato |
| `POST` con tutti i campi non validi | ✅ 422, un errore per ciascun campo |
| `GET` | ✅ 200, ordinato per punteggio desc |
| `PUT` | ✅ 405, `Allow: GET, POST` |

Vitest non rieseguito: nessuna modifica al codice frontend.

## 2026-11-14 — Fase 1.2.4 livelli e game over

### Unit / componenti (Vitest) — `docker compose exec node npm test`

| File | Test | Esito |
|------|------|-------|
| `src/game/board.test.js` | 4 | ✅ |
| `src/game/pieces.test.js` | 5 | ✅ |
| `src/game/engine.test.js` | 18 | ✅ |
| `src/game/controls.test.js` | 15 | ✅ |
| `src/game/lines.test.js` | 5 | ✅ |
| `src/game/scoring.test.js` | 3 | ✅ |
| `src/game/score.test.js` | 12 | ✅ |
| `src/game/levels.test.js` | 5 | ✅ (nuovo) |
| `src/game/levelup.test.js` | 7 | ✅ (nuovo) |
| `src/components/App.test.jsx` | 6 | ✅ |
| `src/components/App.fall.test.jsx` | 6 | ✅ |
| `src/components/App.keys.test.jsx` | 9 | ✅ |
| `src/components/App.score.test.jsx` | 7 | ✅ (+3) |
| **Totale** | **102** | **102 passati** |

Ciclo TDD: nuovi test in rosso (2 file senza moduli + 2 test sulla salita di livello), poi verdi dopo l'implementazione.

### Browser (Playwright) — `make e2e`

| File | Desktop | Mobile |
|------|---------|--------|
| `e2e/layout.spec.js` (3 test) | ✅ | ✅ |
| `e2e/falling.spec.js` (2 test) | ✅ | ✅ |
| `e2e/keys.spec.js` (3 test) | ✅ | ✅ |
| `e2e/gameover.spec.js` (1 test) | ✅ | ✅ |
| **Totale** | | **18 passati** (3 esecuzioni consecutive) |

Nota: primo run di `gameover.spec.js` fallito per un errore del test: l'overlay ha `pointer-events: none` e `document.elementFromPoint` lo ignora sempre; nel test i pointer-events vengono riattivati solo durante la verifica.

## 2026-11-14 — Fase 1.2.3 righe e punteggio

### Unit / componenti (Vitest) — `docker compose exec node npm test`

| File | Test | Esito |
|------|------|-------|
| `src/game/board.test.js` | 4 | ✅ |
| `src/game/pieces.test.js` | 5 | ✅ |
| `src/game/engine.test.js` | 18 | ✅ |
| `src/game/controls.test.js` | 15 | ✅ |
| `src/game/lines.test.js` | 5 | ✅ (nuovo) |
| `src/game/scoring.test.js` | 3 | ✅ (nuovo) |
| `src/game/score.test.js` | 12 | ✅ (nuovo) |
| `src/components/App.test.jsx` | 6 | ✅ |
| `src/components/App.fall.test.jsx` | 6 | ✅ |
| `src/components/App.keys.test.jsx` | 9 | ✅ |
| `src/components/App.score.test.jsx` | 4 | ✅ (nuovo) |
| **Totale** | **87** | **87 passati** |

Ciclo TDD: nuovi test logica in rosso (8 falliti, moduli mancanti), poi verdi; `App.score.test.jsx` in rosso (2 falliti, pannello con valori fissi), poi verde.

### Browser (Playwright) — `make e2e`

| File | Desktop | Mobile |
|------|---------|--------|
| `e2e/layout.spec.js` (3 test) | ✅ | ✅ |
| `e2e/falling.spec.js` (2 test) | ✅ | ✅ |
| `e2e/keys.spec.js` (3 test) | ✅ | ✅ |
| **Totale** | | **16 passati** (4 esecuzioni consecutive) |

Nota: con la verifica del punteggio `keys.spec.js` è fallito 1 volta su 6 (mobile) per una corsa con il tick di gravità; riscritto con `page.clock` (orologio simulato), poi 4 esecuzioni su 4 verdi.

## 2026-11-14 — Fase 1.2.2 spostamento e rotazione

### Unit / componenti (Vitest) — `docker compose exec node npm test`

| File | Test | Esito |
|------|------|-------|
| `src/game/board.test.js` | 4 | ✅ |
| `src/game/pieces.test.js` | 5 | ✅ |
| `src/game/engine.test.js` | 18 | ✅ |
| `src/game/controls.test.js` | 15 | ✅ (nuovo) |
| `src/components/App.test.jsx` | 6 | ✅ |
| `src/components/App.fall.test.jsx` | 6 | ✅ (rimosso test tasti senza effetto) |
| `src/components/App.keys.test.jsx` | 9 | ✅ (nuovo) |
| **Totale** | **63** | **63 passati** |

Ciclo TDD: `controls.test.js` (15 rossi) e `App.keys.test.jsx` (8 rossi) prima dell'implementazione. Corretta un'aspettativa errata nel test (posizione della I dopo due rotazioni orarie).

### Browser (Playwright) — `make e2e`

| File | Desktop | Mobile |
|------|---------|--------|
| `e2e/layout.spec.js` (3 test) | ✅ | ✅ |
| `e2e/falling.spec.js` (2 test) | ✅ | ✅ |
| `e2e/keys.spec.js` (3 test) | ✅ | ✅ |
| **Totale** | | **16 passati** (2 esecuzioni consecutive) |

Nota: primo run di `keys.spec.js` fallito per un errore del test (verifica della rotazione con la I ancora alla riga visibile 0, quindi in parte nella zona nascosta dopo la rotazione); corretto aspettando la riga ≥ 1.

## 2026-11-14 — Fase 1.2.1 discesa dei pezzi

### Unit / componenti (Vitest) — `docker compose exec node npm test`

| File | Test | Esito |
|------|------|-------|
| `src/game/board.test.js` | 4 | ✅ |
| `src/game/pieces.test.js` | 5 | ✅ |
| `src/game/engine.test.js` | 18 | ✅ |
| `src/components/App.test.jsx` | 6 | ✅ |
| `src/components/App.fall.test.jsx` | 7 | ✅ |
| **Totale** | **40** | **40 passati** |

Ciclo TDD: test scritti prima del codice ed eseguiti in rosso (moduli mancanti), poi verdi dopo l'implementazione. Corretti durante lo sviluppo: `-0` nella riga di comparsa, helper di test che confrontava il pezzo per riferimento.

### Browser (Playwright) — `make e2e`

| File | Desktop | Mobile |
|------|---------|--------|
| `e2e/layout.spec.js` (3 test) | ✅ | ✅ |
| `e2e/falling.spec.js` (2 test) | ✅ | ✅ |
| **Totale** | | **10 passati** |

Nota: primo run fallito su mobile — il click su «Avvia» fa scorrere la pagina e la cella controllata con `elementFromPoint` era fuori viewport; corretto il test con `scrollIntoViewIfNeeded`.
