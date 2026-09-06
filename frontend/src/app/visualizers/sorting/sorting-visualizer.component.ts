import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { SortStep } from '../../models/algorithm.models';

@Component({
  selector: 'app-sorting-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sorting-visualizer.component.html',
})
export class SortingVisualizerComponent {
  @Input() source: 'primary' | 'compare' = 'primary';

  step = computed(() => {
    const data = this.source === 'primary'
      ? this.store.currentStepData()
      : this.store.compareCurrentStepData();
    return data as SortStep | null;
  });

  constructor(public store: AlgorithmStore) {}

  barHeight(value: number): number {
    const step = this.step();
    if (!step) return 0;
    const max = Math.max(...step.array);
    return Math.max(4, (value / max) * 220);
  }

  barColor(index: number): string {
    const s = this.step();
    if (!s) return 'rgb(var(--viz-neutral))';
    if (s.sorted?.includes(index)) return 'rgb(var(--viz-success))';
    if (s.swapping?.includes(index)) return 'rgb(var(--viz-swap))';
    if (s.comparing?.includes(index)) return 'rgb(var(--viz-compare))';
    if (s.pivot === index) return 'rgb(var(--viz-pivot))';
    return 'rgb(var(--viz-neutral))';
  }

  trackByIndex(i: number) { return i; }
}
