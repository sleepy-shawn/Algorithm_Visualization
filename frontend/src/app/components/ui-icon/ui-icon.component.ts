import { Component, Input } from '@angular/core';

export type UiIconName = 'sun' | 'moon' | 'input' | 'shuffle' | 'play' | 'pause' | 'first' | 'previous' | 'next' | 'last' | 'reset' | 'arrow-right' | 'arrow-left' | 'chevron-down' | 'close' | 'check' | 'sort' | 'search' | 'target' | 'graph' | 'grid' | 'backtrack' | 'branch' | 'cube';

@Component({
  selector: 'app-ui-icon',
  standalone: true,
  template: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path [attr.d]="paths[name]" /></svg>`,
  styles: [':host { display: inline-flex; flex-shrink: 0; vertical-align: middle; }'],
})
export class UiIconComponent {
  @Input() name: UiIconName = 'input';
  readonly paths: Record<UiIconName, string> = {
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5 19 19 M5 19l1.5-1.5 M17.5 6.5 19 5',
    moon: 'M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z',
    'arrow-right': 'M4 12h16 M14 6l6 6-6 6',
    'arrow-left': 'M20 12H4 M10 6l-6 6 6 6',
    'chevron-down': 'M6 9l6 6 6-6',
    close: 'M6 6l12 12 M18 6 6 18',
    check: 'M5 12l4 4L19 6',
    sort: 'M5 5v14 M2 16l3 3 3-3 M11 6h10 M11 12h7 M11 18h4',
    search: 'M16 16l5 5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    target: 'M21 12a9 9 0 1 1-9-9 M17 12a5 5 0 1 1-5-5 M12 12l9-9 M16 3h5v5',
    graph: 'M5 7l7 10 7-10 M7 5h10 M7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0 M21 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0 M14 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
    grid: 'M4 4h16v16H4Z M4 10h16 M10 4v16 M4 15h16 M15 4v16',
    backtrack: 'M8 4 3 9l5 5 M3 9h11a6 6 0 0 1 0 12h-3',
    branch: 'M12 3v7 M5 20v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v5 M2 17l3 3 3-3 M16 17l3 3 3-3',
    cube: 'M12 3 3 8v9l9 5 9-5V8Z M3 8l9 5 9-5 M12 13v9 M7.5 5.5l9 5',
    input: 'M7 5H4v14h3 M17 5h3v14h-3 M8 10v4 M12 10v4 M16 10v4',
    shuffle: 'M3 7h3c4 0 8 10 12 10h3 M18 14l3 3-3 3 M3 17h3c1.5 0 3-1.5 4.5-3.5 M13.5 10.5C15 8.5 16.5 7 18 7h3 M18 4l3 3-3 3',
    play: 'M8 5l11 7-11 7Z',
    pause: 'M8 5v14 M16 5v14',
    first: 'M5 5v14 M19 5l-10 7 10 7Z',
    previous: 'M15 5l-8 7 8 7',
    next: 'M9 5l8 7-8 7',
    last: 'M19 5v14 M5 5l10 7-10 7Z',
    reset: 'M3 10a9 9 0 1 1 2 8 M3 4v6h6',
  };
}
