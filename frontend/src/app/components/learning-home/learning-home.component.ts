import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ALGORITHM_GROUPS } from '../../data/algorithm-catalog';
import { AlgorithmId } from '../../models/algorithm.models';

@Component({
  selector: 'app-learning-home',
  standalone: true,
  imports: [UiIconComponent, CommonModule],
  templateUrl: './learning-home.component.html',
})
export class LearningHomeComponent {
  readonly groups = ALGORITHM_GROUPS;
  readonly entryCount = ALGORITHM_GROUPS.reduce((count, group) => count + group.items.length, 0);
  readonly exampleSteps = [
    { label: '比较', values: [16, 28, 20, 10, 32], highlight: 'bg-viz-compare' },
    { label: '交换', values: [16, 20, 28, 10, 32], highlight: 'bg-viz-swap' },
  ];
  readonly descriptions: Partial<Record<AlgorithmId, string>> = {
    'bubble-sort': '相邻比较，逐个交换',
    'quick-sort': '选定基准，分区排序',
    'binary-search': '每次排除一半范围',
  };
  readonly featured = ALGORITHM_GROUPS.flatMap(group => group.items)
    .filter(item => ['bubble-sort', 'quick-sort', 'binary-search'].includes(item.id));
  @Output() browse = new EventEmitter<string>();
  @Output() learn = new EventEmitter<AlgorithmId>();
}
