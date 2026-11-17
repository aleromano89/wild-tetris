import { expect, test } from '@playwright/test';

// Scelta dello stile dei mattoni: ogni opzione applica la propria classe CSS a campo e anteprima; scelta ricordata.

const STYLES = [
  { name: 'Classico', css: 'bricks--classic' },
  { name: 'Cubi di ghiaccio', css: 'bricks--ice' },
  { name: 'Legno', css: 'bricks--wood' },
  { name: 'Lava incandescente', css: 'bricks--lava' },
];

test('stile mattoni: ogni opzione applica la propria classe e la scelta viene ricordata', async ({ page }) => {
  await page.goto('/');
  const group = page.getByRole('radiogroup', { name: 'Stile mattoni' });
  const board = page.getByRole('grid', { name: 'Campo di gioco' });
  await expect(board).toHaveClass(/\bbricks--classic\b/);

  for (const { name, css } of STYLES) {
    await group.locator('label').filter({ hasText: name }).click();
    await expect(board).toHaveClass(new RegExp(`\\b${css}\\b`));
  }

  await page.reload();
  await expect(page.getByRole('grid', { name: 'Campo di gioco' })).toHaveClass(/\bbricks--lava\b/);
  await expect(page.getByRole('radio', { name: 'Lava incandescente' })).toBeChecked();
});
