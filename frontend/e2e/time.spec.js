import { expect, test } from '@playwright/test';

// Contatore del tempo di gioco (orologio simulato di Playwright).
test('il tempo avanza durante la partita e si ferma in pausa', async ({ page }, testInfo) => {
  await page.clock.install();
  await page.goto('/');
  // desktop: pannello laterale; mobile: barra statistiche in alto
  const time = page.getByTestId(testInfo.project.name === 'mobile' ? 'bar-tempo' : 'stat-tempo');
  await expect(time).toBeVisible();
  await expect(time).toHaveText('0:00');

  await page.getByRole('button', { name: 'Inizia partita' }).click();
  await page.clock.runFor(3000);
  await expect(time).toHaveText('0:03');

  await page.keyboard.press('p');
  await page.clock.runFor(10_000);
  await expect(time).toHaveText('0:03');

  await page.keyboard.press('p');
  await page.clock.runFor(62_000);
  await expect(time).toHaveText('1:05');
});
