import { expect, test } from '@playwright/test';

// Versione mobile: pulsantiera di gioco e barra statistiche compatta.
// Formati dalle direttive di progetto: dispositivo piccolo (iPhone SE, area visibile in Safari 375×553)
// e grande (iPhone 15 Pro, 393×659). Si usa il browser del progetto "mobile" (touch attivo).
const DROP_INTERVAL_MS = 800;
const PAD_BUTTONS = ['Sposta a sinistra', 'Scendi', 'Sposta a destra', 'Ruota', 'Caduta istantanea'];
const BAR_STATS = ['bar-punteggio', 'bar-righe', 'bar-livello'];

const board = (page) => page.getByRole('grid', { name: 'Campo di gioco' });
const pad = (page) => page.getByRole('group', { name: 'Comandi di gioco' });
const bar = (page) => page.getByRole('region', { name: 'Statistiche partita' });
const indexes = (page) =>
  board(page)
    .getByRole('gridcell')
    .evaluateAll((els) => els.map((el, i) => (el.dataset.filled === 'true' ? i : -1)).filter((i) => i >= 0));

/** true se l'elemento è tutto dentro il viewport (senza scroll) e il suo centro non è coperto. */
const fullyVisible = (locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const inside = r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return inside && !!hit && (hit === el || el.contains(hit));
  });

const overlayStart = (page) => page.getByRole('button', { name: 'Inizia partita' });
const topPause = (page) => page.getByRole('banner').getByRole('button', { name: /metti in pausa|riprendi la partita/i });

/** Avvia la partita dal pulsante nell'overlay della griglia, senza scorrere la pagina. */
async function startAtTop(page) {
  await overlayStart(page).tap();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
}

/** Caduta istantanea ripetuta fino a fine partita. */
async function playUntilOver(page) {
  const over = page.getByText(/partita terminata/i);
  for (let i = 0; i < 40 && !(await over.count()); i++) await page.keyboard.press('Space');
  await expect(over).toBeVisible();
}

const expectTouchTarget = async (locator) => {
  const box = await locator.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
};

test.describe('Versione mobile (browser)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'solo progetto mobile');
    await page.clock.install();
    await page.addInitScript(() => {
      Math.random = () => 0.999;
    });
  });

  for (const [nome, viewport] of [
    ['iPhone SE', { width: 375, height: 553 }],
    ['iPhone 15 Pro', { width: 393, height: 659 }],
  ]) {
    test.describe(nome, () => {
      test.use({ viewport });

      test('in stato iniziale Avvia è nell\'overlay della griglia, visibile senza scroll', async ({ page }) => {
        await page.goto('/');
        expect(await fullyVisible(overlayStart(page))).toBe(true);
        await expectTouchTarget(overlayStart(page));
        await expect(topPause(page)).toHaveCount(0);

        await startAtTop(page);
        await expect(overlayStart(page)).toHaveCount(0);
        await expect(pad(page).getByRole('button', { name: 'Ruota' })).toBeEnabled();
      });

      test('durante la partita la Pausa è un\'icona nella barra in alto', async ({ page }) => {
        await page.goto('/');
        await startAtTop(page);

        expect(await fullyVisible(topPause(page))).toBe(true);
        await expectTouchTarget(topPause(page));
        await expect(topPause(page)).toHaveAccessibleName('Metti in pausa');

        await topPause(page).tap();
        await expect(page.getByText('In pausa')).toBeVisible();
        await expect(pad(page).getByRole('button', { name: 'Ruota' })).toBeDisabled();
        expect(await fullyVisible(topPause(page))).toBe(true);

        await topPause(page).tap();
        await expect(page.getByText('In pausa')).toHaveCount(0);
        await expect(pad(page).getByRole('button', { name: 'Ruota' })).toBeEnabled();
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
      });

      test('anteprima del prossimo pezzo nascosta', async ({ page }) => {
        await page.goto('/');
        await startAtTop(page);
        await expect(page.getByRole('grid', { name: 'Prossimo pezzo' })).toBeHidden();
      });

      test('a fine partita il modulo del nome resta visibile con la tastiera virtuale aperta', async ({ page }) => {
        await page.goto('/');
        await startAtTop(page);
        await playUntilOver(page);

        const input = page.getByRole('textbox', { name: /nome/i });
        await expect(input).toBeFocused();
        const form = page.locator('.save-score');
        expect(await fullyVisible(input)).toBe(true);

        // tastiera aperta: l'area visibile si riduce di circa 260px
        await page.setViewportSize({ width: viewport.width, height: viewport.height - 260 });
        await expect.poll(() => fullyVisible(form)).toBe(true);
        // campo e pulsante interi, non coperti (es. dalla pulsantiera) e non schiacciati
        for (const el of [input, page.getByRole('button', { name: 'Salva' })]) {
          expect(await fullyVisible(el)).toBe(true);
          expect(await el.evaluate((e) => {
            const r = e.getBoundingClientRect();
            const hit = (x) => { const h = document.elementFromPoint(x, r.top + r.height / 2); return !!h && (h === e || e.contains(h)); };
            return hit(r.left + 4) && hit(r.right - 4);
          })).toBe(true);
          await expectTouchTarget(el);
        }
        const formBox = await form.boundingBox();
        expect(formBox.width).toBeGreaterThanOrEqual(240);
        // la griglia non collassa quando si riduce l'altezza
        const cell = await board(page).getByRole('gridcell').first().boundingBox();
        expect(cell.width).toBeGreaterThanOrEqual(12);
      });

      test('durante la partita griglia, statistiche e pulsantiera stanno nello schermo senza scroll', async ({ page }) => {
        await page.goto('/');
        await startAtTop(page);

        await expect(bar(page)).toBeVisible();
        await expect(pad(page)).toBeVisible();

        // griglia: angoli e celle dell'ultima riga visibili e non coperti
        const cells = board(page).getByRole('gridcell');
        for (const i of [0, 9, 190, 199]) expect(await fullyVisible(cells.nth(i)), `cella ${i}`).toBe(true);

        for (const id of BAR_STATS) expect(await fullyVisible(page.getByTestId(id)), id).toBe(true);
        for (const name of PAD_BUTTONS) {
          const btn = pad(page).getByRole('button', { name });
          expect(await fullyVisible(btn), name).toBe(true);
          await expectTouchTarget(btn); // area di tocco minima 44×44
        }

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    });
  }

  test('i pulsanti muovono il pezzo e aggiornano la barra statistiche, senza scorrere la pagina', async ({ page }) => {
    await page.goto('/');
    await startAtTop(page);
    await page.clock.runFor(DROP_INTERVAL_MS * 3);
    await expect.poll(() => indexes(page)).toEqual([13, 14, 15, 16]);

    const tap = (name) => pad(page).getByRole('button', { name }).tap();

    await tap('Sposta a sinistra');
    await expect.poll(() => indexes(page)).toEqual([12, 13, 14, 15]);
    await tap('Sposta a destra');
    await expect.poll(() => indexes(page)).toEqual([13, 14, 15, 16]);
    await tap('Ruota');
    await expect.poll(() => indexes(page)).toEqual([5, 15, 25, 35]);
    await tap('Scendi');
    await expect.poll(() => indexes(page)).toEqual([15, 25, 35, 45]);
    await expect(page.getByTestId('bar-punteggio')).toHaveText('1');
    await tap('Caduta istantanea');
    await expect.poll(() => indexes(page)).toEqual([165, 175, 185, 195]);
    await expect(page.getByTestId('bar-punteggio')).toHaveText('31');

    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test('su desktop pulsantiera e barra statistiche compatta sono nascoste', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo progetto desktop');
  await page.goto('/');
  await expect(pad(page)).toBeHidden();
  await expect(bar(page)).toBeHidden();
  await expect(page.getByTestId('stat-punteggio')).toBeVisible();
  await expect(page.getByRole('grid', { name: 'Prossimo pezzo' })).toBeVisible();

  // Avvia anche nell'overlay; la pausa resta nel pannello laterale (e P / Esc)
  await overlayStart(page).click();
  await expect(page.getByRole('button', { name: 'Pausa', exact: true })).toBeEnabled();
  await expect(topPause(page)).toBeHidden();
});
