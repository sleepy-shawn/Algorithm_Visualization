import { TestBed } from '@angular/core/testing';
import { PreferencesService } from './preferences.service';

describe('Display preferences', () => {
  beforeEach(() => { localStorage.removeItem('algorithm-viz-theme'); localStorage.removeItem('algorithm-viz-language'); });
  afterEach(() => { localStorage.removeItem('algorithm-viz-theme'); localStorage.removeItem('algorithm-viz-language'); document.documentElement.lang = 'zh-CN'; document.documentElement.dataset['theme'] = 'light'; });
  it('persists selections, updates document semantics, and reloads them', () => {
    const p = TestBed.inject(PreferencesService);
    p.setLanguage('en'); p.setTheme('dark');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    const restored = new PreferencesService();
    expect(restored.language()).toBe('en'); expect(restored.theme()).toBe('dark');
  });
  it('translates parameterized steps without changing values or user labels', () => {
    const p = TestBed.inject(PreferencesService); p.setLanguage('en');
    expect(p.t('交换 arr[1]↔arr[2]（现在为 20, 28）')).toBe('Swap arr[1] and arr[2] (now 20, 28).');
    expect(p.t('BFS 初始化，将起点 起点甲 加入队列')).toBe('Initialize BFS: enqueue start node 起点甲.');
    expect(p.t('{0} 个算法', [16])).toBe('16 algorithms');
    p.setLanguage('zh');
    expect(p.t('交换 arr[1]↔arr[2]（现在为 20, 28）')).toBe('交换 arr[1]↔arr[2]（现在为 20, 28）');
  });
  it('keeps unknown messages visible and rejects invalid saved preferences', () => {
    localStorage.setItem('algorithm-viz-language', 'invalid'); localStorage.setItem('algorithm-viz-theme', 'invalid');
    const p = TestBed.inject(PreferencesService); expect(p.language()).toBe('zh');
    p.setLanguage('en'); expect(p.t('new server message')).toBe('new server message');
  });
  it('continues to switch when preference storage is unavailable', () => {
    spyOn(Storage.prototype, 'setItem').and.throwError('blocked');
    const p = TestBed.inject(PreferencesService); p.setLanguage('en'); p.setTheme('dark');
    expect(p.t('首页')).toBe('Home'); expect(p.theme()).toBe('dark');
  });
});
