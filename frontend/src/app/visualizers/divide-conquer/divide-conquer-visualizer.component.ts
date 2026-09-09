import { TranslatePipe } from '../../i18n/translate.pipe';
import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { DivideConquerStep, DivideConquerTreeNode } from '../../models/algorithm.models';

@Component({
  selector: 'app-divide-conquer-visualizer',
  standalone: true,
  imports: [TranslatePipe, CommonModule],
  templateUrl: './divide-conquer-visualizer.component.html',
})
export class DivideConquerVisualizerComponent {
  step = computed(() => this.store.currentStepData() as DivideConquerStep | null);

  levels = computed(() => {
    const s = this.step();
    if (!s) return [];

    const map = new Map<number, DivideConquerTreeNode[]>();
    for (const node of s.tree) {
      if (!map.has(node.depth)) {
        map.set(node.depth, []);
      }
      map.get(node.depth)!.push(node);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([depth, nodes]) => ({ depth, nodes }));
  });

  pseudoCode = [
    'Karatsuba(x, y):',
    '  若 x 或 y 足够小，直接相乘',
    '  将 x 拆成 a×10^m + b，将 y 拆成 c×10^m + d',
    '  z2 = Karatsuba(a, c)',
    '  z0 = Karatsuba(b, d)',
    '  z1 = Karatsuba(a+b, c+d) - z2 - z0',
    '  return z2×10^(2m) + z1×10^m + z0',
    '输出计算结果',
  ];

  constructor(public store: AlgorithmStore) {}

  nodeClass(node: DivideConquerTreeNode): string {
    if (node.state === 'current') {
      return 'border-active bg-viz-pivot text-ink shadow-sm';
    }
    if (node.state === 'done') {
      return 'border-line bg-viz-success text-ink';
    }
    return 'border-line bg-subtle text-ink';
  }

  phaseLabel(phase?: string): string {
    const labels: Record<string, string> = {
      divide: '递归进入',
      split: '拆分',
      base: '直接相乘',
      z2: '高位乘法',
      z0: '低位乘法',
      z1: '交叉项',
      combine: '合并',
      finish: '完成',
    };
    return phase ? labels[phase] ?? phase : '-';
  }
}
