import { test, expect, Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Uses the actual local backend through the development proxy; no algorithm responses are mocked.
const username = `ui-week1-${Date.now()}`;
const password = 'WeekOne-Local-Test-42';
let user: { id: number; username: string; displayName: string };
const screenshotDir = resolve('../docs/screenshots/issue-5');

test.beforeAll(async ({ request }) => {
  const health = await request.get('/api/algorithms/health');
  expect(health.ok(), 'Start the local backend on port 8081 first').toBeTruthy();
  const registration = await request.post('/api/auth/register', { data: { username, displayName: '前端验收', password } });
  expect(registration.ok()).toBeTruthy();
  const login = await request.post('/api/auth/login', { data: { username, password } });
  expect(login.ok()).toBeTruthy();
  user = await login.json();
  await mkdir(screenshotDir, { recursive: true });
});
async function session(page: Page, displayName = user.displayName) {
  await page.addInitScript(account => localStorage.setItem('algorithm-viz-session', JSON.stringify(account)), { ...user, displayName });
  await page.goto('/');
}
async function capture(page: Page, name: string) {
  if (!name.startsWith('tooltip')) await page.mouse.move(0, 0);
  await page.screenshot({ path: resolve(screenshotDir, `${name}.png`), fullPage: true, animations: 'disabled' });
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  expect(await page.locator('main').last().evaluate(element => element.scrollWidth <= element.clientWidth)).toBeTruthy();
}
async function learn(page: Page, name: string) {
  await page.getByRole('navigation').getByRole('button', { name: '算法目录', exact: true }).click();
  await page.getByLabel('搜索算法').fill(name);
  await page.locator('.catalog-row').first().click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
}

test('real login, registration feedback, and logout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 245, 240)');
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await noOverflow(page);
    await capture(page, `login-${width}`);
  }
  await page.getByLabel('用户名', { exact: true }).fill(username);
  await page.getByLabel('密码', { exact: true }).fill(password);
  await page.locator('form').getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('heading', { name: /看懂算法的/ })).toBeVisible();
  await page.getByRole('button', { name: `退出 ${user.displayName}` }).click();
  await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible();
  await page.getByRole('button', { name: '注册', exact: true }).click();
  await page.getByLabel('用户名', { exact: true }).fill('local-test');
  await page.getByLabel('密码', { exact: true }).fill('password-a');
  await page.getByLabel('确认密码').fill('password-b');
  await page.getByRole('button', { name: '创建账号' }).click();
  await expect(page.getByRole('alert')).toContainText('两次输入的密码不一致');
});

for (const width of [390, 768, 1440]) {
  test(`home, catalog, playback and responsive navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await session(page);
    await noOverflow(page);
    await capture(page, `home-${width}`);
    await page.getByRole('button', { name: '浏览算法目录' }).click();
    await page.getByLabel('搜索算法').fill('BFS');
    await expect(page.locator('.catalog-row')).toHaveCount(1);
    await page.getByLabel('算法分类').selectOption('排序算法');
    await expect(page.getByRole('heading', { name: '没有找到匹配的算法' })).toBeVisible();
    await page.getByRole('button', { name: '查看全部算法' }).click();
    await expect(page.locator('.catalog-row')).toHaveCount(16);
    await noOverflow(page);
    await capture(page, `catalog-${width}`);
    await page.getByLabel('搜索算法').fill('冒泡排序');
    await page.locator('.catalog-row').click();
    if (width < 1024) {
      await page.getByRole('button', { name: '选择算法', exact: true }).click();
      await expect(page.getByRole('dialog', { name: '选择算法' })).toBeVisible();
      await expect(page.getByRole('button', { name: '关闭算法导航' })).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(page.getByRole('dialog', { name: '选择算法' }).getByRole('button').last()).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: '选择算法', exact: true })).toBeFocused();
    }
    await page.getByLabel('排序数组', { exact: true }).fill('5,3,1,4,2');
    await page.getByRole('button', { name: '确认', exact: true }).click();
    await page.getByRole('button', { name: '运行', exact: true }).click();
    await expect(page.locator('app-sorting-visualizer')).toBeVisible();
    await page.getByRole('button', { name: '下一步', exact: true }).click();
    await expect(page.getByRole('slider', { name: '算法执行进度' })).toHaveValue('1');
    await page.getByRole('button', { name: '开始播放', exact: true }).click();
    await page.getByRole('button', { name: '暂停播放', exact: true }).click();
    await noOverflow(page);
    await capture(page, `learning-${width}`);
    await page.getByRole('button', { name: '跳到最后' }).click();
    await expect(page.locator('app-sorting-visualizer')).toContainText('排序完成');
    await page.getByRole('button', { name: '重置', exact: true }).click();
    await expect(page.getByText('输入数据后，点击运行')).toBeVisible();
  });
}

test('real quick sort, binary search, comparison, and request failure', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await session(page);
  await learn(page, '快速排序');
  await page.getByRole('button', { name: '运行', exact: true }).click();
  await expect(page.locator('app-sorting-visualizer')).toBeVisible();
  await page.getByRole('button', { name: '对比模式', exact: false }).click();
  await page.getByRole('group', { name: '对比算法', exact: true }).getByRole('button', { name: '冒泡排序', exact: true }).click();
  await page.getByRole('button', { name: '运行对比', exact: true }).click();
  await expect(page.locator('app-sorting-visualizer')).toHaveCount(2);
  await capture(page, 'compare-1440');
  await page.getByRole('button', { name: '算法详情', exact: true }).click();
  const panels = page.locator('#algorithm-details-content app-complexity-panel');
  await expect(panels).toHaveCount(2);
  await expect(panels.first()).toContainText('O(log n)');
  await expect(panels.last()).toContainText('O(1)');
  await capture(page, 'compare-details-1440');
  await page.getByRole('button', { name: '算法详情', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 1000 });
  await noOverflow(page);
  await capture(page, 'compare-390');
  await learn(page, '二分查找');
  await page.getByRole('button', { name: '运行', exact: true }).click();
  await expect(page.locator('app-search-visualizer')).toBeVisible();
  await page.getByRole('button', { name: '跳到最后' }).click();
  await expect(page.getByText('已找到')).toBeVisible();
  await noOverflow(page);
  // Only the error scenario deliberately intercepts an API response.
  await page.route('**/api/algorithms/search', route => route.fulfill({ status: 503, json: { message: 'test failure' } }));
  await page.getByRole('button', { name: '运行', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('暂时无法运行算法');
  await capture(page, 'error-390');
});

test('account fallback and simplified navigation', async ({ page }) => {
  await session(page, '');
  await expect(page.getByTitle(username, { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('button')).toHaveText(['首页', '算法目录', '可视化学习']);
  await expect(page.locator('app-ai-complexity-dialog, app-competition, app-assessment-container, app-history-panel')).toHaveCount(0);
  await learn(page, '冒泡排序');
  await expect(page.locator('app-control-panel')).not.toContainText('速度');
  await expect(page.getByRole('button', { name: /[0-9]×/ })).toHaveCount(0);
  await page.getByLabel('随机数组大小').fill('8');
  await page.getByRole('button', { name: '随机生成', exact: true }).click();
  expect((await page.getByLabel('排序数组', { exact: true }).inputValue()).split(',')).toHaveLength(8);
  await expect(page.getByRole('button', { name: '随机生成', exact: true }).locator('svg')).toHaveCount(1);
  await noOverflow(page);
});

test('long display name remains available without overflowing', async ({ page }) => {
  const name = '这是一个用于验证布局的很长很长的中文显示名称';
  await page.setViewportSize({ width: 768, height: 1000 });
  await session(page, name);
  await expect(page.getByTitle(name)).toBeVisible();
  expect(await page.getByTitle(name).evaluate(element => element.scrollWidth > element.clientWidth)).toBeTruthy();
  await noOverflow(page);
});

test('remaining visualizer layouts fit common widths', async ({ page }) => {
  test.slow(); // Fifteen real backend/WebGL views across three viewport sizes.
  const browserErrors: string[] = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await session(page);
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [name, selector] of [['BFS 广度优先', 'app-graph-visualizer'], ['0/1 背包', 'app-dp-visualizer'], ['N 皇后', 'app-n-queens-visualizer'], ['大整数乘法 Karatsuba', 'app-divide-conquer-visualizer'], ['3D 数据结构学习', 'app-vr-3d-visualizer']]) {
      await learn(page, name);
      await page.getByRole('button', { name: '运行', exact: true }).click();
      await expect(page.locator(selector)).toBeVisible();
      if (name !== '3D 数据结构学习' && name !== 'BFS 广度优先') {
        // Capture intermediate states so cell, tree and board highlights are reviewed too.
        for (let step = 0; step < 3; step++) {
          const next = page.getByRole('button', { name: '下一步', exact: true });
          if (await next.isEnabled()) await next.click();
        }
      }
      await noOverflow(page);
      if (name === '3D 数据结构学习') {
        await expect(page.locator('canvas')).toBeVisible();
        const canvasWidth = await page.locator('canvas').evaluate(e => e.clientWidth);
        const stageWidth = await page.locator('app-vr-3d-visualizer').evaluate(e => e.clientWidth);
        expect(canvasWidth).toBeGreaterThan(stageWidth * (width >= 1280 ? 0.5 : 0.7));
        await page.locator('canvas').scrollIntoViewIfNeeded();
      }
      await capture(page, `${selector}-${width}`);
    }
  }
  expect(browserErrors).toEqual([]);
});

test('details are optional, follow the current step, and reset on algorithm changes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await session(page);
  await learn(page, '冒泡排序');
  const toggle = page.getByRole('button', { name: '算法详情', exact: true });
  const details = page.locator('#algorithm-details-content');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(details).not.toBeVisible();
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(details).toContainText('空间复杂度');
  const response = page.waitForResponse(r => r.url().endsWith('/api/algorithms/sort') && r.request().method() === 'POST');
  await page.getByRole('button', { name: '运行', exact: true }).click();
  const result = await (await response).json();
  await expect(page.locator('app-sorting-visualizer')).toBeVisible();
  await page.getByRole('button', { name: '跳到最后' }).click();
  await expect(details.getByText('比较次数', { exact: true }).locator('..').locator('dd')).toHaveText(String(result.steps.at(-1).comparisons));
  await page.getByRole('button', { name: '回到开始', exact: true }).click();
  await expect(details.getByText('访问次数', { exact: true }).locator('..').locator('dd')).toHaveText(String(result.steps[0].accesses));
  await page.getByRole('button', { name: '跳到最后' }).click();
  await expect(page.locator('app-sorting-visualizer')).not.toContainText('比较:');
  await capture(page, 'details-1440');
  await page.locator('app-sidebar').getByRole('button', { name: '二分查找', exact: true }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(details).not.toBeVisible();
  await toggle.click();
  await expect(details).toContainText('O(log n)');
  await page.getByRole('navigation').getByRole('button', { name: '首页', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name: '可视化学习', exact: true }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('icon hints appear on keyboard focus and hover without blocking playback', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await session(page);
  await learn(page, '冒泡排序');
  await page.getByRole('button', { name: '运行', exact: true }).click();
  const next = page.getByRole('button', { name: '下一步', exact: true });
  await expect(next).toBeEnabled();
  await next.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(next).toBeFocused();
  await expect.poll(() => next.evaluate(e => getComputedStyle(e, '::after').visibility)).toBe('visible');
  expect(await next.evaluate(e => getComputedStyle(e, '::after').content)).toContain('下一步');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('slider', { name: '算法执行进度' })).toHaveValue('1');
  await page.keyboard.press('Tab');
  await next.hover();
  await expect.poll(() => next.evaluate(e => getComputedStyle(e, '::after').visibility)).toBe('visible');
  await capture(page, 'tooltip-390');
  await noOverflow(page);
});

test('reduced motion keeps navigation, expansion, and rapid steps usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 1000 });
  await session(page);
  expect(await page.locator('.page-content').evaluate(e => getComputedStyle(e).animationName)).toBe('none');
  await learn(page, '冒泡排序');
  const toggle = page.getByRole('button', { name: '算法详情', exact: true });
  await toggle.click();
  expect(await page.locator('.details-reveal').evaluate(e => getComputedStyle(e).transitionDuration)).toBe('0s');
  await expect(page.getByText('空间复杂度', { exact: true })).toBeVisible();
  await toggle.click();
  await expect(page.locator('#algorithm-details-content')).not.toBeVisible();
  await page.getByRole('button', { name: '选择算法', exact: true }).click();
  expect(await page.locator('.drawer-panel').evaluate(e => getComputedStyle(e).animationName)).toBe('none');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '选择算法', exact: true })).toBeFocused();
  await page.getByRole('button', { name: '运行', exact: true }).click();
  const next = page.getByRole('button', { name: '下一步', exact: true });
  await expect(next).toBeEnabled();
  for (let i = 0; i < 4; i++) await next.click({ delay: 0 });
  await expect(page.getByRole('slider', { name: '算法执行进度' })).toHaveValue('4');
  expect(await page.locator('app-sorting-visualizer .viz-transition').first().evaluate(e => getComputedStyle(e).transitionDuration)).toBe('0s');
  await noOverflow(page);
});
