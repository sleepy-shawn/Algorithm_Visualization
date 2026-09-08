import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { NQueensStep } from '../../models/algorithm.models';
import { CodePanelComponent } from '../../components/code-panel/code-panel.component';

@Component({
  selector: 'app-n-queens-visualizer',
  standalone: true,
  imports: [CommonModule, CodePanelComponent],
  templateUrl: './n-queens-visualizer.component.html',
})
export class NQueensVisualizerComponent {
  @Input() source: 'primary' | 'compare' = 'primary';

  /** 与 BacktrackingService.nQueens() 的 codeLine 1-6 对应。 */
  readonly pseudoCode = [
    '初始化空棋盘，从第 0 行开始',
    'if row == n: 记录一个解',
    '依次尝试当前行的每一列',
    '若安全，在该位置放置皇后并递归下一行',
    '撤销皇后，继续尝试下一列',
    '输出全部解，算法完成',
  ];

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
    if (this.isConflict(row, col)) return 'bg-red-700/60';
    if (this.isPlacing(row, col))  return 'bg-green-600/60';
    if (this.isRemoving(row, col)) return 'bg-red-600/60';
    return isDark ? 'bg-slate-700' : 'bg-slate-800';
  }

  trackByNum(i: number) { return i; }
}
