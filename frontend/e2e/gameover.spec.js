import { expect, test } from '@playwright/test';

// Fase 1.2.4: fine partita nel browser. Orologio simulato e Math.random fisso per un esito deterministico.
test('fine partita: messaggio con punteggio, dentro la griglia, e nuova partita', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    Math.random = () => 0.999;
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Avvia' }).click();

  // cadute istantanee al centro finché i pezzi arrivano in cima
  const overlay = page.getByText(/partita terminata/i);
  for (let i = 0; i < 40 && !(await overlay.count()); i++) await page.keyboard.press('Space');
  await expect(overlay).toBeVisible();

  const score = await page.getByTestId('stat-punteggio').textContent();
  expect(Number(score.replace(/\D/g, ''))).toBeGreaterThan(0);
  await expect(overlay).toContainText(`${score} punti`);

  // il messaggio resta dentro il campo di gioco (anche su mobile)
  await overlay.scrollIntoViewIfNeeded();
  const boardBox = await page.getByRole('grid', { name: 'Campo di gioco' }).boundingBox();
  const box = await overlay.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(boardBox.x);
  expect(box.x + box.width).toBeLessThanOrEqual(boardBox.x + boardBox.width);
  // ed è in primo piano (non coperto). L'overlay ha pointer-events: none, che elementFromPoint
  // ignora sempre: li riattivo solo per la verifica.
  const onTop = await overlay.evaluate((el) => {
    el.style.pointerEvents = 'auto';
    const r = el.getBoundingClientRect();
    const hit = el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    el.style.pointerEvents = '';
    return hit;
  });
  expect(onTop).toBe(true);

  // a partita finita la gravità e i tasti non cambiano più nulla
  const board = page.getByRole('grid', { name: 'Campo di gioco' });
  const before = await board.innerHTML();
  await page.keyboard.press('ArrowLeft');
  await page.clock.runFor(5000);
  expect(await board.innerHTML()).toBe(before);

  // nuova partita: tutto azzerato
  await page.getByRole('button', { name: 'Avvia' }).click();
  await expect(overlay).toHaveCount(0);
  await expect(page.getByTestId('stat-punteggio')).toHaveText('0');
  await expect(page.getByTestId('stat-livello')).toHaveText('1');
});
