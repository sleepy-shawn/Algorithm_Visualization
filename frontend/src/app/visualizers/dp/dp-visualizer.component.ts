import { TranslatePipe } from '../../i18n/translate.pipe';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { DPStep } from '../../models/algorithm.models';

@Component({
  selector: 'app-dp-visualizer',
  standalone: true,
  imports: [TranslatePipe, UiIconComponent, CommonModule],
  templateUrl: './dp-visualizer.component.html',
})
export class DpVisualizerComponent {
  @Input() source: 'primary' | 'compare' = 'primary';

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
    if (!s) return 'bg-subtle';
    if (s.tracePath?.some(p => p[0] === i && p[1] === w)) return 'bg-viz-swap';
    if (i === s.currentItem && w === s.currentWeight) {
      return s.decision === 'take' ? 'bg-viz-success text-ink' :
             s.decision === 'skip' ? 'bg-viz-compare' : 'bg-viz-active text-ink';
    }
    return 'bg-subtle';
  }

  trackByRow(i: number) { return i; }
  trackByCol(i: number) { return i; }
}
