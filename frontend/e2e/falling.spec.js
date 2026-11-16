import { expect, test } from '@playwright/test';

// Fase 1.2.1: dopo "Avvia" i pezzi scendono da soli, senza controllo del giocatore.
test.describe('Discesa dei pezzi (browser)', () => {
  test('dopo Avvia un pezzo colorato compare e scende', async ({ page }) => {
    await page.goto('/');
    const board = page.getByRole('grid', { name: 'Campo di gioco' });
    const filled = board.locator('[data-filled="true"]');

    await expect(filled).toHaveCount(0);
    await page.getByRole('button', { name: 'Avvia' }).click();

    // il pezzo nasce nella zona nascosta: entro qualche intervallo è interamente visibile
    await expect(filled).toHaveCount(4, { timeout: 5000 });

    const indexes = () =>
      board.getByRole('gridcell').evaluateAll((els) =>
        els.map((el, i) => (el.dataset.filled === 'true' ? i : -1)).filter((i) => i >= 0)
      );
    const before = await indexes();
    await expect.poll(indexes, { timeout: 3000 }).not.toEqual(before);
    const after = await indexes();
    // stessa forma, una riga più in basso (10 celle)
    expect(after).toEqual(before.map((i) => i + 10));

    // la cella piena è colorata e non coperta da altri elementi
    // (su mobile il click su Avvia, sotto la griglia, fa scorrere la pagina)
    await page.getByRole('button', { name: 'Pausa' }).click();
    await filled.first().scrollIntoViewIfNeeded();
    const visible = await filled.first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      const bg = getComputedStyle(el).backgroundImage;
      return {
        uncovered: document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el,
        gradient: bg.includes('gradient'),
      };
    });
    expect(visible).toEqual({ uncovered: true, gradient: true });

    // l'anteprima mostra il prossimo pezzo
    const preview = page.getByRole('grid', { name: 'Prossimo pezzo' });
    await expect(preview.locator('[data-filled="true"]')).toHaveCount(4);
  });

  test('in pausa il pezzo è fermo e i tasti sono ignorati', async ({ page }) => {
    await page.goto('/');
    const board = page.getByRole('grid', { name: 'Campo di gioco' });
    await page.getByRole('button', { name: 'Avvia' }).click();
    await expect(board.locator('[data-filled="true"]')).toHaveCount(4, { timeout: 5000 });

    await page.getByRole('button', { name: 'Pausa' }).click();
    const snap = () => board.innerHTML();
    const paused = await snap();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(1200);
    expect(await snap()).toBe(paused);
    await expect(page.getByText('In pausa')).toBeVisible();
  });
});
