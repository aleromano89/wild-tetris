# Changelog

Registro delle feature e modifiche del progetto. Direttive principali: [CLAUDE.md](CLAUDE.md).

## 2026-11-14 — Fase 1.3 salvataggio punteggio e classifica

- **Aggiunto** client API `src/api/scores.js` (`fetchTopScores`, `submitScore`, `ApiError` con status ed errori per campo; status 0 = server non raggiungibile).
- **Aggiunto** `SaveScoreForm`: a fine partita, nel riquadro sopra la griglia, campo nome (max 20, focus automatico, ricordato in `localStorage`) e pulsante «Salva»; durante l'invio è bloccato, in caso di errore mostra il messaggio del server e si può riprovare; dopo il salvataggio «Punteggio salvato!» e link «Vedi classifica».
- **Aggiunto** pagina `score.html` (`ScorePage`): top 10 con posizione, nome, data, punti, righe e livello; podio colorato per i primi tre; stati di caricamento, classifica vuota (invito a giocare) ed errore con «Riprova»; su schermi stretti nasconde righe e livello.
- **Aggiunto** `src/score/format.js` (`formatDate`, `formatNumber`) e stili `src/styles/score.css`.
- **Modificato** riquadro di fine partita: ora è interattivo e opaco; topbar su mobile senza a capo nel link.
- **Aggiunto** test Vitest `api/scores.test.js`, `score/format.test.js`, `SaveScoreForm.test.jsx`, `ScorePage.test.jsx`, `App.save.test.jsx` e test browser `e2e/score.spec.js`.

## 2026-11-14 — Fase 2 API punteggi

- **Aggiunto** endpoint `backend/public/api/scores.php`: `GET` top 10 (punteggio desc, a parità il più vecchio), `POST` salvataggio con risposta `201` e record creato, `405` con `Allow` per altri metodi, `500` JSON su errore DB.
- **Aggiunto** `backend/src/scores.php` (`validate_score`, `top_scores`, `insert_score`, prepared statement) e `backend/src/http.php` (`json_response`, `json_error`).
- **Aggiunto** validazione: nome trim, 1–20 caratteri (multibyte), senza caratteri di controllo; `score` / `lines_cleared` interi 0–4294967295, `level` 1–65535; `422` con errori per campo, `400` se il body non è un oggetto JSON.
- **Aggiunto** test browser `e2e/api.spec.js` (21 test, solo progetto desktop).
- **Modificato** `Makefile`: `make e2e` cancella i punteggi di test (`e2e-...`) prima e dopo l'esecuzione; nuovo target `clean-e2e-scores`.
- **Modificato** `CLAUDE.md`: dettagli API (400, 405, formato errori) e regole di validazione.

## 2026-11-14 — Fase 1.2.4 livelli e game over

- **Aggiunto** modulo `game/levels.js`: `levelForLines` (un livello ogni 10 righe) e `dropInterval` (800 ms al livello 1, −15% per livello, minimo 100 ms); parametri in `game/config.js`.
- **Modificato** `game/engine.js`: il livello sale quando si superano le soglie di righe; i punti delle righe usano il livello in cui sono state completate.
- **Modificato** `useFallingGame`: l'intervallo di gravità segue il livello corrente.
- **Aggiunto** messaggio di fine partita con il punteggio finale («Partita terminata · N punti»), con stile dedicato che può andare a capo su schermi stretti.
- **Modificato** `regole-gioco.md`: curva di velocità e comportamento di fine partita.
- **Aggiunto** test Vitest `levels.test.js`, `levelup.test.js`, nuovi casi in `App.score.test.jsx` e test browser `e2e/gameover.spec.js`.

## 2026-11-14 — Fase 1.2.3 righe e punteggio

- **Aggiunto** modulo `game/lines.js` (`clearLines`): elimina le righe complete, le superiori scendono.
- **Aggiunto** modulo `game/scoring.js`: 100 / 300 / 500 / 800 punti per 1–4 righe × livello, caduta veloce +1 e istantanea +2 per cella.
- **Modificato** `game/engine.js`: stato con `score`, `lines`, `level` (fisso a 1 fino alla fase 1.2.4); al fissaggio elimina le righe e assegna i punti prima di verificare lo spazio per il nuovo pezzo.
- **Modificato** pannello punteggio / righe / livello collegato allo stato di gioco.
- **Modificato** `regole-gioco.md`: precisato che il moltiplicatore di livello vale solo per le righe.
- **Aggiunto** test Vitest `lines.test.js`, `scoring.test.js`, `score.test.js`, `App.score.test.jsx`.
- **Corretto** `e2e/keys.spec.js` instabile (corsa con il tick di gravità): ora usa l'orologio simulato di Playwright (`page.clock`) e verifica anche il punteggio.

## 2026-11-14 — Fase 1.2.2 spostamento e rotazione

- **Aggiunto** in `game/engine.js` i comandi puri `move`, `rotate` / `rotateShape` (orario e antiorario, con tentativo di spostamento di 1 colonna a sinistra/destra, altrimenti annullata), `softDrop`, `hardDrop`.
- **Aggiunto** comandi da tastiera secondo `regole-gioco.md`: ← → sposta, ↑ / X ruota orario, Z antiorario, ↓ caduta veloce, Spazio caduta istantanea, P / Esc pausa. Attivi solo a partita in corso; in pausa funzionano solo P / Esc.
- **Corretto** frecce e Spazio non fanno più scorrere la pagina e Spazio non attiva il pulsante che ha il focus (`preventDefault`).
- **Aggiunto** test Vitest `game/controls.test.js`, `components/App.keys.test.jsx` e test browser `e2e/keys.spec.js`.
- **Rimosso** test "i tasti non modificano il pezzo" (valido solo in fase 1.2.1).
- Punti per caduta veloce/istantanea rimandati alla fase 1.2.3 (punteggio).

## 2026-11-14 — Fase 1.2.1 discesa dei pezzi

- **Aggiunto** modulo `game/pieces.js`: 7 forme da 4 blocchi e generazione a sacchetto (`createBag`, rng iniettabile per i test).
- **Aggiunto** modulo `game/engine.js` (puro): comparsa nella zona nascosta di 2 righe, collisioni, caduta di una riga per tick, fissaggio e impilamento, prossimo pezzo, fine partita quando il nuovo pezzo non ha spazio.
- **Aggiunto** hook `useFallingGame`: caduta automatica ogni `DROP_INTERVAL_MS` (800 ms), ferma in pausa; nessun controllo da tastiera in questa fase.
- **Aggiunto** anteprima del prossimo pezzo, messaggio «Partita terminata», colori dei pezzi (palette originale).
- **Modificato** pulsante «Avvia» riattivato a fine partita per ricominciare.
- **Aggiunto** test Vitest (`pieces.test.js`, `engine.test.js`, `App.fall.test.jsx`) e test browser `e2e/falling.spec.js`.

## 2026-11-14 — Test browser (Playwright)

- **Aggiunto** test browser con Playwright (`frontend/e2e/layout.spec.js`), su desktop e mobile: griglia visibile e non coperta, sidebar e anteprima visibili, nessuno scroll orizzontale.
- **Aggiunto** servizio docker `e2e` (immagine Playwright 1.49.1, profilo `test`): `docker compose run --rm e2e`.
- **Aggiunto** `Makefile` con target `make e2e`.
- **Aggiunto** nome accessibile "Pannello di gioco" alla sidebar.
- **Corretto** messaggio di stato ("Premi «Avvia»", "In pausa"): era un velo scuro sfocato che nascondeva tutta la griglia, ora è un'etichetta centrata.

## 2026-11-14 — Fase 1.1 interfaccia gioco senza blocchi

- **Aggiunto** progetto frontend React 18 + Vite 5 multi-page (`main.html`, `score.html`), test con Vitest + Testing Library.
- **Aggiunto** interfaccia di gioco: griglia vuota 10×20, anteprima prossimo pezzo 4×4, pannello punteggio/righe/livello, legenda comandi.
- **Aggiunto** pulsanti Avvia / Pausa / Riprendi (solo stato interfaccia, senza logica di gioco).
- **Aggiunto** `score.html` segnaposto (implementazione in fase 1.3).
- **Aggiunto** modulo `game/board.js` (`createEmptyBoard`) e `game/config.js` con dimensioni griglia.
- **Modificato** container `node` eseguito come utente `node` (uid 1000) per non creare file di root sull'host.

## 2026-11-14

- **Aggiunto** ambiente Docker Compose: nginx, php-fpm 8.3, mariadb 11.4, node 22 (build Vite in watch).
- **Aggiunto** tabella `scores` su MariaDB (`docker/mariadb/init/01-init.sql`).
- **Aggiunto** helper connessione DB `backend/src/db.php` ed endpoint `/api/health.php`.
- **Aggiunto** routing nginx: `/` → `frontend/dist/main.html`, `/api/*.php` → backend PHP.
- **Modificato** CLAUDE.md: definiti stack, API punteggi, regole di gioco (default da confermare), convenzioni.
- **Modificato** regole di gioco spostate in `regole-gioco.md`, con link da CLAUDE.md.
- **Aggiunto** `todoList.md` con le 3 fasi iniziali, collegato da CLAUDE.md.
- **Modificato** `todoList.md`: fase 3 divisa in 3.1 interfaccia, 3.2 animazione blocchi, 3.3 pagina punteggi.
- **Modificato** `todoList.md`: scambiate fase 1 (ora frontend) e fase 3 (ora schema DB).
