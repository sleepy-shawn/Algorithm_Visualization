import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { SearchStep } from '../../models/algorithm.models';
import { CodePanelComponent } from '../../components/code-panel/code-panel.component';

@Component({
  selector: 'app-search-visualizer',
  standalone: true,
  imports: [CommonModule, CodePanelComponent],
  templateUrl: './search-visualizer.component.html',
})
export class SearchVisualizerComponent {
  @Input() source: 'primary' | 'compare' = 'primary';

  /** 与 SearchService.binarySearch() 的 codeLine 1-6 对应。 */
  readonly pseudoCode = [
    'left = 0; right = array.length - 1',
    'mid = (left + right) / 2',
    'if array[mid] == target: return mid',
    'if array[mid] < target: left = mid + 1',
    'else: right = mid - 1',
    'return -1',
  ];

  step = computed(() => {
    const data = this.source === 'primary'
      ? this.store.currentStepData()
      : this.store.compareCurrentStepData();
    return data as SearchStep | null;
  });

  constructor(public store: AlgorithmStore) {}

  cellColor(index: number): string {
    const s = this.step();
    if (!s) return 'bg-slate-700';
    if (s.found && index === s.mid) return 'bg-green-600';
    if (index === s.mid)   return 'bg-purple-600';
    if (index === s.left || index === s.right) return 'bg-yellow-600/60';
    if (s.eliminated === 'left'  && index < s.mid)  return 'bg-slate-800 opacity-40';
    if (s.eliminated === 'right' && index > s.mid)  return 'bg-slate-800 opacity-40';
    if (index >= s.left && index <= s.right) return 'bg-blue-700/60';
    return 'bg-slate-700 opacity-30';
  }

  trackByIndex(i: number) { return i; }
}
