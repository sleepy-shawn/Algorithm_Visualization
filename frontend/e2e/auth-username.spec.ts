import { test, expect } from '@playwright/test';

test('single-character registration retains the username and bilingual requirements', async ({ page }) => {
  await page.route('**/api/auth/{register,login}', async route => {
    expect(route.request().postDataJSON().username).toBe('小');
    await route.fulfill({json: {id: 1, username: '小', displayName: ''}});
  });
  await page.goto('/');
  await page.getByRole('button', {name: '注册', exact: true}).click();
  await expect(page.locator('#registerUsername')).toHaveAttribute('placeholder', '必填，最多 50 个字符');
  await page.getByRole('button', {name: 'Switch to English', exact: true}).click();
  await expect(page.locator('#registerUsername')).toHaveAttribute('placeholder', 'Required, up to 50 characters');
  await page.locator('#registerUsername').fill('小');
  await page.locator('#registerPassword').fill('test-password');
  await page.locator('#registerConfirmPassword').fill('test-password');
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByRole('status')).toHaveText('Account created. Please sign in.');
  await expect(page.getByLabel('Username', {exact: true})).toHaveValue('小');
  await page.getByLabel('Password', {exact: true}).fill('test-password');
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByRole('button', {name: 'Sign out 小', exact: true})).toBeVisible();
});
