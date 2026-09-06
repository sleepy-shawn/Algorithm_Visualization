import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ALGORITHM_GROUPS } from '../../data/algorithm-catalog';
import { AlgorithmId } from '../../models/algorithm.models';

@Component({
  selector: 'app-algorithm-catalog',
  standalone: true,
  imports: [UiIconComponent, CommonModule, FormsModule],
  templateUrl: './algorithm-catalog.component.html',
})
export class AlgorithmCatalogComponent {
  readonly groups = ALGORITHM_GROUPS;
  readonly entries = ALGORITHM_GROUPS.flatMap(group => group.items.map(item => ({ ...item, category: group.category })));
  readonly query = signal('');
  readonly category = signal('');
  @Input() set initialCategory(value: string) { this.category.set(value); }
  @Output() learn = new EventEmitter<AlgorithmId>();
  readonly filtered = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return this.entries.filter(item => (!this.category() || item.category === this.category())
      && (!query || `${item.label} ${item.id}`.toLocaleLowerCase().includes(query)));
  });
  clear(): void { this.query.set(''); this.category.set(''); }
}
