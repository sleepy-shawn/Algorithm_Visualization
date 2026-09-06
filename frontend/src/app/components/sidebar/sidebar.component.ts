import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { Component, computed, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { AlgorithmId } from '../../models/algorithm.models';
import { ALGORITHM_GROUPS } from '../../data/algorithm-catalog';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [UiIconComponent, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  groups = ALGORITHM_GROUPS;
  @Output() selected = new EventEmitter<void>();

  compareSiblings = computed(() => {
    const cat = this.store.category();
    const allItems = this.groups.flatMap(group => group.items);
    return allItems.filter(item => {
      const itemCat = this.store.getCategoryForAlgo(item.id);
      return itemCat === cat && item.id !== this.store.selectedAlgo();
    });
  });

  constructor(public store: AlgorithmStore) {}

  select(id: AlgorithmId): void {
    this.store.setAlgorithm(id);
    this.store.setActivePanel('visualizer');
    this.selected.emit();
  }

  selectCompare(id: AlgorithmId): void {
    this.store.compareAlgo.set(id);
  }
}
