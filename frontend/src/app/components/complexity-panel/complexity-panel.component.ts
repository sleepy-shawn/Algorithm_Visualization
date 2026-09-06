import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { STRUCTURE_INFO } from '../../visualizers/vr-3d/data/structure-info';
import { AlgorithmStore } from '../../store/algorithm.store';
import {
  SortStep, SearchStep, GraphStep, DPStep, NQueensStep, DivideConquerStep,
} from '../../models/algorithm.models';

interface MetricItem {
  label: string;
  value: number;
  color: string;
}
interface MetricsResult {
  items: MetricItem[];
}

interface AlgoInfo {
  time: string;
  worstTime: string;
  space: string;
}

const ALGO_INFO: Record<string, AlgoInfo> = {
  'quick-sort':     { time: 'O(n log n)', worstTime: 'O(n²)',      space: 'O(log n)' },
  'merge-sort':     { time: 'O(n log n)', worstTime: 'O(n log n)', space: 'O(n)' },
  'bubble-sort':    { time: 'O(n²)',      worstTime: 'O(n²)',      space: 'O(1)' },
  'heap-sort':      { time: 'O(n log n)', worstTime: 'O(n log n)', space: 'O(1)' },
  'insertion-sort': { time: 'O(n²)',      worstTime: 'O(n²)',      space: 'O(1)' },
  'binary-search':  { time: 'O(log n)',   worstTime: 'O(log n)',   space: 'O(1)' },
  'bfs':            { time: 'O(V+E)',     worstTime: 'O(V+E)',     space: 'O(V)' },
  'dfs':            { time: 'O(V+E)',     worstTime: 'O(V+E)',     space: 'O(V)' },
  'dijkstra':       { time: 'O((V+E)logV)', worstTime: 'O((V+E)logV)', space: 'O(V)' },
  'prim':           { time: 'O(E log V)', worstTime: 'O(E log V)', space: 'O(V)' },
  'kruskal':        { time: 'O(E log E)', worstTime: 'O(E log E)', space: 'O(V)' },
  'astar':          { time: 'O(E log V)', worstTime: 'O(b^d)',     space: 'O(b^d)' },
  'knapsack':       { time: 'O(nW)',      worstTime: 'O(nW)',      space: 'O(nW)' },
  'n-queens':       { time: 'O(n!)',      worstTime: 'O(n!)',      space: 'O(n)' },
  'karatsuba':      { time: 'O(n^log₂3)', worstTime: 'O(n^1.585)', space: 'O(log n)' },
};

@Component({
  selector: 'app-complexity-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complexity-panel.component.html',
})
export class ComplexityPanelComponent {
  @Input() source: 'primary' | 'compare' = 'primary';
  readonly structureInfo = computed(() => this.store.category() === 'vr-3d' ? STRUCTURE_INFO[this.store.vr3dStructure()] : null);
  constructor(
      public store: AlgorithmStore
  ) {
  }

  algoInfo = computed<AlgoInfo | null>(() => ALGO_INFO[this.source === 'primary' ? this.store.selectedAlgo() : this.store.compareAlgo()] ?? null);

  // ---- Metrics extracted from current step ----
  metrics = computed<MetricsResult | null>(() => {
    const step = this.source === 'primary' ? this.store.currentStepData() : this.store.compareCurrentStepData();
    const cat = this.store.category();
    if (!step) return null;

    if (cat === 'sorting') {
      const s = step as SortStep;
      return {
        items: [
          {label: '比较次数', value: s.comparisons, color: 'yellow'},
          {label: '交换次数', value: s.swaps, color: 'purple'},
          {label: '访问次数', value: s.accesses, color: 'blue'},
        ],
      };
    }
    if (cat === 'search') {
      const s = step as SearchStep;
      return {
        items: [
          {label: '比较次数', value: s.comparisons, color: 'yellow'},
        ],
      };
    }
    if (cat === 'graph') {
      const s = step as GraphStep;
      return {
        items: [
          {label: '已访问节点', value: s.visitedCount, color: 'green'},
          {label: '比较次数', value: s.comparisons, color: 'yellow'},
        ],
      };
    }
    if (cat === 'dp') {
      const s = step as DPStep;
      return {
        items: [
          {label: '子问题计算', value: s.comparisons, color: 'yellow'},
        ],
      };
    }
    if (cat === 'backtracking') {
      const s = step as NQueensStep;
      return {
        items: [
          {label: '回溯次数', value: s.backtracks, color: 'red'},
          {label: '解的数量', value: s.solutionsFound, color: 'green'},
        ],
      };
    }
    if (cat === 'divide-conquer') {
      const s = step as DivideConquerStep;

      return {
        items: [
          {label: '基础乘法', value: s.multiplications, color: 'yellow'},
          {label: '加减/组合', value: s.additions, color: 'blue'},
          {label: '递归深度', value: s.depth, color: 'green'},
        ],
      };
    }
    return null;
  });

  metricTextColor(color: string): string {
    return ({
      yellow: 'text-compare',
      red: 'text-danger',
      purple: 'text-swap',
      blue: 'text-active',
      green: 'text-success',
    } as Record<string, string>)[color] ?? 'text-muted';
  }
}
