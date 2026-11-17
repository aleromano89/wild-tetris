import { expect, test } from '@playwright/test';

// Pulsante per cambiare lingua: vale per tutte le pagine e resta dopo il ricaricamento.
const switcher = (page) => page.getByRole('banner').getByRole('button', { name: /passa a|cambiar a/i });

/** true se l'elemento è dentro il viewport e il suo centro non è coperto. */
const fullyVisible = (locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const inside = r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return inside && !!hit && (hit === el || el.contains(hit));
  });

test('switch lingua: spagnolo su gioco e classifica, ricordato al ricaricamento', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  expect(await fullyVisible(switcher(page))).toBe(true);
  await expect(switcher(page)).toHaveAccessibleName('Passa a Español');

  await switcher(page).click();
  await expect(page.getByRole('button', { name: 'Empezar partida' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');

  await page.reload();
  await expect(page.getByRole('button', { name: 'Empezar partida' })).toBeVisible();

  await page.goto('/score.html');
  await expect(page.getByRole('link', { name: 'Volver al juego' })).toBeVisible();
  expect(await fullyVisible(switcher(page))).toBe(true);
  await switcher(page).click();
  await expect(page.getByRole('link', { name: 'Torna al gioco' })).toBeVisible();

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Inizia partita' })).toBeVisible();
});

test('su mobile la barra in alto sta su una riga, senza scroll orizzontale, anche durante la partita', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'solo progetto mobile');
  await page.setViewportSize({ width: 375, height: 553 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Inizia partita' }).tap();
  for (const locale of ['it', 'es']) {
    const banner = page.getByRole('banner');
    const items = [banner.getByRole('heading'), banner.getByRole('button'), banner.getByRole('link')];
    const tops = [];
    for (const item of items) {
      for (const el of await item.all()) {
        expect(await fullyVisible(el), `${locale}: ${await el.textContent()}`).toBe(true);
        tops.push((await el.boundingBox()).y);
      }
    }
    expect(tops).toHaveLength(4); // titolo, pausa, lingua, classifica
    const bannerBox = await banner.boundingBox();
    expect(bannerBox.height).toBeLessThan(90);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    if (locale === 'it') await switcher(page).tap();
  }
});
