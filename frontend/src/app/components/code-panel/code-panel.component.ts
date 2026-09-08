import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-panel.component.html',
})
export class CodePanelComponent {
  @Input({ required: true }) lines: readonly string[] = [];
  @Input({ required: true }) currentLine = 0;
  @Input() title = '当前执行代码';

  trackByIndex(index: number): number {
    return index;
  }
}
