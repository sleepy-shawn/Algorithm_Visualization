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

  /**
   * 行号与 SortingService.quickSort() 返回的 codeLine 一一对应。
   * 后端当前会返回 1、3、5、7、8，未产生步骤的辅助行仍保留，方便学习者阅读完整流程。
   */
  readonly quickSortPseudoCode = [
    'pivot = arr[high]                 // 选择最后一个元素作基准',
    'i = low - 1                       // i 指向“小于等于基准”区域末尾',
    'for j = low to high - 1           // 逐个比较待分区元素',
    '  if arr[j] <= pivot',
    '    swap(arr[i + 1], arr[j])      // 当前元素放入左侧区域',
    '    i = i + 1',
    'swap(arr[i + 1], arr[high])       // 基准值归位',
    '完成快速排序',
  ];

  step = computed(() => {
    const data = this.source === 'primary'
      ? this.store.currentStepData()
      : this.store.compareCurrentStepData();
    return data as SortStep | null;
  });

  algorithmId = computed(() =>
    this.source === 'primary' ? this.store.selectedAlgo() : this.store.compareAlgo()
  );

  isQuickSort = computed(() => this.algorithmId() === 'quick-sort');

  constructor(public store: AlgorithmStore) {}

  barHeight(value: number): number {
    const step = this.step();
    if (!step) return 0;
    const max = Math.max(...step.array);
    return Math.max(4, (value / max) * 220);
  }

  barColor(index: number): string {
    const s = this.step();
    if (!s) return '#3b82f6';
    if (s.sorted?.includes(index)) return '#10b981';
    if (s.swapping?.includes(index)) return '#ef4444';
    if (s.comparing?.includes(index)) return '#f59e0b';
    if (s.pivot === index) return '#a855f7';
    return '#3b82f6';
  }

  trackByIndex(i: number) { return i; }
}
