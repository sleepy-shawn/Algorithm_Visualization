import { test, expect, Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const dir = resolve('../docs/screenshots/issue-5/preferences');
let account: {id: number; username: string; displayName: string};
test.beforeAll(async ({ request }) => {
  const username = `preferences-${Date.now()}`;
  await request.post('/api/auth/register', {data: {username, displayName: 'Theme review', password: 'Preferences-Test-42'}});
  const login = await request.post('/api/auth/login', {data: {username, password: 'Preferences-Test-42'}});
  expect(login.ok()).toBeTruthy(); account = await login.json(); await mkdir(dir, {recursive: true});
});
async function signIn(page: Page) {
  await page.goto('/');
  await page.evaluate(user => localStorage.setItem('algorithm-viz-session', JSON.stringify(user)), account);
  await page.reload();
}
async function capture(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  expect(await page.locator('main').last().evaluate(el => el.scrollWidth <= el.clientWidth)).toBeTruthy();
  await page.mouse.move(0, 0); await page.screenshot({path: resolve(dir, name + '.png'), animations: 'disabled'});
}
test('preferences work before login, persist, and preserve learning state', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Switch to English', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Welcome back'})).toBeVisible();
  await page.getByRole('button', {name: 'Switch to dark theme'}).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('form').getByRole('button', {name: 'Sign in', exact: true}).click();
  await expect(page.getByRole('alert')).toHaveText('Enter your username and password.');
  await signIn(page);
  await page.getByRole('button', {name: 'Browse algorithms', exact: true}).click();
  await page.getByLabel('Search algorithms', {exact:true}).fill('bubble sort');
  await expect(page.locator('.catalog-row')).toHaveCount(1);
  await page.locator('.catalog-row').click();
  await page.getByLabel('Sorting array', {exact:true}).fill('8,3,5');
  await page.getByRole('button', {name: 'Apply', exact:true}).click();
  await page.getByRole('button', {name: 'Run', exact:true}).click();
  await page.getByRole('button', {name: 'Next step', exact:true}).click();
  await page.getByRole('button', {name: 'Algorithm details', exact:true}).click();
  const progress = await page.getByRole('slider', {name: 'Algorithm progress'}).inputValue();
  await page.getByRole('button', {name: '切换为中文', exact:true}).click();
  await expect(page.getByLabel('排序数组', {exact:true})).toHaveValue('8,3,5');
  await expect(page.getByRole('slider', {name: '算法执行进度'})).toHaveValue(progress);
  await expect(page.getByRole('button', {name: '算法详情', exact:true})).toHaveAttribute('aria-expanded', 'true');
  await capture(page, 'learning-dark-zh-1280');
  await page.getByRole('button', {name: '切换为浅色主题'}).click();
  await expect(page.getByRole('slider', {name: '算法执行进度'})).toHaveValue(progress);
  await page.getByRole('button', {name: 'Switch to English', exact:true}).click();
  await expect(page.locator('app-sorting-visualizer')).toContainText('Swap arr');
});
for (const width of [390,768,1440]) {
  test(`English dark/light layouts at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:1000}); await page.goto('/');
    await page.getByRole('button', {name:'Switch to English',exact:true}).click();
    await page.getByRole('button', {name:'Switch to dark theme'}).click();
    await capture(page, `login-dark-en-${width}`);
    await signIn(page); await capture(page, `home-dark-en-${width}`);
    await page.getByRole('button', {name:'Browse algorithms',exact:true}).click();
    await capture(page, `catalog-dark-en-${width}`);
    await page.getByLabel('Search algorithms',{exact:true}).fill('冒泡排序');
    await page.locator('.catalog-row').click();
    await page.getByRole('button', {name:'Run',exact:true}).click();
    await expect(page.locator('app-sorting-visualizer')).toBeVisible();
    await page.getByRole('button',{name:'Next step',exact:true}).click();
    await capture(page, `learning-dark-en-${width}`);
    await page.getByRole('button',{name:'Switch to light theme'}).click();
    await capture(page, `learning-light-en-${width}`);
  });
}
test('English stages cover every visualization type', async ({page}) => {
  test.slow(); await signIn(page);
  await page.getByRole('button',{name:'Switch to English',exact:true}).click();
  await page.getByRole('button',{name:'Switch to dark theme'}).click();
  for (const name of ['Quick sort','Merge sort','Heap sort','Insertion sort','Binary search','Breadth-first search (BFS)','Depth-first search (DFS)','Dijkstra shortest path','Prim minimum spanning tree','Kruskal minimum spanning tree','A* search','0/1 knapsack','N-queens','Karatsuba multiplication','3D data structures']) {
    await page.setViewportSize({width:1440,height:1000});
    await page.getByRole('navigation').getByRole('button',{name:'Explore',exact:true}).click();
    await page.getByLabel('Search algorithms',{exact:true}).fill(name);
    await page.locator('.catalog-row').click();
    await page.getByRole('button',{name:'Run',exact:true}).click();
    await expect(page.locator('.visualization-stage')).toBeVisible();
    if (['Quick sort','Binary search','Breadth-first search (BFS)','0/1 knapsack','N-queens','Karatsuba multiplication','3D data structures'].includes(name)) {
      for (const width of [390,768,1440]) {
        await page.setViewportSize({width,height:1000});
        await capture(page, 'type-dark-en-' + name.replace(/[^a-z0-9]+/gi,'-') + '-' + width);
      }
    }
    if (name !== '3D data structures') {
      await page.getByRole('button',{name:'Go to end',exact:true}).click();
      await expect(page.locator('.visualization-stage')).not.toContainText('完成');
    }
  }
});


test('system theme, keyboard switches, and reduced motion', async ({page}) => {
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  const theme = page.getByRole('button',{name:'切换为浅色主题'});
  await theme.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Switch to English',exact:true})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('.auth-layout')).toHaveCSS('animation-name','none');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('English native 3D prompts and comparison retain their operation IDs', async ({page}) => {
  await page.setViewportSize({width:1440,height:1000}); await signIn(page);
  await page.getByRole('button',{name:'Switch to English',exact:true}).click();
  await page.getByRole('button',{name:'Browse algorithms',exact:true}).click();
  await page.getByLabel('Search algorithms',{exact:true}).fill('3D data structures');
  await page.locator('.catalog-row').click();
  await page.getByRole('button',{name:'Run',exact:true}).click();
  const dialogHandled = page.waitForEvent('dialog').then(async dialog => {
    expect(dialog.message()).toBe('Enter the index to access'); await dialog.accept('0');
  });
  await page.getByRole('button',{name:'Access',exact:true}).click(); await dialogHandled;
  await expect(page.locator('app-vr-3d-visualizer')).toContainText('Access index 0; time complexity O(1).');
  await page.getByRole('navigation').getByRole('button',{name:'Explore',exact:true}).click();
  await page.getByLabel('Search algorithms',{exact:true}).fill('Quick sort');
  await page.locator('.catalog-row').click();
  await page.getByRole('button',{name:'Compare',exact:true}).click();
  await page.getByRole('button',{name:'Compare mode',exact:true}).click();
  await page.getByRole('group',{name:'Compare algorithm',exact:true}).getByRole('button',{name:'Bubble sort',exact:true}).click();
  await page.getByRole('button',{name:'Run comparison',exact:true}).click();
  await expect(page.locator('app-sorting-visualizer')).toHaveCount(2);
  await page.getByRole('button',{name:'切换为中文',exact:true}).click();
  await expect(page.locator('app-sorting-visualizer')).toHaveCount(2);
});
