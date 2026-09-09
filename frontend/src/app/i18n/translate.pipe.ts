import { Pipe, PipeTransform, inject } from '@angular/core';
import { PreferencesService } from './preferences.service';

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly preferences = inject(PreferencesService);
  transform(value: unknown, args: unknown[] = []): string { return this.preferences.t(value, args); }
}
