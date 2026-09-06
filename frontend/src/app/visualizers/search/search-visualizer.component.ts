import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { SearchStep } from '../../models/algorithm.models';

@Component({
  selector: 'app-search-visualizer',
  standalone: true,
  imports: [UiIconComponent, CommonModule],
  templateUrl: './search-visualizer.component.html',
})
export class SearchVisualizerComponent {
  @Input() source: 'primary' | 'compare' = 'primary';

  step = computed(() => {
    const data = this.source === 'primary'
      ? this.store.currentStepData()
      : this.store.compareCurrentStepData();
    return data as SearchStep | null;
  });

  constructor(public store: AlgorithmStore) {}

  cellColor(index: number): string {
    const s = this.step();
    if (!s) return 'bg-subtle';
    if (s.found && index === s.mid) return 'bg-viz-success text-ink';
    if (index === s.mid)   return 'bg-viz-swap text-ink';
    if (index === s.left || index === s.right) return 'bg-viz-compare';
    if (s.eliminated === 'left'  && index < s.mid)  return 'bg-subtle opacity-40';
    if (s.eliminated === 'right' && index > s.mid)  return 'bg-subtle opacity-40';
    if (index >= s.left && index <= s.right) return 'bg-viz-neutral';
    return 'bg-subtle opacity-30';
  }

  trackByIndex(i: number) { return i; }
}
