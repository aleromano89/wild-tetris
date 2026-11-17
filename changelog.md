# Changelog

Registro delle feature e modifiche del progetto.


## 2026-11-17 — Frontend mobile: Avvia, Pausa, anteprima e tastiera

- **Aggiunto** su mobile pulsante «Inizia partita» al centro della griglia e icona Pausa / Riprendi nella barra in alto durante la partita.
- **Modificato** su mobile anteprima del prossimo pezzo nascosta; il modulo di fine partita resta visibile con la tastiera virtuale aperta.
- **Corretto** traduzioni spagnole mancanti per la sezione configurazione (nascosta).

## 2026-11-16 — Testi dell'interfaccia con react-intl

- **Aggiunto** `react-intl` e `src/i18n/` (testi in `it.json` / `es.json`, lingua attiva `LOCALE = 'it'`): tutti i testi visibili e le etichette ARIA passano da id; tradotti anche gli errori API generati dal client.
- **Rimosso** chiavi non usate `app.title` / `app.description`.
- **Aggiunto** test di coerenza delle traduzioni, test dell'interfaccia in spagnolo e helper di test `src/test/intl.jsx`; convenzione aggiunta alle direttive di progetto.


## 2026-11-16 — Frontend mobile: pulsantiera e barra statistiche

- **Aggiunto** su mobile pulsantiera di gioco sotto la griglia (`TouchPad`) e barra statistiche compatta sopra la griglia.
- **Modificato** layout mobile: griglia adattiva in altezza, tutto in una schermata durante la partita; aggiunte le direttive di progetto per il mobile.
- **Aggiunto** test `App.touch.test.jsx` ed `e2e/mobile.spec.js`.


## 2026-11-14 — Fase 1.3 salvataggio punteggio e classifica

- **Aggiunto** client API, modulo di salvataggio del nome a fine partita e pagina `score.html` con la top 10 (podio, stati di caricamento/vuoto/errore).
- **Aggiunto** test Vitest e browser (`e2e/score.spec.js`).

## 2026-11-14 — Fase 2 API punteggi

- **Aggiunto** endpoint `scores.php` (`GET` top 10, `POST` con validazione, errori JSON 400/405/422/500) e helper backend.
- **Aggiunto** test `e2e/api.spec.js`; `make e2e` pulisce i punteggi di test.

## 2026-11-14 — Fase 1.2.4 livelli e game over

- **Aggiunto** livelli (uno ogni 10 righe) con velocità crescente e messaggio di fine partita con il punteggio.
- **Aggiunto** test su livelli e game over; regole aggiornate in `regole-gioco.md`.

## 2026-11-14 — Fase 1.2.3 righe e punteggio

- **Aggiunto** eliminazione righe complete e punteggio (righe × livello, bonus cadute), collegati al pannello.
- **Corretto** instabilità di `e2e/keys.spec.js` con l'orologio simulato di Playwright.

## 2026-11-14 — Fase 1.2.2 spostamento e rotazione

- **Aggiunto** comandi da tastiera (sposta, ruota, cadute, pausa) su logica pura e relativi test.
- **Corretto** frecce e Spazio non fanno più scorrere la pagina né attivano il pulsante con il focus.

## 2026-11-14 — Fase 1.2.1 discesa dei pezzi

- **Aggiunto** 7 pezzi a sacchetto, motore di gioco puro (caduta, collisioni, impilamento, fine partita), anteprima e colori originali.
- **Aggiunto** test Vitest e browser (`e2e/falling.spec.js`).

## 2026-11-14 — Test browser (Playwright)

- **Aggiunto** test Playwright desktop e mobile nel servizio docker `e2e` e target `make e2e`.
- **Corretto** messaggio di stato: da velo che copriva la griglia a etichetta centrata.

## 2026-11-14 — Fase 1.1 interfaccia gioco senza blocchi

- **Aggiunto** frontend React + Vite multi-page con griglia 10×20, anteprima, pannello statistiche, legenda e pulsanti Avvia/Pausa.
- **Modificato** container `node` eseguito come utente non root.

## 2026-11-14

- **Aggiunto** ambiente Docker Compose (nginx, PHP 8.3, MariaDB 11.4, node), tabella `scores` ed endpoint `/api/health.php`.
- **Modificato** direttive di progetto, `regole-gioco.md` e `todoList.md` con stack, regole e fasi del progetto.
