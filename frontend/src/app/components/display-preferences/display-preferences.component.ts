import { Component, inject } from '@angular/core';
import { PreferencesService } from '../../i18n/preferences.service';
import { UiIconComponent } from '../ui-icon/ui-icon.component';

@Component({
  selector: 'app-display-preferences',
  standalone: true,
  imports: [UiIconComponent],
  template: `
    <div class="display-preferences" role="group" [attr.aria-label]="p.language() === 'zh' ? '显示偏好' : 'Display preferences'">
      <button class="preference-button icon-tooltip" type="button" (click)="p.toggleTheme()"
        [attr.aria-label]="themeLabel" [attr.data-tooltip]="themeLabel" [attr.aria-pressed]="p.theme() === 'dark'">
        <app-ui-icon [name]="p.theme() === 'light' ? 'moon' : 'sun'" />
      </button>
      <button class="preference-button language-button" type="button" (click)="p.toggleLanguage()"
        [attr.aria-label]="p.language() === 'zh' ? 'Switch to English' : '切换为中文'" [attr.lang]="p.language() === 'zh' ? 'en' : 'zh-CN'">
        {{ p.language() === 'zh' ? 'EN' : '中文' }}
      </button>
    </div>`,
})
export class DisplayPreferencesComponent {
  readonly p = inject(PreferencesService);
  get themeLabel(): string {
    return this.p.language() === 'zh' ? (this.p.theme() === 'light' ? '切换为深色主题' : '切换为浅色主题') : (this.p.theme() === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }
}
