import { test, expect } from '@playwright/test';

const DEFAULT_TIMEOUT = 5000 // Comes from window['_bd_timeout']

test.beforeEach(async ({ page }) => {
  await page.goto(`file://${__dirname}/../index.html`)
  
  // Expect a title "to contain" a substring.
  await expect(await page.locator('#loaded-status-esm').textContent()).toContain('Loading')
  await expect(await page.locator('#loaded-status').textContent()).toContain('Loading')
  await expect(await page.locator('#loaded-lozad-status').textContent()).toContain('Loading')
  
})

test('loads in background', async ({ page }) => {
  await page.waitForTimeout(DEFAULT_TIMEOUT + 2000);

  await expect(await page.locator('#loaded-status-esm').textContent()).toContain('done [module=object]')
  await expect(await page.locator('#loaded-status').textContent()).toContain('done')
  await expect(await page.locator('#loaded-lozad-status').textContent()).toContain('done')
});

test('loads by trigger', async ({ page }) => {
  await page.getByRole('textbox').fill('triggering')
  
  await page.waitForTimeout(DEFAULT_TIMEOUT * 0.6);
  await expect(await page.locator('#loaded-status-esm').textContent()).toContain('done [module=object]')
  await expect(await page.locator('#loaded-status').textContent()).toContain('done')
  await expect(await page.locator('#loaded-lozad-status').textContent()).toContain('done')
});
