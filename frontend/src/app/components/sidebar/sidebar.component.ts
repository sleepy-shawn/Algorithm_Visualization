import { TranslatePipe } from '../../i18n/translate.pipe';
import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { Component, computed, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { AlgorithmId } from '../../models/algorithm.models';
import { ALGORITHM_GROUPS } from '../../data/algorithm-catalog';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [TranslatePipe, UiIconComponent, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  groups = ALGORITHM_GROUPS;
  openGroup: string | null = null;
  private trigger?: HTMLButtonElement;
  readonly shortNames: Record<string, string> = {
    '排序算法': '排序', '搜索算法': '搜索', '贪心算法': '贪心', '图算法': '图',
    '动态规划': '动态规划', '回溯算法': '回溯', '分治算法': '分治', 'Web3D': '3D',
  };
  readonly activeGroup = computed(() => this.groups.find(group => group.items.some(item => item.id === this.store.selectedAlgo()))?.category);

  toggle(group: string, event: Event): void {
    this.trigger = event.currentTarget as HTMLButtonElement;
    this.openGroup = this.openGroup === group ? null : group;
  }

  close(restoreFocus = false): void {
    this.openGroup = null;
    if (restoreFocus) this.trigger?.focus();
  }

  @HostListener('document:click', ['$event']) outside(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) this.close();
  }

  @HostListener('focusout', ['$event']) focusOut(event: FocusEvent): void {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null)) this.close();
  }

  @HostListener('keydown.escape', ['$event']) escape(event: Event): void {
    if (this.openGroup) { event.preventDefault(); event.stopPropagation(); this.close(true); }
  }

  compareSiblings = computed(() => {
    const cat = this.store.category();
    const allItems = this.groups.flatMap(group => group.items);
    return allItems.filter(item => {
      const itemCat = this.store.getCategoryForAlgo(item.id);
      return itemCat === cat && item.id !== this.store.selectedAlgo();
    });
  });

  constructor(public store: AlgorithmStore, private element: ElementRef<HTMLElement>) {}

  select(id: AlgorithmId): void {
    this.store.setAlgorithm(id);
    this.store.setActivePanel('visualizer');
    this.close(true);
  }

  selectCompare(id: AlgorithmId): void {
    this.store.compareAlgo.set(id);
  }
}
