import { expect, test } from '@playwright/test';

test.describe('Layout pagina di gioco (browser)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('griglia visibile', async ({ page }) => {
    const board = page.getByRole('grid', { name: 'Campo di gioco' });

    await expect(board).toBeVisible();
    await expect(board).toBeInViewport();

    const cells = board.getByRole('gridcell');
    await expect(cells).toHaveCount(200);

    // la griglia ha dimensioni reali e le celle sono quadrate e non collassate
    const boardBox = await board.boundingBox();
    expect(boardBox.width).toBeGreaterThan(150);
    expect(boardBox.height).toBeGreaterThan(boardBox.width); // 20 righe > 10 colonne

    const cellBox = await cells.first().boundingBox();
    expect(cellBox.width).toBeGreaterThan(8);
    expect(Math.abs(cellBox.width - cellBox.height)).toBeLessThan(1);

    // toBeVisible non rileva elementi sovrapposti: verifico che le celle
    // (angoli e bordi della griglia) non siano coperte da overlay
    const uncovered = await cells.evaluateAll((els) =>
      [0, 9, 100, 109, 190, 199].map((i) => {
        const r = els[i].getBoundingClientRect();
        return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === els[i];
      })
    );
    expect(uncovered).toEqual([true, true, true, true, true, true]);
  });

  test('sidebar e anteprima visibili', async ({ page }, testInfo) => {
    const sidebar = page.getByRole('complementary', { name: 'Pannello di gioco' });
    const preview = sidebar.getByRole('grid', { name: 'Prossimo pezzo' });

    await expect(sidebar).toBeVisible();
    if (testInfo.project.name !== 'desktop') {
      // su mobile l'anteprima è nascosta (vedi mobile.spec.js)
      await expect(preview).toBeHidden();
      await expect(sidebar.getByRole('button', { name: 'Avvia' })).toBeVisible();
      await expect(sidebar.getByTestId('stat-punteggio')).toBeHidden();
      await expect(page.getByTestId('bar-punteggio')).toBeVisible();
      return;
    }
    await expect(preview).toBeVisible();
    await expect(preview.getByRole('gridcell')).toHaveCount(16);

    await expect(sidebar.getByRole('button', { name: 'Avvia' })).toBeVisible();
    await expect(sidebar.getByTestId('stat-punteggio')).toBeVisible();

    const previewBox = await preview.boundingBox();
    expect(previewBox.width).toBeGreaterThan(40);
    expect(previewBox.height).toBeGreaterThan(40);

    // su desktop la sidebar sta a destra della griglia, tutto visibile senza scroll
    await expect(sidebar).toBeInViewport();
    await expect(preview).toBeInViewport();
    const boardBox = await page.getByRole('grid', { name: 'Campo di gioco' }).boundingBox();
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox.x).toBeGreaterThanOrEqual(boardBox.x + boardBox.width);
  });

  test('nessuno scroll orizzontale', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
