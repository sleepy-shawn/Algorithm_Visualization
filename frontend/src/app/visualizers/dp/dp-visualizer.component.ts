import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { DPStep } from '../../models/algorithm.models';
import { CodePanelComponent } from '../../components/code-panel/code-panel.component';

@Component({
  selector: 'app-dp-visualizer',
  standalone: true,
  imports: [CommonModule, CodePanelComponent],
  templateUrl: './dp-visualizer.component.html',
})
export class DpVisualizerComponent {
  @Input() source: 'primary' | 'compare' = 'primary';

  /** 与 DPService.generateSteps() 的 codeLine 1-6 对应。 */
  readonly pseudoCode = [
    '初始化 dp[0..n][0..capacity] = 0',
    '遍历每一个物品 i 和容量 w',
    'if weight[i] > w: dp[i][w] = dp[i - 1][w]',
    '比较“取”与“不取”两种价值',
    'dp[i][w] = max(不取, 取)',
    '从 dp[n][capacity] 回溯选中的物品',
  ];

  step = computed(() => {
    const data = this.source === 'primary'
      ? this.store.currentStepData()
      : this.store.compareCurrentStepData();
    return data as DPStep | null;
  });

  currentItemInfo = computed(() => {
    const s = this.step();
    const items = this.store.knapsackItems();
    if (!s || s.currentItem == null || s.currentItem <= 0) return null;
    const idx = s.currentItem - 1;
    return idx < items.length ? items[idx] : null;
  });

  recurrenceText = computed(() => {
    const s = this.step();
    const item = this.currentItemInfo();
    if (!s || !item || s.currentWeight == null || s.currentItem == null) {
      return 'dp[i][w] = max(dp[i-1][w],  dp[i-1][w-wᵢ] + vᵢ)';
    }
    const i = s.currentItem;
    const w = s.currentWeight;
    const wi = item.weight;
    const vi = item.value;
    if (w < wi) {
      return `dp[${i}][${w}] = dp[${i - 1}][${w}]  （w=${w} < wᵢ=${wi}，无法装入）`;
    }
    const prev = s.dp[i - 1]?.[w] ?? 0;
    const take = (s.dp[i - 1]?.[w - wi] ?? 0) + vi;
    return `dp[${i}][${w}] = max(dp[${i-1}][${w}]=${prev},  dp[${i-1}][${w-wi}]+${vi}=${take})`;
  });

  constructor(public store: AlgorithmStore) {}

  cellClass(i: number, w: number): string {
    const s = this.step();
    if (!s) return 'bg-slate-700';
    if (s.tracePath?.some(p => p[0] === i && p[1] === w)) return 'bg-yellow-600/60';
    if (i === s.currentItem && w === s.currentWeight) {
      return s.decision === 'take' ? 'bg-green-600' :
             s.decision === 'skip' ? 'bg-red-600/60' : 'bg-purple-600';
    }
    return 'bg-slate-700';
  }

  trackByRow(i: number) { return i; }
  trackByCol(i: number) { return i; }
}
