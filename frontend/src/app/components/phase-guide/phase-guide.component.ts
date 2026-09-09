import { TranslatePipe } from '../../i18n/translate.pipe';
import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';

@Component({
  selector: 'app-phase-guide',
  standalone: true,
  imports: [TranslatePipe, UiIconComponent, CommonModule],
  templateUrl: './phase-guide.component.html',
})
export class PhaseGuideComponent {
  phases = computed(() => {
    const config = this.store.phaseConfig();
    return config.sequence.map(id => ({
      id,
      label: config.labels[id] ?? id,
    }));
  });

  currentIdx = computed(() => this.store.currentPhaseIndex());

  constructor(public store: AlgorithmStore) {}
}
