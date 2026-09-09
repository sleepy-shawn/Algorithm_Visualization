import { TranslatePipe } from '../../i18n/translate.pipe';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { UiIconComponent } from '../ui-icon/ui-icon.component';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [TranslatePipe, CommonModule, UiIconComponent],
  templateUrl: './control-panel.component.html',
})
export class ControlPanelComponent {
  constructor(public store: AlgorithmStore) {}

  onSliderChange(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    this.store.setCurrentStep(val);
  }
}
