import { Injectable, signal } from '@angular/core';
import { ENGLISH } from './translations';

export type Language = 'zh' | 'en';
export type Theme = 'light' | 'dark';
const read = (key: string): string | null => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string): void => { try { localStorage.setItem(key, value); } catch { /* Preferences still work for this visit. */ } };

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly language = signal<Language>(read('algorithm-viz-language') === 'en' ? 'en' : 'zh');
  readonly theme = signal<Theme>(this.initialTheme());
  private readonly patterns = Object.entries(ENGLISH).filter(([key]) => /\{\d+\}/.test(key)).map(([key, value]) => {
    const indices: number[] = [];
    const pattern = key.split(/(\{\d+\})/).map(part => {
      if (/^\{\d+\}$/.test(part)) { indices.push(Number(part.slice(1, -1))); return '(.*?)'; }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('');
    return { regex: new RegExp('^' + pattern + '$', 's'), indices, value };
  });

  constructor() { this.apply(); }
  setLanguage(value: Language): void { this.language.set(value); write('algorithm-viz-language', value); this.apply(); }
  setTheme(value: Theme): void { this.theme.set(value); write('algorithm-viz-theme', value); this.apply(); }
  toggleLanguage(): void { this.setLanguage(this.language() === 'zh' ? 'en' : 'zh'); }
  toggleTheme(): void { this.setTheme(this.theme() === 'light' ? 'dark' : 'light'); }
  english(text: string): string {
    if (ENGLISH[text] !== undefined) return ENGLISH[text];
    const trimmed = text.trim();
    if (ENGLISH[trimmed] !== undefined) return text.replace(trimmed, ENGLISH[trimmed]);
    for (const pattern of this.patterns) {
      const match = trimmed.match(pattern.regex);
      if (match) return pattern.value.replace(/\{(\d+)\}/g, (_, index) => match[pattern.indices.indexOf(Number(index)) + 1] ?? '');
    }
    return text;
  }
  t(value: unknown, args: unknown[] = []): string {
    if (Array.isArray(value)) return value.map(item => this.t(item)).join(this.language() === 'en' ? ', ' : '、');
    const text = value == null ? '' : String(value);
    const translated = this.language() === 'en' ? this.english(text) : text;
    return translated.replace(/\{(\d+)\}/g, (placeholder, index) => args[index] == null ? placeholder : String(args[index]));
  }
  private initialTheme(): Theme {
    const saved = read('algorithm-viz-theme');
    return saved === 'dark' || saved === 'light' ? saved : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  private apply(): void {
    document.documentElement.dataset['theme'] = this.theme();
    document.documentElement.lang = this.language() === 'zh' ? 'zh-CN' : 'en';
    document.title = this.language() === 'zh' ? '算法可视化学习平台' : 'Algorithm Studio';
  }
}
