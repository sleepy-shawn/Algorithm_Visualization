import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { NQueensStep } from '../../models/algorithm.models';

@Component({
  selector: 'app-n-queens-visualizer',
  standalone: true,
  imports: [UiIconComponent, CommonModule],
  templateUrl: './n-queens-visualizer.component.html',
})
export class NQueensVisualizerComponent {
  @Input() source: 'primary' | 'compare' = 'primary';

  step = computed(() => {
    const data = this.source === 'primary'
      ? this.store.currentStepData()
      : this.store.compareCurrentStepData();
    return data as NQueensStep | null;
  });

  rows = computed(() => {
    const s = this.step();
    if (!s) return [];
    return Array.from({ length: s.n }, (_, i) => i);
  });

  cols = computed(() => {
    const s = this.step();
    if (!s) return [];
    return Array.from({ length: s.n }, (_, i) => i);
  });

  constructor(public store: AlgorithmStore) {}

  hasQueen(row: number, col: number): boolean {
    const s = this.step();
    return !!s && s.board[row] === col;
  }

  isConflict(row: number, col: number): boolean {
    const s = this.step();
    return !!s && s.conflicts?.some(c => c[0] === row && c[1] === col);
  }

  isPlacing(row: number, col: number): boolean {
    const s = this.step();
    return !!s && !!s.placing && s.placing[0] === row && s.placing[1] === col;
  }

  isRemoving(row: number, col: number): boolean {
    const s = this.step();
    return !!s && !!s.removing && s.removing[0] === row && s.removing[1] === col;
  }

  cellClass(row: number, col: number): string {
    const isDark = (row + col) % 2 === 1;
    if (this.isConflict(row, col)) return 'bg-viz-danger';
    if (this.isPlacing(row, col))  return 'bg-viz-success';
    if (this.isRemoving(row, col)) return 'bg-viz-pivot';
    return isDark ? 'bg-subtle' : 'bg-surface';
  }

  trackByNum(i: number) { return i; }
}
